import 'dart:async';
import 'dart:developer';

import '../datasources/attendance_local_data_source.dart';
import '../datasources/attendance_remote_data_source.dart';
import '../models/attendance_model.dart';

// Placeholder imports for domain and core layers.
// In a real app, these would point to the actual files.
import '../../domain/repositories/attendance_repository.dart';
import '../../core/network/network_info.dart';
import '../../core/error/failures.dart';
import 'package:dartz/dartz.dart'; // Assuming usage of dartz for Either

/// ## Attendance Repository Implementation
///
/// This is the concrete implementation of the `AttendanceRepository`. It is the
/// core orchestrator, deciding whether to use the remote or local data source
/// based on network connectivity and managing the automatic synchronization process.
/// It provides a single source of truth to the application's domain layer.
class AttendanceRepositoryImpl implements AttendanceRepository {
  final AttendanceRemoteDataSource _remoteDataSource;
  final AttendanceLocalDataSource _localDataSource;
  final NetworkInfo _networkInfo;
  StreamSubscription? _connectivitySubscription;

  AttendanceRepositoryImpl({
    required AttendanceRemoteDataSource remoteDataSource,
    required AttendanceLocalDataSource localDataSource,
    required NetworkInfo networkInfo,
  })  : _remoteDataSource = remoteDataSource,
        _localDataSource = localDataSource,
        _networkInfo = networkInfo {
    // Immediately start listening for connectivity changes to enable auto-sync.
    _listenForConnectivityChanges();
  }

  /// Sets up a listener that triggers the sync process when the device comes online.
  void _listenForConnectivityChanges() {
    _connectivitySubscription?.cancel(); // Cancel any existing subscription
    _connectivitySubscription = _networkInfo.onConnectivityChanged.listen((isConnected) {
      if (isConnected) {
        log('[AttendanceRepository] Network connection detected. Starting sync...');
        _syncQueuedRecords();
      } else {
        log('[AttendanceRepository] Network connection lost.');
      }
    });
  }

  /// Synchronizes records from the local queue to the remote data source.
  ///
  /// This method fetches all queued records, attempts to upload each one,
  /// and deletes the local copy only upon successful upload. Errors are logged
  /// without halting the process for other records.
  Future<void> _syncQueuedRecords() async {
    final queuedRecords = await _localDataSource.getQueuedRecords();

    if (queuedRecords.isEmpty) {
      log('[AttendanceRepository] Sync check: No records in queue.');
      return;
    }

    log('[AttendanceRepository] Syncing ${queuedRecords.length} records...');
    for (final record in queuedRecords) {
      try {
        // Use a record with 'Synced' status for the remote call
        final recordToSync = record.copyWith(syncStatus: 'Synced');
        await _remoteDataSource.createOrUpdateAttendanceRecord(recordToSync);
        // If the remote call succeeds, delete the record from the local queue
        await _localDataSource.deleteQueuedRecord(record.attendanceId);
        log('[AttendanceRepository] Successfully synced record: ${record.attendanceId}');
      } catch (e) {
        // If sync fails, log the error and leave the record in the queue for the next attempt.
        log('[AttendanceRepository] Failed to sync record ${record.attendanceId}: $e');
        // Optionally, update the record's status to 'Failed' in the local DB
        // for more granular error handling on the UI, but for now we just retry.
      }
    }
    log('[AttendanceRepository] Sync process finished.');
  }

  @override
  Future<Either<Failure, void>> markAttendance(AttendanceModel record) async {
    try {
      final isConnected = await _networkInfo.isConnected;
      if (isConnected) {
        log('[AttendanceRepository] Online: Marking attendance directly to remote.');
        final syncedRecord = record.copyWith(syncStatus: 'Synced');
        await _remoteDataSource.createOrUpdateAttendanceRecord(syncedRecord);
      } else {
        log('[AttendanceRepository] Offline: Queuing attendance record locally.');
        final queuedRecord = record.copyWith(syncStatus: 'Queued');
        await _localDataSource.queueAttendanceRecord(queuedRecord);
      }
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(message: e.toString()));
    }
  }

  @override
  Stream<Either<Failure, List<AttendanceModel>>> watchAttendanceHistory(String userId) {
    return _remoteDataSource.getAttendanceHistoryStream(userId).map(
      (attendanceList) => Right<Failure, List<AttendanceModel>>(attendanceList),
    ).handleError((error) => Left<Failure, List<AttendanceModel>>(ServerFailure(message: error.toString())));
  }

  @override
  Stream<Either<Failure, AttendanceModel?>> watchActiveAttendanceRecord(String userId) {
    return _remoteDataSource.getActiveAttendanceRecordStream(userId).map(
      (attendance) => Right<Failure, AttendanceModel?>(attendance),
    ).handleError((error) => Left<Failure, AttendanceModel?>(ServerFailure(message: error.toString())));
  }
  
  /// Call this method when the repository is disposed to prevent memory leaks.
  void dispose() {
    _connectivitySubscription?.cancel();
  }
}
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/attendance_model.dart';
import 'attendance_remote_data_source.dart';

// These are placeholder imports. In a real app, they would point to actual files.
import 'package:flutter/foundation.dart' show immutable; // Placeholder for AuthService
import '../../core/error/exceptions.dart'; // Placeholder for custom exceptions

// Placeholder for AuthService. In a real app, this would be a proper service.
@immutable
abstract class AuthService {
  String? get tenantId;
}

/// ## Firestore Attendance Data Source Implementation
///
/// This is the concrete implementation of `AttendanceRemoteDataSource` that
/// interacts with the Firebase Firestore service. It handles the logic for
/// writing and reading `AttendanceModel` objects to and from the correct
/// multi-tenant Firestore collection.
class FirestoreAttendanceDataSourceImpl implements AttendanceRemoteDataSource {
  final FirebaseFirestore _firestore;
  final AuthService _authService;

  FirestoreAttendanceDataSourceImpl({
    required FirebaseFirestore firestore,
    required AuthService authService,
  })  : _firestore = firestore,
        _authService = authService;

  /// Retrieves the current user's tenant-specific attendance collection.
  ///
  /// This helper method enforces the multi-tenant architecture by ensuring
  /// all data operations are scoped to the authenticated user's tenant.
  ///
  /// Throws [UnauthenticatedException] if the tenant ID is not available.
  CollectionReference<Map<String, dynamic>> _getAttendanceCollectionRef() {
    final tenantId = _authService.tenantId;
    if (tenantId == null || tenantId.isEmpty) {
      throw UnauthenticatedException('User is not associated with a tenant.');
    }
    return _firestore.collection('tenants').doc(tenantId).collection('attendance');
  }

  @override
  Future<void> createOrUpdateAttendanceRecord(AttendanceModel record) async {
    try {
      final collection = _getAttendanceCollectionRef();
      await collection.doc(record.attendanceId).set(record.toFirestoreMap());
    } on FirebaseException catch (e) {
      // Catch specific Firestore errors and wrap them in a generic ServerException.
      throw ServerException('Failed to save attendance record: ${e.message}');
    } catch (e) {
      // Catch other errors, including the UnauthenticatedException.
      throw ServerException(e.toString());
    }
  }

  @override
  Stream<List<AttendanceModel>> getAttendanceHistoryStream(String userId) {
    try {
      final collection = _getAttendanceCollectionRef();
      return collection
          .where('userId', isEqualTo: userId)
          .orderBy('clientCheckInTimestamp', descending: true)
          .snapshots()
          .map((snapshot) => snapshot.docs
              .map((doc) => AttendanceModel.fromFirestore(doc))
              .toList());
    } catch (e) {
      // Return a stream that emits an error.
      return Stream.error(ServerException(e.toString()));
    }
  }

  @override
  Stream<AttendanceModel?> getActiveAttendanceRecordStream(String userId) {
    try {
      final collection = _getAttendanceCollectionRef();
      return collection
          .where('userId', isEqualTo: userId)
          .where('clientCheckOutTimestamp', isEqualTo: null)
          .limit(1)
          .snapshots()
          .map((snapshot) {
        if (snapshot.docs.isNotEmpty) {
          return AttendanceModel.fromFirestore(snapshot.docs.first);
        } else {
          return null;
        }
      });
    } catch (e) {
      return Stream.error(ServerException(e.toString()));
    }
  }
}
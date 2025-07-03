import '../models/attendance_model.dart';

/// ## Attendance Local Data Source Interface
///
/// Defines the contract for managing the offline queue in the local data store (Hive).
/// This interface abstracts the logic for queueing offline records, retrieving
/// them for synchronization, and managing their local state. This contract is
/// crucial for the offline-first strategy.
abstract class AttendanceLocalDataSource {
  /// Adds an attendance record to the local queue for later synchronization.
  ///
  /// Throws a `CacheException` on failure.
  Future<void> queueAttendanceRecord(AttendanceModel record);

  /// Retrieves all records currently in the queue.
  ///
  /// Throws a `CacheException` on failure.
  Future<List<AttendanceModel>> getQueuedRecords();

  /// Removes a record from the queue, typically after a successful sync.
  ///
  /// Throws a `CacheException` on failure.
  Future<void> deleteQueuedRecord(String attendanceId);

  /// Removes all records from the queue.
  ///
  /// This can be used for debugging or handling unrecoverable sync errors.
  /// Throws a `CacheException` on failure.
  Future<void> clearQueue();
}
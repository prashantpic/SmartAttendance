import '../models/attendance_model.dart';

/// ## Attendance Remote Data Source Interface
///
/// Defines the contract for interacting with the remote data store (Firestore).
/// This abstraction ensures that the repository is decoupled from the specific
/// implementation of the remote data store, improving testability and maintainability.
abstract class AttendanceRemoteDataSource {
  /// Creates a new record or updates an existing one in Firestore.
  ///
  /// The operation is idempotent if the `attendanceId` on the [record] is consistent.
  /// Throws a `ServerException` on failure.
  Future<void> createOrUpdateAttendanceRecord(AttendanceModel record);

  /// Streams a list of a user's historical attendance records, ordered by date.
  ///
  /// The stream will emit a new list whenever the underlying data changes in Firestore.
  Stream<List<AttendanceModel>> getAttendanceHistoryStream(String userId);

  /// Streams the user's current active attendance record.
  ///
  /// An active record is one that has a `clientCheckInTimestamp` but a null
  /// `clientCheckOutTimestamp`. Returns a stream of `null` if no active record exists.
  Stream<AttendanceModel?> getActiveAttendanceRecordStream(String userId);
}
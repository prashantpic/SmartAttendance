import 'package:hive/hive.dart';
import '../models/attendance_model.dart';
import 'attendance_local_data_source.dart';
import '../../core/error/exceptions.dart'; // Placeholder for custom exceptions

/// ## Hive Attendance Data Source Implementation
///
/// This is the concrete implementation of `AttendanceLocalDataSource` using the
/// Hive database. It manages the local queue of attendance records created
/// while the application is offline, providing the foundation for the
/// offline-first strategy.
class HiveAttendanceDataSourceImpl implements AttendanceLocalDataSource {
  final Box<Map<String, dynamic>> _attendanceBox;

  HiveAttendanceDataSourceImpl({required Box<Map<String, dynamic>> attendanceBox})
      : _attendanceBox = attendanceBox;

  @override
  Future<void> queueAttendanceRecord(AttendanceModel record) async {
    try {
      await _attendanceBox.put(record.attendanceId, record.toJson());
    } catch (e) {
      throw CacheException('Failed to queue attendance record in Hive: $e');
    }
  }

  @override
  Future<List<AttendanceModel>> getQueuedRecords() async {
    try {
      return _attendanceBox.values
          .map((jsonMap) => AttendanceModel.fromJson(jsonMap))
          .toList();
    } catch (e) {
      throw CacheException('Failed to retrieve queued records from Hive: $e');
    }
  }

  @override
  Future<void> deleteQueuedRecord(String attendanceId) async {
    try {
      await _attendanceBox.delete(attendanceId);
    } catch (e) {
      throw CacheException('Failed to delete queued record from Hive: $e');
    }
  }

  @override
  Future<void> clearQueue() async {
    try {
      await _attendanceBox.clear();
    } catch (e) {
      throw CacheException('Failed to clear the attendance queue in Hive: $e');
    }
  }
}
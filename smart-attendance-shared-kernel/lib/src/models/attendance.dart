import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import '../utils/json_converters.dart';

part 'attendance.g.dart';

@JsonSerializable(explicitToJson: true)
class Attendance extends Equatable {
  final String attendanceId;
  final String userId;
  final String userName;
  final String? eventId;

  @TimestampConverter()
  final DateTime clientCheckInTimestamp;
  @NullableTimestampConverter()
  final DateTime? clientCheckOutTimestamp;
  @TimestampConverter()
  final DateTime serverSyncTimestamp;

  @GeoPointConverter()
  final GeoPoint checkInLocation;
  @NullableGeoPointConverter()
  final GeoPoint? checkOutLocation;

  final double checkInAccuracy;
  final double? checkOutAccuracy;

  final String? checkInAddress;
  final String? checkOutAddress;

  final String status; // 'Pending', 'Approved', 'Rejected'
  final bool isOutsideGeofence;
  final Map<String, dynamic> deviceInfo;
  final Map<String, dynamic>? approvalDetails;
  final List<String> approverHierarchy;

  const Attendance({
    required this.attendanceId,
    required this.userId,
    required this.userName,
    this.eventId,
    required this.clientCheckInTimestamp,
    this.clientCheckOutTimestamp,
    required this.serverSyncTimestamp,
    required this.checkInLocation,
    this.checkOutLocation,
    required this.checkInAccuracy,
    this.checkOutAccuracy,
    this.checkInAddress,
    this.checkOutAddress,
    required this.status,
    required this.isOutsideGeofence,
    required this.deviceInfo,
    this.approvalDetails,
    required this.approverHierarchy,
  });

  factory Attendance.fromJson(Map<String, dynamic> json) => _$AttendanceFromJson(json);

  Map<String, dynamic> toJson() => _$AttendanceToJson(this);

  @override
  List<Object?> get props => [attendanceId, userId];
}
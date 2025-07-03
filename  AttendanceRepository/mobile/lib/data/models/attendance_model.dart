import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';

/// ## Data Transfer Object (DTO) for an Attendance Record
///
/// This model represents the data structure for attendance, including timestamps,
/// location, status, and sync information. It includes serialization logic
/// for interaction with both Firestore and the local Hive database.
class AttendanceModel extends Equatable {
  /// Client-generated UUID. Primary key for the record.
  final String attendanceId;

  /// ID of the tenant the user belongs to. Required for Firestore path.
  final String tenantId;

  /// ID of the user who created the record.
  final String userId;

  /// Denormalized name of the user for display purposes.
  final String userName;

  /// Optional ID of a linked event.
  final String? eventId;

  /// Client-side timestamp of the check-in.
  final DateTime clientCheckInTimestamp;

  /// Client-side timestamp of the check-out.
  final DateTime? clientCheckOutTimestamp;

  /// Firestore GeoPoint for check-in location.
  final GeoPoint checkInLocation;

  /// Firestore GeoPoint for check-out location.
  final GeoPoint? checkOutLocation;
  
  /// GPS accuracy in meters for check-in.
  final double checkInAccuracy;

  /// GPS accuracy in meters for check-out.
  final double? checkOutAccuracy;

  /// Approval status (`Pending`, `Approved`, `Rejected`).
  final String status;

  /// Offline sync status (`Queued`, `Synced`, `Failed`).
  final String syncStatus;

  /// Flag indicating if check-in was outside the geofence.
  final bool isOutsideGeofence;

  /// Map containing device info (appVersion, os, model).
  final Map<String, dynamic> deviceInfo;

  const AttendanceModel({
    required this.attendanceId,
    required this.tenantId,
    required this.userId,
    required this.userName,
    this.eventId,
    required this.clientCheckInTimestamp,
    this.clientCheckOutTimestamp,
    required this.checkInLocation,
    this.checkOutLocation,
    required this.checkInAccuracy,
    this.checkOutAccuracy,
    required this.status,
    required this.syncStatus,
    required this.isOutsideGeofence,
    required this.deviceInfo,
  });

  /// Creates an `AttendanceModel` from a Firestore `DocumentSnapshot`.
  ///
  /// This factory correctly parses Firestore-specific types like `Timestamp`
  /// into `DateTime` and handles `GeoPoint` natively.
  factory AttendanceModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data()!;
    return AttendanceModel(
      attendanceId: doc.id,
      tenantId: data['tenantId'],
      userId: data['userId'],
      userName: data['userName'],
      eventId: data['eventId'],
      clientCheckInTimestamp: (data['clientCheckInTimestamp'] as Timestamp).toDate(),
      clientCheckOutTimestamp: (data['clientCheckOutTimestamp'] as Timestamp?)?.toDate(),
      checkInLocation: data['checkInLocation'] as GeoPoint,
      checkOutLocation: data['checkOutLocation'] as GeoPoint?,
      checkInAccuracy: (data['checkInAccuracy'] as num).toDouble(),
      checkOutAccuracy: (data['checkOutAccuracy'] as num?)?.toDouble(),
      status: data['status'],
      syncStatus: data['syncStatus'],
      isOutsideGeofence: data['isOutsideGeofence'],
      deviceInfo: Map<String, dynamic>.from(data['deviceInfo']),
    );
  }

  /// Creates an `AttendanceModel` from a JSON map.
  ///
  /// This is used by Hive for local storage and for general serialization.
  /// It handles parsing ISO 8601 date strings and a map representation
  /// of a `GeoPoint`.
  factory AttendanceModel.fromJson(Map<String, dynamic> json) {
    return AttendanceModel(
      attendanceId: json['attendanceId'],
      tenantId: json['tenantId'],
      userId: json['userId'],
      userName: json['userName'],
      eventId: json['eventId'],
      clientCheckInTimestamp: DateTime.parse(json['clientCheckInTimestamp']),
      clientCheckOutTimestamp: json['clientCheckOutTimestamp'] != null
          ? DateTime.parse(json['clientCheckOutTimestamp'])
          : null,
      checkInLocation: GeoPoint(
        (json['checkInLocation']['latitude'] as num).toDouble(),
        (json['checkInLocation']['longitude'] as num).toDouble(),
      ),
      checkOutLocation: json['checkOutLocation'] != null
          ? GeoPoint(
              (json['checkOutLocation']['latitude'] as num).toDouble(),
              (json['checkOutLocation']['longitude'] as num).toDouble(),
            )
          : null,
      checkInAccuracy: (json['checkInAccuracy'] as num).toDouble(),
      checkOutAccuracy: (json['checkOutAccuracy'] as num?)?.toDouble(),
      status: json['status'],
      syncStatus: json['syncStatus'],
      isOutsideGeofence: json['isOutsideGeofence'],
      deviceInfo: Map<String, dynamic>.from(json['deviceInfo']),
    );
  }

  /// Converts the `AttendanceModel` instance into a JSON map suitable for Hive.
  ///
  /// `DateTime` is converted to an ISO 8601 string, and `GeoPoint` is converted
  /// to a map, ensuring the output is JSON-serializable.
  Map<String, dynamic> toJson() {
    return {
      'attendanceId': attendanceId,
      'tenantId': tenantId,
      'userId': userId,
      'userName': userName,
      'eventId': eventId,
      'clientCheckInTimestamp': clientCheckInTimestamp.toIso8601String(),
      'clientCheckOutTimestamp': clientCheckOutTimestamp?.toIso8601String(),
      'checkInLocation': {
        'latitude': checkInLocation.latitude,
        'longitude': checkInLocation.longitude,
      },
      'checkOutLocation': checkOutLocation != null
          ? {
              'latitude': checkOutLocation!.latitude,
              'longitude': checkOutLocation!.longitude,
            }
          : null,
      'checkInAccuracy': checkInAccuracy,
      'checkOutAccuracy': checkOutAccuracy,
      'status': status,
      'syncStatus': syncStatus,
      'isOutsideGeofence': isOutsideGeofence,
      'deviceInfo': deviceInfo,
    };
  }

  /// Converts the `AttendanceModel` instance into a map suitable for Firestore.
  ///
  /// This method keeps `DateTime` and `GeoPoint` objects in their native format,
  /// allowing the Firestore SDK to handle serialization to `Timestamp` and `GeoPoint`
  /// document fields correctly.
  Map<String, dynamic> toFirestoreMap() {
    return {
      'tenantId': tenantId,
      'userId': userId,
      'userName': userName,
      'eventId': eventId,
      'clientCheckInTimestamp': clientCheckInTimestamp,
      'clientCheckOutTimestamp': clientCheckOutTimestamp,
      'checkInLocation': checkInLocation,
      'checkOutLocation': checkOutLocation,
      'checkInAccuracy': checkInAccuracy,
      'checkOutAccuracy': checkOutAccuracy,
      'status': status,
      'syncStatus': syncStatus,
      'isOutsideGeofence': isOutsideGeofence,
      'deviceInfo': deviceInfo,
      // Note: attendanceId is used as the document ID, not in the map.
    };
  }

  /// Returns a new `AttendanceModel` instance with updated field values.
  ///
  /// This is crucial for updating the model immutably, for example, when
  /// changing the `syncStatus` or adding a `clientCheckOutTimestamp`.
  AttendanceModel copyWith({
    String? attendanceId,
    String? tenantId,
    String? userId,
    String? userName,
    String? eventId,
    DateTime? clientCheckInTimestamp,
    DateTime? clientCheckOutTimestamp,
    GeoPoint? checkInLocation,
    GeoPoint? checkOutLocation,
    double? checkInAccuracy,
    double? checkOutAccuracy,
    String? status,
    String? syncStatus,
    bool? isOutsideGeofence,
    Map<String, dynamic>? deviceInfo,
  }) {
    return AttendanceModel(
      attendanceId: attendanceId ?? this.attendanceId,
      tenantId: tenantId ?? this.tenantId,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      eventId: eventId ?? this.eventId,
      clientCheckInTimestamp: clientCheckInTimestamp ?? this.clientCheckInTimestamp,
      clientCheckOutTimestamp: clientCheckOutTimestamp ?? this.clientCheckOutTimestamp,
      checkInLocation: checkInLocation ?? this.checkInLocation,
      checkOutLocation: checkOutLocation ?? this.checkOutLocation,
      checkInAccuracy: checkInAccuracy ?? this.checkInAccuracy,
      checkOutAccuracy: checkOutAccuracy ?? this.checkOutAccuracy,
      status: status ?? this.status,
      syncStatus: syncStatus ?? this.syncStatus,
      isOutsideGeofence: isOutsideGeofence ?? this.isOutsideGeofence,
      deviceInfo: deviceInfo ?? this.deviceInfo,
    );
  }

  @override
  List<Object?> get props => [
        attendanceId,
        tenantId,
        userId,
        userName,
        eventId,
        clientCheckInTimestamp,
        clientCheckOutTimestamp,
        checkInLocation,
        checkOutLocation,
        checkInAccuracy,
        checkOutAccuracy,
        status,
        syncStatus,
        isOutsideGeofence,
        deviceInfo,
      ];
}
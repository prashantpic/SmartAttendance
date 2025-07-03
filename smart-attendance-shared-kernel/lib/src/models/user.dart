import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import '../utils/json_converters.dart';

part 'user.g.dart';

@JsonSerializable(explicitToJson: true)
class User extends Equatable {
  final String userId;
  final String tenantId;
  final String name;
  final String email;
  final String role;
  final String status;
  final String? supervisorId;
  final String? fcmToken;
  @NullableTimestampConverter()
  final DateTime? lastLoginTimestamp;
  @TimestampConverter()
  final DateTime createdAt;
  @TimestampConverter()
  final DateTime updatedAt;

  const User({
    required this.userId,
    required this.tenantId,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
    this.supervisorId,
    this.fcmToken,
    this.lastLoginTimestamp,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);

  Map<String, dynamic> toJson() => _$UserToJson(this);

  @override
  List<Object?> get props => [userId, tenantId, name, email, role, status, supervisorId, fcmToken, lastLoginTimestamp, createdAt, updatedAt];
}
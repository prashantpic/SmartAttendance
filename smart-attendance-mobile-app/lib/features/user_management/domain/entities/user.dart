import 'package:equatable/equatable.dart';

/// Enum representing the possible roles a user can have within the system.
enum UserRole {
  admin,
  supervisor,
  subordinate,
}

/// Enum representing the possible statuses of a user account.
enum UserStatus {
  active,
  invited,
  deactivated,
}

/// Represents the core business object for a User.
///
/// This is a pure data class, part of the domain layer, and is independent of
/// any framework or data source implementation details. It uses [Equatable] to
//  enable value-based equality.
class User extends Equatable {
  final String id;
  final String name;
  final String email;
  final UserRole role;
  final UserStatus status;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
  });

  @override
  List<Object?> get props => [id, name, email, role, status];
}
import 'package:equatable/equatable.dart';

/// Represents the role of a user within a tenant.
enum UserRole {
  /// Can manage the entire tenant, including users and configurations.
  admin,

  /// Can manage assigned subordinates and approve their attendance.
  supervisor,

  /// Can record their own attendance.
  subordinate,

  /// Represents an unknown or unassigned role.
  unknown,
}

/// Represents the account status of a user.
enum UserStatus {
  /// The user is fully active and can use the application.
  active,

  /// The user has been invited but has not completed the setup.
  invited,

  /// The user's account has been disabled and they cannot log in.
  deactivated,

  /// Represents an unknown or unassigned status.
  unknown,
}

/// A central, immutable data model representing an authenticated user within the
/// application domain. It is completely decoupled from the underlying
/// authentication provider (e.g., `firebase_auth.User`).
class AuthUser extends Equatable {
  /// {@macro auth_user}
  const AuthUser({
    required this.id,
    this.email,
    this.name,
    required this.tenantId,
    required this.role,
    required this.status,
  });

  /// The unique user ID from the authentication provider (e.g., Firebase Auth UID).
  final String id;

  /// The user's email address, if available.
  final String? email;
  
  /// The user's display name, if available.
  final String? name;

  /// The ID of the tenant the user belongs to.
  /// CRITICAL: Sourced from custom claims in the ID token.
  final String tenantId;

  /// The user's role within the organization.
  /// CRITICAL: Sourced from custom claims in the ID token.
  final UserRole role;

  /// The current status of the user's account.
  /// CRITICAL: Sourced from custom claims in the ID token.
  final UserStatus status;

  /// An empty user which represents an unauthenticated state.
  /// This is a convenient sentinel value for initial states or logged-out users.
  static const empty = AuthUser(
    id: '', 
    email: '',
    name: '',
    tenantId: '', 
    role: UserRole.unknown, 
    status: UserStatus.unknown,
  );

  /// A convenience getter to check if the user is in an unauthenticated state.
  bool get isEmpty => this == AuthUser.empty;

  /// A convenience getter to check if the user is authenticated.
  bool get isNotEmpty => this != AuthUser.empty;

  /// A convenience getter to check if the user's account status is active.
  bool get isActive => status == UserStatus.active;

  @override
  List<Object?> get props => [id, email, name, tenantId, role, status];
}
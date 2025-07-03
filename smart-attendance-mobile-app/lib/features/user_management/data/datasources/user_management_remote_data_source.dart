import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/models/user_model.dart';

/// Defines the contract for remote data operations for the User Management feature.
///
/// This abstract class ensures that any implementation provides the required
/// methods for interacting with the user data on a remote server (e.g., Firestore).
abstract class UserManagementRemoteDataSource {
  /// Fetches a paginated list of users from the remote data source.
  ///
  /// [tenantId]: The ID of the tenant to fetch users from.
  /// [limit]: The maximum number of users to return.
  /// [startAfter]: The Firestore [DocumentSnapshot] to start the query after, for pagination.
  /// [statusFilter]: An optional filter to fetch users by their status.
  Future<List<UserModel>> getUsers({
    required String tenantId,
    required int limit,
    DocumentSnapshot? startAfter,
    String? statusFilter,
  });

  /// Updates the status of a specific user.
  ///
  /// [tenantId]: The ID of the tenant where the user resides.
  /// [userId]: The ID of the user to update.
  /// [newStatus]: The new status to set for the user.
  Future<void> updateUserStatus({
    required String tenantId,
    required String userId,
    required String newStatus,
  });

  /// Updates the profile details of a specific user.
  ///
  /// [tenantId]: The ID of the tenant where the user resides.
  /// [userId]: The ID of the user to update.
  /// [data]: A map containing the fields to update (e.g., {'name': 'New Name'}).
  Future<void> updateUserProfile({
    required String tenantId,
    required String userId,
    required Map<String, dynamic> data,
  });
}
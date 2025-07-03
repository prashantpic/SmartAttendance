import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dartz/dartz.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/repositories/user_management_repository_impl.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/entities/user.dart';

/// Abstract contract for the user management repository.
///
/// This interface defines the methods that the domain layer (specifically, use cases)
/// can use to interact with user data, without knowing the underlying data source.
/// It uses the `Either` type from `dartz` to handle success and failure cases
/// in a functional way, avoiding exceptions in the business logic.
abstract class UserManagementRepository {
  /// Fetches a paginated and optionally filtered list of users.
  ///
  /// Returns a `Right` with a list of [User] on success, or a `Left` with a
  /// [Failure] on error.
  Future<Either<Failure, List<User>>> getUsers({
    required int limit,
    DocumentSnapshot? startAfter,
    String? statusFilter,
  });

  /// Updates the status of a specific user.
  ///
  /// Returns a `Right` with `void` on success, or a `Left` with a [Failure] on error.
  Future<Either<Failure, void>> updateUserStatus({
    required String userId,
    required String newStatus,
  });

  /// Updates the profile details of a specific user.
  ///
  /// Returns a `Right` with `void` on success, or a `Left` with a [Failure] on error.
  Future<Either<Failure, void>> updateUserProfile({
    required String userId,
    required Map<String, dynamic> data,
  });
}
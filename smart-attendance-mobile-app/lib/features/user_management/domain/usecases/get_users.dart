import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/repositories/user_management_repository_impl.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/entities/user.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/repositories/user_management_repository.dart';

/// Use case for fetching a paginated and filtered list of users.
///
/// This class encapsulates a single business rule, abstracting the interaction
/// with the [UserManagementRepository] away from the presentation layer (BLoC).
class GetUsers {
  final UserManagementRepository _repository;

  GetUsers(this._repository);

  /// Executes the use case.
  ///
  /// It calls the `getUsers` method on the repository and forwards the result.
  Future<Either<Failure, List<User>>> call(GetUsersParams params) async {
    return await _repository.getUsers(
      limit: params.limit,
      startAfter: params.startAfter,
      statusFilter: params.statusFilter,
    );
  }
}

/// Parameters for the [GetUsers] use case.
///
/// Using a parameter object makes the use case call more readable and
/// extensible, and allows for value equality with [Equatable].
class GetUsersParams extends Equatable {
  final int limit;
  final DocumentSnapshot? startAfter;
  final String? statusFilter;

  const GetUsersParams({
    required this.limit,
    this.startAfter,
    this.statusFilter,
  });

  @override
  List<Object?> get props => [limit, startAfter, statusFilter];
}
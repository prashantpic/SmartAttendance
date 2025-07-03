import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/repositories/user_management_repository_impl.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/repositories/user_management_repository.dart';

/// Use case for deactivating or reactivating a user.
///
/// Encapsulates the business logic for changing a user's active status.
class UpdateUserStatus {
  final UserManagementRepository _repository;

  UpdateUserStatus(this._repository);

  /// Executes the use case.
  Future<Either<Failure, void>> call(UpdateUserStatusParams params) async {
    return await _repository.updateUserStatus(
      userId: params.userId,
      newStatus: params.newStatus,
    );
  }
}

/// Parameters for the [UpdateUserStatus] use case.
class UpdateUserStatusParams extends Equatable {
  final String userId;
  final String newStatus;

  const UpdateUserStatusParams({required this.userId, required this.newStatus});

  @override
  List<Object?> get props => [userId, newStatus];
}
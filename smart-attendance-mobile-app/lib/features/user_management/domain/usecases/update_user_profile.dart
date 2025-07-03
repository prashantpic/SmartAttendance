import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/repositories/user_management_repository_impl.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/repositories/user_management_repository.dart';

/// Use case for editing a user's profile details.
///
/// Encapsulates the business logic for modifying a user's core profile
/// information like name, role, and supervisor.
class UpdateUserProfile {
  final UserManagementRepository _repository;

  UpdateUserProfile(this._repository);

  /// Executes the use case.
  Future<Either<Failure, void>> call(UpdateUserProfileParams params) async {
    return await _repository.updateUserProfile(
      userId: params.userId,
      data: params.data,
    );
  }
}

/// Parameters for the [UpdateUserProfile] use case.
class UpdateUserProfileParams extends Equatable {
  final String userId;
  final Map<String, dynamic> data;

  const UpdateUserProfileParams({required this.userId, required this.data});

  @override
  List<Object?> get props => [userId, data];
}
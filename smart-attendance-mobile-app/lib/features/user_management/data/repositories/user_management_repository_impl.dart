import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dartz/dartz.dart';
import 'package:smart_attendance_mobile_app/core/di/injector.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/datasources/user_management_remote_data_source.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/datasources/user_management_remote_data_source_impl.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/entities/user.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/repositories/user_management_repository.dart';


// --- Placeholder for Failure types ---
// This would be in lib/core/error/failures.dart
abstract class Failure {
  final String message;
  Failure(this.message);
}
class ServerFailure extends Failure {
  ServerFailure({required String message}) : super(message);
}
class NetworkFailure extends Failure {
  NetworkFailure() : super('No internet connection');
}
// --- End Placeholder ---

/// Implementation of the [UserManagementRepository].
///
/// This class acts as a bridge between the domain layer and the data layer.
/// It coordinates data from one or more data sources (in this case, only remote),
/// handles network connectivity checks, and maps data source exceptions to
/// domain-layer [Failure] types.
class UserManagementRepositoryImpl implements UserManagementRepository {
  final UserManagementRemoteDataSource _remoteDataSource;
  final NetworkInfo _networkInfo;
  // In a real app, this would be fetched from AuthBloc or a session service.
  final String _tenantId = "default-tenant"; 

  UserManagementRepositoryImpl({
    required UserManagementRemoteDataSource remoteDataSource,
    required NetworkInfo networkInfo,
  })  : _remoteDataSource = remoteDataSource,
        _networkInfo = networkInfo;

  @override
  Future<Either<Failure, List<User>>> getUsers({
    required int limit,
    DocumentSnapshot? startAfter,
    String? statusFilter,
  }) async {
    if (await _networkInfo.isConnected) {
      try {
        final remoteUsers = await _remoteDataSource.getUsers(
          tenantId: _tenantId,
          limit: limit,
          startAfter: startAfter,
          statusFilter: statusFilter,
        );
        // Since UserModel extends User, no mapping is needed here.
        return Right(remoteUsers);
      } on ServerException catch (e) {
        return Left(ServerFailure(message: e.message));
      }
    } else {
      return Left(NetworkFailure());
    }
  }

  @override
  Future<Either<Failure, void>> updateUserProfile({
    required String userId,
    required Map<String, dynamic> data,
  }) async {
    if (await _networkInfo.isConnected) {
      try {
        await _remoteDataSource.updateUserProfile(
          tenantId: _tenantId,
          userId: userId,
          data: data,
        );
        return const Right(null);
      } on ServerException catch (e) {
        return Left(ServerFailure(message: e.message));
      }
    } else {
      return Left(NetworkFailure());
    }
  }

  @override
  Future<Either<Failure, void>> updateUserStatus({
    required String userId,
    required String newStatus,
  }) async {
    if (await _networkInfo.isConnected) {
      try {
        await _remoteDataSource.updateUserStatus(
          tenantId: _tenantId,
          userId: userId,
          newStatus: newStatus,
        );
        return const Right(null);
      } on ServerException catch (e) {
        return Left(ServerFailure(message: e.message));
      }
    } else {
      return Left(NetworkFailure());
    }
  }
}
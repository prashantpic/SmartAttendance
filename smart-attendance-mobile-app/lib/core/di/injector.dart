import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:get_it/get_it.dart';
import 'package:go_router/go_router.dart';
import 'package:smart_attendance_mobile_app/app.dart';
import 'package:smart_attendance_mobile_app/core/navigation/app_router.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/datasources/user_management_remote_data_source.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/datasources/user_management_remote_data_source_impl.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/repositories/user_management_repository_impl.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/repositories/user_management_repository.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/usecases/get_users.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/usecases/update_user_profile.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/usecases/update_user_status.dart';
import 'package:smart_attendance_mobile_app/features/user_management/presentation/bloc/user_detail_bloc.dart';
import 'package:smart_attendance_mobile_app/features/user_management/presentation/bloc/user_list_bloc.dart';

// --- Placeholder for NetworkInfo ---
// This would be in lib/core/network/network_info.dart
abstract class NetworkInfo {
  Future<bool> get isConnected;
}

class NetworkInfoImpl implements NetworkInfo {
  // In a real app, this would use a package like connectivity_plus
  @override
  Future<bool> get isConnected => Future.value(true);
}
// --- End Placeholder ---

/// Service Locator instance.
final sl = GetIt.instance;

/// Configures and registers all application dependencies.
///
/// This function initializes the dependency injection container by registering
/// services, data sources, repositories, use cases, and BLoCs.
/// It's structured to be called once at application startup.
Future<void> configureDependencies() async {
  // Core
  sl.registerLazySingleton<NetworkInfo>(() => NetworkInfoImpl());
  sl.registerFactory(() => AuthBloc());
  sl.registerLazySingleton(() => AppRouter(sl()));
  
  // External Dependencies
  sl.registerLazySingleton(() => FirebaseFirestore.instance);
  
  // Feature: User Management
  _initUserManagement();
}

/// Registers all dependencies for the User Management feature.
void _initUserManagement() {
  // Presentation (BLoCs)
  // BLoCs are registered as factories because they are typically tied to a
  // specific screen's lifecycle and should be created new each time.
  sl.registerFactory(() => UserListBloc(getUsers: sl()));
  sl.registerFactory(() => UserDetailBloc(
        updateUserProfile: sl(),
        updateUserStatus: sl(),
      ));

  // Domain (Use Cases)
  // Use cases are simple classes with a single method, so they can be singletons.
  sl.registerLazySingleton(() => GetUsers(sl()));
  sl.registerLazySingleton(() => UpdateUserStatus(sl()));
  sl.registerLazySingleton(() => UpdateUserProfile(sl()));

  // Data (Repository)
  // Repositories are registered as lazy singletons as there should only be one
  // instance coordinating data for a feature.
  sl.registerLazySingleton<UserManagementRepository>(
    () => UserManagementRepositoryImpl(
      remoteDataSource: sl(),
      networkInfo: sl(),
    ),
  );

  // Data (Data Source)
  // Data sources are also registered as lazy singletons.
  sl.registerLazySingleton<UserManagementRemoteDataSource>(
    () => UserManagementRemoteDataSourceImpl(firestore: sl()),
  );
}
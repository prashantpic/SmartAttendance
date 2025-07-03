import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:smart_attendance/data/repositories/auth/auth_repository.dart';
import 'package:smart_attendance/data/repositories/auth/firebase_auth_repository.dart';
import 'package:smart_attendance/domain/entities/auth_user.dart';

part 'auth_providers.g.dart';

/// Provides the concrete implementation of the [AuthRepository].
///
/// This is the single source for the repository instance throughout the app.
/// It is kept alive to maintain the authentication state across the app's lifecycle.
@Riverpod(keepAlive: true)
AuthRepository authRepository(AuthRepositoryRef ref) {
  return FirebaseAuthRepository(firebase_auth.FirebaseAuth.instance);
}

/// Provides a stream of the current authentication state as an [AuthUser].
///
/// The UI layer will listen to this provider to reactively rebuild
/// when the user logs in, logs out, or when their token/claims are updated.
/// It is kept alive to ensure the stream connection is persistent.
@Riverpod(keepAlive: true)
Stream<AuthUser> authStateChanges(AuthStateChangesRef ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return authRepository.onAuthStateChanged;
}
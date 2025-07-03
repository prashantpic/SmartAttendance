import 'package:firebase_auth/firebase_auth.dart' hide User; // Hide Firebase User to avoid conflicts
import 'package:smart_attendance/domain/entities/auth_user.dart';

/// An abstract interface for an authentication repository.
///
/// This contract establishes a technology-agnostic interface that the rest of
/// the application will depend on, facilitating testing and future implementation
/// changes. It defines all authentication-related functionalities.
abstract class AuthRepository {
  /// A stream of [AuthUser] which emits the current user when the
  /// authentication state changes. Emits [AuthUser.empty] if the user signs out.
  Stream<AuthUser> get onAuthStateChanged;

  /// Gets the current authenticated user synchronously.
  ///
  /// IMPORTANT: This getter might return a user with stale custom claims
  /// (`tenantId`, `role`, `status`). The primary and most reliable way to get
  /// the current user state is by listening to the [onAuthStateChanged] stream.
  /// Returns [AuthUser.empty] if no user is currently authenticated.
  AuthUser get currentUser;

  /// Signs in a user with the given [email] and [password].
  ///
  /// Throws a [LogInWithEmailAndPasswordFailure] if an authentication exception occurs.
  Future<void> signInWithEmailAndPassword({required String email, required String password});

  /// Starts the phone number verification process for signing in.
  ///
  /// This method orchestrates the entire Firebase phone verification flow
  /// by exposing its four possible outcomes as callbacks.
  ///
  /// - [verificationCompleted]: Called when verification is complete automatically
  ///   (e.g., on some Android devices).
  /// - [verificationFailed]: Called when a non-recoverable error occurs.
  /// - [codeSent]: Called when an OTP code has been sent to the device.
  /// - [codeAutoRetrievalTimeout]: Called when the auto-retrieval timeout is reached.
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required void Function(PhoneAuthCredential) verificationCompleted,
    required void Function(FirebaseAuthException) verificationFailed,
    required void Function(String, int?) codeSent,
    required void Function(String) codeAutoRetrievalTimeout,
  });

  /// Signs in with the given [PhoneAuthCredential]. This is typically used
  /// after the user provides the OTP code received via SMS.
  ///
  /// Throws a [LogInWithPhoneFailure] if an exception occurs.
  Future<void> signInWithPhoneCredential({required PhoneAuthCredential credential});

  /// Sends a password reset link to the given [email].
  ///
  // Throws a [SendPasswordResetEmailFailure] if an exception occurs.
  Future<void> sendPasswordResetEmail({required String email});

  /// Signs out the current user.
  Future<void> signOut();

  /// Force-refreshes the current user's ID token to get the latest custom claims.
  ///
  /// This is crucial for retrieving updated roles, status, or tenant information
  /// without requiring the user to sign out and back in.
  ///
  /// Returns the updated [AuthUser] or [AuthUser.empty] if no user is authenticated.
  Future<AuthUser> refreshUser();
}
import 'dart:async';
import 'dart:developer';

import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:smart_attendance/data/repositories/auth/auth_repository.dart';
import 'package:smart_attendance/data/repositories/auth/exceptions/auth_exceptions.dart';
import 'package:smart_attendance/domain/entities/auth_user.dart';

/// A concrete implementation of the [AuthRepository] using the
/// Firebase Authentication SDK.
///
/// This class encapsulates all Firebase-specific authentication logic, including
/// API calls, error handling, and mapping between the `firebase_auth.User`
/// and the domain-specific `AuthUser` model, which includes custom claims.
class FirebaseAuthRepository implements AuthRepository {
  /// Creates an instance of the repository.
  ///
  /// Requires an instance of [firebase_auth.FirebaseAuth] for dependency injection,
  /// which allows for easier testing by mocking the service.
  FirebaseAuthRepository(this._firebaseAuth);

  final firebase_auth.FirebaseAuth _firebaseAuth;

  @override
  Stream<AuthUser> get onAuthStateChanged {
    return _firebaseAuth.authStateChanges().asyncMap(_mapFirebaseUserToAuthUser);
  }

  @override
  AuthUser get currentUser {
    // WARNING: This synchronous getter provides a partially populated user.
    // It cannot and does not fetch custom claims. The `onAuthStateChanged`
    // stream is the authoritative source for the complete AuthUser object.
    final firebaseUser = _firebaseAuth.currentUser;
    if (firebaseUser == null) {
      return AuthUser.empty;
    }
    return AuthUser(
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      tenantId: '', // Stale, use stream for real value
      role: UserRole.unknown, // Stale, use stream for real value
      status: UserStatus.unknown, // Stale, use stream for real value
    );
  }

  @override
  Future<void> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      await _firebaseAuth.signInWithEmailAndPassword(email: email, password: password);
    } on firebase_auth.FirebaseAuthException catch (e) {
      throw LogInWithEmailAndPasswordFailure.fromCode(e.code);
    } catch (_) {
      throw const LogInWithEmailAndPasswordFailure();
    }
  }

  @override
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required void Function(firebase_auth.PhoneAuthCredential) verificationCompleted,
    required void Function(firebase_auth.FirebaseAuthException) verificationFailed,
    required void Function(String, int?) codeSent,
    required void Function(String) codeAutoRetrievalTimeout,
  }) async {
    await _firebaseAuth.verifyPhoneNumber(
      phoneNumber: phoneNumber,
      verificationCompleted: verificationCompleted,
      verificationFailed: verificationFailed,
      codeSent: codeSent,
      codeAutoRetrievalTimeout: codeAutoRetrievalTimeout,
    );
  }

  @override
  Future<void> signInWithPhoneCredential({
    required firebase_auth.PhoneAuthCredential credential,
  }) async {
    try {
      await _firebaseAuth.signInWithCredential(credential);
    } catch (_) {
      throw const LogInWithPhoneFailure();
    }
  }

  @override
  Future<void> sendPasswordResetEmail({required String email}) async {
    try {
      await _firebaseAuth.sendPasswordResetEmail(email: email);
    } on firebase_auth.FirebaseAuthException {
      throw const SendPasswordResetEmailFailure();
    } catch (_) {
      throw const SendPasswordResetEmailFailure();
    }
  }

  @override
  Future<void> signOut() async {
    try {
      await _firebaseAuth.signOut();
    } catch (_) {
      // It's generally safe to ignore sign-out errors.
    }
  }

  @override
  Future<AuthUser> refreshUser() async {
    return _mapFirebaseUserToAuthUser(_firebaseAuth.currentUser);
  }

  /// A private helper method to map a `firebase_auth.User?` to an `AuthUser`.
  ///
  /// This method is the core of this repository. It fetches the ID token,
  /// force-refreshes it to get the latest custom claims (`tenantId`, `role`, `status`),
  /// validates the user's status, and constructs the domain model.
  Future<AuthUser> _mapFirebaseUserToAuthUser(firebase_auth.User? firebaseUser) async {
    if (firebaseUser == null) {
      return AuthUser.empty;
    }

    try {
      // Force refresh the token to get the latest custom claims.
      final idTokenResult = await firebaseUser.getIdTokenResult(true);
      final claims = idTokenResult.claims;

      if (claims == null) {
        log('Error: Custom claims are missing for user ${firebaseUser.uid}.');
        // Signing out the user as they are in an invalid state.
        await signOut();
        throw const AuthException('User claims are missing. Please sign in again.');
      }
      
      // CRITICAL: Check for deactivated status from claims.
      final statusString = claims['status'] as String? ?? 'unknown';
      if (statusString == 'deactivated') {
        // Sign out the user locally before throwing.
        await signOut();
        throw const DeactivatedUserFailure();
      }

      final tenantId = claims['tenantId'] as String? ?? '';
      final roleString = claims['role'] as String? ?? 'unknown';

      if (tenantId.isEmpty) {
        log('Error: tenantId is missing from custom claims for user ${firebaseUser.uid}');
      }

      return AuthUser(
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        tenantId: tenantId,
        role: _mapStringToUserRole(roleString),
        status: _mapStringToUserStatus(statusString),
      );
    } catch (e) {
      // Re-throw known exceptions.
      if (e is DeactivatedUserFailure || e is AuthException) {
        rethrow;
      }
      // Log and throw a generic exception for unknown errors during mapping.
      log('Error mapping Firebase user to AuthUser: $e');
      throw const AuthException('An error occurred while fetching user data.');
    }
  }

  /// Maps a string role to a [UserRole] enum value.
  UserRole _mapStringToUserRole(String role) {
    switch (role.toLowerCase()) {
      case 'admin':
        return UserRole.admin;
      case 'supervisor':
        return UserRole.supervisor;
      case 'subordinate':
        return UserRole.subordinate;
      default:
        return UserRole.unknown;
    }
  }

  /// Maps a string status to a [UserStatus] enum value.
  UserStatus _mapStringToUserStatus(String status) {
    switch (status.toLowerCase()) {
      case 'active':
        return UserStatus.active;
      case 'invited':
        return UserStatus.invited;
      case 'deactivated':
        return UserStatus.deactivated;
      default:
        return UserStatus.unknown;
    }
  }
}
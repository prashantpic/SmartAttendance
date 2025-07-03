# Software Design Specification (SDS) for AuthenticationRepository

## 1. Introduction

This document provides the detailed software design specification for the `AuthenticationRepository` (`REPO-002-DAT`). This repository is a client-side component within the mobile application's data layer. Its primary responsibility is to abstract all interactions with the Firebase Authentication service, providing a clean, testable, and application-specific interface for user authentication and session management.

This design adheres to the **Repository Pattern**, decoupling the application logic from the Firebase backend. It supports authentication via Email/Password and Phone OTP, manages user session state, and handles custom claims (`tenantId`, `role`, `status`) which are critical for role-based access control and multi-tenancy.

## 2. Core Components & Data Models

### 2.1. Domain Model: `AuthUser`

This is the central, immutable data model representing an authenticated user within the application domain. It is decoupled from the `firebase_auth.User` object.

**File:** `mobile/lib/domain/entities/auth_user.dart` (Assumed location, part of this repository's logical scope)

dart
import 'package:equatable/equatable.dart';

// Represents the role of a user within a tenant.
enum UserRole { admin, supervisor, subordinate, unknown }

// Represents the account status of a user.
enum UserStatus { active, invited, deactivated, unknown }

class AuthUser extends Equatable {
  const AuthUser({
    required this.id,
    this.email,
    this.name,
    required this.tenantId,
    required this.role,
    required this.status,
  });

  // The unique user ID from Firebase Auth.
  final String id;

  // The user's email, if available.
  final String? email;
  
  // The user's display name, if available.
  final String? name;

  // The ID of the tenant the user belongs to.
  // CRITICAL: Sourced from custom claims.
  final String tenantId;

  // The user's role within the organization.
  // CRITICAL: Sourced from custom claims.
  final UserRole role;

  // The current status of the user's account.
  // CRITICAL: Sourced from custom claims.
  final UserStatus status;

  // An empty user which represents an unauthenticated state.
  static const empty = AuthUser(
    id: '', 
    email: '', 
    tenantId: '', 
    role: UserRole.unknown, 
    status: UserStatus.unknown,
  );

  // Convenience getters
  bool get isEmpty => this == AuthUser.empty;
  bool get isNotEmpty => this != AuthUser.empty;
  bool get isActive => status == UserStatus.active;

  @override
  List<Object?> get props => [id, email, name, tenantId, role, status];
}


## 3. Exception Handling

A set of custom exceptions will be defined to abstract Firebase-specific error codes, enabling the application layer to handle failures in a clean, type-safe manner.

**File:** `mobile/lib/data/repositories/auth/exceptions/auth_exceptions.dart`

### 3.1. `AuthException`
A base class for all authentication-related failures.

dart
// Base exception for authentication failures.
class AuthException implements Exception {
  const AuthException([this.message = 'An unknown authentication error occurred.']);
  final String message;
}


### 3.2. Specific Exceptions

- **`LogInWithEmailAndPasswordFailure`**: Thrown for email/password sign-in errors.
- **`SendPasswordResetEmailFailure`**: Thrown for password reset email errors.
- **`LogInWithPhoneFailure`**: Thrown for phone authentication errors.
- **`DeactivatedUserFailure`**: Thrown when a user with 'deactivated' status attempts to log in.

### 3.3. Factory Constructor Logic
Each specific exception class will include a `fromCode` factory constructor to map `FirebaseAuthException.code` strings to a specific instance with a user-friendly message.

dart
// In LogInWithEmailAndPasswordFailure class
factory LogInWithEmailAndPasswordFailure.fromCode(String code) {
  switch (code) {
    case 'invalid-email':
      return const LogInWithEmailAndPasswordFailure('Email is not valid or badly formatted.');
    case 'user-disabled':
      return const LogInWithEmailAndPasswordFailure('This user account has been disabled.');
    case 'user-not-found':
    case 'wrong-password':
      return const LogInWithEmailAndPasswordFailure('Invalid email or password.');
    default:
      return const LogInWithEmailAndPasswordFailure();
  }
}


## 4. File-by-File Design Specification

### 4.1. `auth_repository.dart` - The Contract

This file defines the abstract interface for the authentication repository.

**Purpose:** To establish a technology-agnostic contract that the rest of the application will depend on, facilitating testing and future implementation changes.

dart
import 'package:firebase_auth/firebase_auth.dart' hide User; // Hide Firebase User
import 'package:smart_attendance/domain/entities/auth_user.dart';

abstract class AuthRepository {
  // Stream of [AuthUser] which will emit the current user when
  // the authentication state changes.
  Stream<AuthUser> get onAuthStateChanged;

  // Gets the current authenticated user. Returns AuthUser.empty if none.
  AuthUser get currentUser;

  // Signs in with the given [email] and [password].
  // Throws a [LogInWithEmailAndPasswordFailure] if an exception occurs.
  Future<void> signInWithEmailAndPassword({required String email, required String password});

  // Starts the phone number verification process.
  // Handles all four outcomes of the Firebase phone verification flow.
  Future<void> verifyPhoneNumber({
    required String phoneNumber,
    required void Function(PhoneAuthCredential) verificationCompleted,
    required void Function(FirebaseAuthException) verificationFailed,
    required void Function(String, int?) codeSent,
    required void Function(String) codeAutoRetrievalTimeout,
  });

  // Signs in with the given [PhoneAuthCredential].
  // Throws a [LogInWithPhoneFailure] if an exception occurs.
  Future<void> signInWithPhoneCredential({required PhoneAuthCredential credential});

  // Sends a password reset link to the given [email].
  // Throws a [SendPasswordResetEmailFailure] if an exception occurs.
  Future<void> sendPasswordResetEmail({required String email});

  // Signs out the current user.
  Future<void> signOut();

  // Force-refreshes the current user's token to get latest custom claims.
  // Returns the updated user or AuthUser.empty if not authenticated.
  Future<AuthUser> refreshUser();
}


### 4.2. `firebase_auth_repository.dart` - The Implementation

This file contains the concrete implementation of `AuthRepository` using the Firebase Authentication SDK.

**Purpose:** To encapsulate all Firebase-specific authentication logic, including API calls, error handling, and mapping to the domain `AuthUser` model.

**Class: `FirebaseAuthRepository`**

- **Implements:** `AuthRepository`
- **Dependencies:** `firebase_auth.FirebaseAuth`

**Constructor:**
dart
// The constructor will receive an instance of FirebaseAuth for testability.
// In the Riverpod provider, this will be FirebaseAuth.instance.
FirebaseAuthRepository(this._firebaseAuth);

final firebase_auth.FirebaseAuth _firebaseAuth;


**Method Implementations:**

- **`Stream<AuthUser> get onAuthStateChanged`**
  - **Logic:** Listens to `_firebaseAuth.authStateChanges()`. Uses `asyncMap` to transform the stream of `firebase_auth.User?` into a stream of `AuthUser`. It will call a private helper method `_mapFirebaseUserToAuthUser` for the transformation logic.

- **`AuthUser get currentUser`**
  - **Logic:** This is tricky for a synchronous getter due to claims. The implementation will return a cached version of the user if available, but the primary way to get user state should be the stream. A simple implementation can map the synchronous `_firebaseAuth.currentUser` but it **will not** have fresh custom claims. The stream is the source of truth.

- **`Future<void> signInWithEmailAndPassword(...)`**
  - **Logic:**
    1.  Wrap the call to `_firebaseAuth.signInWithEmailAndPassword` in a `try...catch` block.
    2.  On `FirebaseAuthException`, throw `LogInWithEmailAndPasswordFailure.fromCode(e.code)`.
    3.  On any other exception, throw `const LogInWithEmailAndPasswordFailure()`.
    4.  After a successful sign-in, call `_mapFirebaseUserToAuthUser` to validate claims (e.g., check for deactivated status) and cache the `AuthUser`.

- **`Future<void> verifyPhoneNumber(...)`**
  - **Logic:** Directly call `_firebaseAuth.verifyPhoneNumber`, passing all callback function parameters through.

- **`Future<void> signInWithPhoneCredential(...)`**
  - **Logic:** Similar to email sign-in, use a `try...catch` block around `_firebaseAuth.signInWithCredential` and throw a custom `LogInWithPhoneFailure` on error.

- **`Future<void> sendPasswordResetEmail(...)`**
  - **Logic:** Use a `try...catch` block and throw `SendPasswordResetEmailFailure` on `FirebaseAuthException`.

- **`Future<void> signOut()`**
  - **Logic:** Call `_firebaseAuth.signOut()`.

- **`Future<AuthUser> refreshUser()`**
  - **Logic:**
    1.  Get the current `firebase_auth.User` from `_firebaseAuth.currentUser`.
    2.  If `null`, return `AuthUser.empty`.
    3.  If not `null`, call `_mapFirebaseUserToAuthUser` to force a token refresh and get the latest claims.

**Private Helper: `Future<AuthUser> _mapFirebaseUserToAuthUser(firebase_auth.User? firebaseUser)`**
- **Logic:**
  1.  If `firebaseUser` is `null`, return `AuthUser.empty`.
  2.  Call `firebaseUser.getIdTokenResult(true)` to force-refresh and fetch the latest ID token with custom claims.
  3.  Access `idTokenResult.claims`. This is a `Map<String, dynamic>`.
  4.  Safely extract `tenantId`, `role`, and `status` from the claims. Log an error if any are missing.
  5.  **CRITICAL:** If `claims?['status'] == 'Deactivated'`, throw `const DeactivatedUserFailure()`. This enforces Requirement `3.2.3`.
  6.  Map the string `role` and `status` to their respective enum types (`UserRole`, `UserStatus`).
  7.  Return a new `AuthUser` instance populated with `id`, `email`, `name`, and the extracted claims data.

### 4.3. `auth_providers.dart` - Dependency Injection

This file provides the `AuthRepository` and related auth state to the rest of the application using Riverpod.

**Purpose:** To manage the lifecycle of the `AuthRepository` and expose authentication state in a simple, reactive way.

dart
import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'auth_repository.dart';
import 'firebase_auth_repository.dart';
import 'package:smart_attendance/domain/entities/auth_user.dart';

part 'auth_providers.g.dart'; // For Riverpod Generator

// Provides the concrete implementation of the AuthRepository.
// This is the single source for the repository instance throughout the app.
@Riverpod(keepAlive: true)
AuthRepository authRepository(AuthRepositoryRef ref) {
  return FirebaseAuthRepository(firebase_auth.FirebaseAuth.instance);
}

// Provides a stream of the current authentication state.
// The UI layer will listen to this provider to reactively rebuild
// when the user logs in or out.
@Riverpod(keepAlive: true)
Stream<AuthUser> authStateChanges(AuthStateChangesRef ref) {
  final authRepository = ref.watch(authRepositoryProvider);
  return authRepository.onAuthStateChanged;
}


### 4.4. `auth_user.dart` - Domain Entity
This file will contain the `AuthUser` class as defined in section 2.1. This is a crucial entity that represents a user within the application's domain, decoupled from the Firebase User object.

**Purpose:** To provide a stable, clean user model for the application and business logic layers to work with, hiding the implementation details of the underlying authentication provider. It holds not only basic user info but also critical custom claims data.
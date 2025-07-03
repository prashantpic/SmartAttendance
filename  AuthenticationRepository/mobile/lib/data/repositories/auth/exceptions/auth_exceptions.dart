/// A base class for all authentication-related failures.
///
/// Implements [Exception] to be used in `try...catch` blocks.
class AuthException implements Exception {
  /// {@macro auth_exception}
  const AuthException([this.message = 'An unknown authentication error occurred.']);

  /// The error message associated with the exception.
  final String message;
}

/// Thrown during the email/password sign-in process if a failure occurs.
class LogInWithEmailAndPasswordFailure extends AuthException {
  /// {@macro log_in_with_email_and_password_failure}
  const LogInWithEmailAndPasswordFailure([super.message]);

  /// Creates an authentication failure from a `FirebaseAuthException.code`.
  factory LogInWithEmailAndPasswordFailure.fromCode(String code) {
    switch (code) {
      case 'invalid-email':
        return const LogInWithEmailAndPasswordFailure('Email is not valid or badly formatted.');
      case 'user-disabled':
        return const LogInWithEmailAndPasswordFailure('This user account has been disabled.');
      case 'user-not-found':
      case 'wrong-password':
      case 'invalid-credential':
        return const LogInWithEmailAndPasswordFailure('Invalid email or password.');
      default:
        return const LogInWithEmailAndPasswordFailure();
    }
  }
}

/// Thrown during the password reset email sending process if a failure occurs.
class SendPasswordResetEmailFailure extends AuthException {
  /// {@macro send_password_reset_email_failure}
  const SendPasswordResetEmailFailure([super.message = 'Failed to send password reset email.']);
}

/// Thrown during the phone number authentication process if a failure occurs.
class LogInWithPhoneFailure extends AuthException {
  /// {@macro log_in_with_phone_failure}
  const LogInWithPhoneFailure([super.message = 'Failed to sign in with phone number.']);
}

/// Thrown when a user with a 'deactivated' status attempts to log in or refresh their session.
class DeactivatedUserFailure extends AuthException {
  /// {@macro deactivated_user_failure}
  const DeactivatedUserFailure([super.message = 'This user account has been deactivated.']);
}
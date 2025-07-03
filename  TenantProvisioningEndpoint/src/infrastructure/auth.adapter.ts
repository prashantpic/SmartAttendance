import * as admin from "firebase-admin";

/**
 * @class AuthAdapter
 * @description Encapsulates all interactions with the Firebase Authentication
 * service. This adapter provides a clean, testable interface for auth-related
 * operations like user creation and custom claims management.
 */
export class AuthAdapter {
  /**
   * @param auth The Firebase Admin Authentication service instance.
   */
  constructor(private readonly auth: admin.auth.Auth) {}

  /**
   * Creates a new user in Firebase Authentication.
   * @param email The user's email address.
   * @param password The user's password.
   * @param fullName The user's full display name.
   * @returns A promise that resolves to the newly created user record.
   */
  public async createAuthUser(
    email: string,
    password: string,
    fullName: string,
  ): Promise<admin.auth.UserRecord> {
    return this.auth.createUser({
      email,
      password,
      displayName: fullName,
    });
  }

  /**
   * Sets custom claims for a user, embedding critical metadata into their
   * authentication token. This is a vital security step for enforcing
   * multi-tenancy and role-based access control in Firestore security rules.
   * @param userId The UID of the user to set claims for.
   * @param tenantId The ID of the tenant the user belongs to.
   * @returns A promise that resolves when the claims have been set.
   */
  public async setAdminClaims(userId: string, tenantId: string): Promise<void> {
    await this.auth.setCustomUserClaims(userId, {
      tenantId,
      role: "Admin",
      status: "Active",
    });
  }
}
import * as admin from "firebase-admin";
import { HttpsError } from "firebase-functions/v1/https";
import { FIRESTORE_COLLECTIONS, USER_ROLES, USER_STATUSES, DEFAULT_TENANT_CONFIG } from "../common/constants";
import { Tenant, User, TenantConfig } from "../domain/models";

/**
 * Handles the business logic for tenant lifecycle management, primarily the
 * atomic provisioning of a new tenant and its initial admin user.
 */
export class TenantService {
  /**
   * Provisions a new tenant, creates the first admin user, sets up default
   * configuration, and assigns necessary permissions. This entire process is
   * executed within a single Firestore batched write to ensure atomicity.
   *
   * @param {string} orgName The name of the new organization.
   * @param {string} adminName The name of the administrator.
   * @param {string} adminEmail The email for the administrator.
   * @param {string} adminPassword The password for the administrator.
   * @returns {Promise<{ tenantId: string; userId: string; }>} The IDs of the created tenant and user.
   * @throws {HttpsError} Throws an error if provisioning fails, with details for the client.
   */
  public static async provisionNewTenant(
    orgName: string,
    adminName: string,
    adminEmail: string,
    adminPassword: string
  ): Promise<{ tenantId: string; userId: string; }> {
    const auth = admin.auth();
    const db = admin.firestore();
    let newUserRecord: admin.auth.UserRecord | null = null;

    try {
      // Step 1: Create the user in Firebase Authentication
      newUserRecord = await auth.createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: adminName,
        emailVerified: true, // Assuming we can verify them immediately
      });
      const userId = newUserRecord.uid;

      // Initialize a Firestore batched write for atomicity
      const batch = db.batch();

      // Step 2: Create the tenant document
      const tenantRef = db.collection(FIRESTORE_COLLECTIONS.TENANTS).doc();
      const tenantId = tenantRef.id;
      const newTenant: Tenant = {
        organizationName: orgName,
        createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      };
      batch.set(tenantRef, newTenant);

      // Step 3: Set custom claims on the new Auth user
      // These claims are critical for security rules and efficient client-side logic
      await auth.setCustomUserClaims(userId, {
        tenantId: tenantId,
        role: USER_ROLES.ADMIN,
        status: USER_STATUSES.ACTIVE,
      });

      // Step 4: Create the user profile document in Firestore
      const userRef = tenantRef.collection(FIRESTORE_COLLECTIONS.USERS).doc(userId);
      const newUserProfile: User = {
        tenantId: tenantId,
        name: adminName,
        email: adminEmail,
        role: USER_ROLES.ADMIN,
        status: USER_STATUSES.ACTIVE,
        createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      };
      batch.set(userRef, newUserProfile);

      // Step 5: Create the default configuration document for the tenant
      const configRef = tenantRef.collection(FIRESTORE_COLLECTIONS.CONFIG).doc("default");
      const defaultConfig: TenantConfig = {
        tenantId: tenantId,
        dataRetentionDays: DEFAULT_TENANT_CONFIG.DATA_RETENTION_DAYS,
        approvalLevels: DEFAULT_TENANT_CONFIG.APPROVAL_LEVELS,
        timezone: DEFAULT_TENANT_CONFIG.TIMEZONE,
      };
      batch.set(configRef, defaultConfig);

      // Step 6: Atomically commit all Firestore operations
      await batch.commit();

      return { tenantId, userId };

    } catch (error: any) {
      // CRITICAL: Cleanup on failure. If the Auth user was created but the
      // Firestore transaction failed, we must delete the orphaned Auth user.
      if (newUserRecord) {
        await auth.deleteUser(newUserRecord.uid).catch((deleteError) => {
          // Log the cleanup failure, as this requires manual intervention
          console.error(`CRITICAL: Failed to clean up orphaned auth user ${newUserRecord.uid}`, deleteError);
        });
      }

      if (error.code === 'auth/email-already-exists') {
        throw new HttpsError("already-exists", "This email address is already in use by another account.");
      }

      console.error("Tenant provisioning failed:", error);
      throw new HttpsError("internal", "An unexpected error occurred while setting up the new account. Please try again later.");
    }
  }
}
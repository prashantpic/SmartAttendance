import * as admin from "firebase-admin";
import {
  DEFAULT_APPROVAL_LEVELS,
  DEFAULT_DATA_RETENTION_DAYS,
} from "../config/tenant.defaults";

/**
 * @interface ProvisionBatchDetails
 * @description Defines the data structure required to provision a new tenant
 * and its related documents in a single batch operation.
 */
interface ProvisionBatchDetails {
  tenantId: string;
  organizationName: string;
  userId: string;
  adminFullName: string;
  adminEmail: string;
}

/**
 * @class FirestoreRepository
 * @description Abstracts all interactions with the Firestore database for the
 * tenant provisioning process. It provides clean, testable methods for data
 * persistence and querying, ensuring operations like tenant creation are atomic.
 */
export class FirestoreRepository {
  /**
   * @param db The Firebase Admin Firestore service instance.
   */
  constructor(private readonly db: admin.firestore.Firestore) {}

  /**
   * Generates a new, unique document ID within the 'tenants' collection.
   * @returns A unique string ID for a new tenant.
   */
  public generateTenantId(): string {
    return this.db.collection("tenants").doc().id;
  }

  /**
   * Checks if a user with the given email exists in any tenant across the
   * entire system. This is crucial for enforcing global email uniqueness.
   * @param email The email address to check.
   * @returns A promise that resolves to true if the user exists, false otherwise.
   */
  public async doesUserExistInAnyTenant(email: string): Promise<boolean> {
    const querySnapshot = await this.db
      .collectionGroup("users")
      .where("email", "==", email)
      .limit(1)
      .get();
    return !querySnapshot.empty;
  }

  /**
   * Atomically creates all necessary Firestore documents for a new tenant
   * using a batched write. This ensures that either all documents are created
   * successfully or none are, preventing partial, inconsistent data states.
   * @param details An object containing all necessary data for the new tenant.
   * @returns A promise that resolves when the batch has been committed.
   */
  public async provisionNewTenantInBatch(
    details: ProvisionBatchDetails,
  ): Promise<void> {
    const batch = this.db.batch();
    const serverTimestamp = admin.firestore.FieldValue.serverTimestamp();

    // 1. Define reference to the main tenant document
    const tenantRef = this.db.collection("tenants").doc(details.tenantId);

    // 2. Define reference to the admin's user profile document
    const userRef = tenantRef.collection("users").doc(details.userId);

    // 3. Define reference to the default configuration document
    const configRef = tenantRef.collection("config").doc("default");

    // 4. Set data for the Tenant Document
    batch.set(tenantRef, {
      organizationName: details.organizationName,
      createdAt: serverTimestamp,
      updatedAt: serverTimestamp,
    });

    // 5. Set data for the User Document
    batch.set(userRef, {
      name: details.adminFullName,
      email: details.adminEmail,
      role: "Admin",
      status: "Active",
      createdAt: serverTimestamp,
      updatedAt: serverTimestamp,
    });

    // 6. Set data for the Config Document
    batch.set(configRef, {
      tenantId: details.tenantId, // For enforcing one-to-one relationship
      dataRetentionDays: DEFAULT_DATA_RETENTION_DAYS,
      approvalLevels: DEFAULT_APPROVAL_LEVELS,
      createdAt: serverTimestamp,
      updatedAt: serverTimestamp,
    });

    // 7. Commit the entire batch as a single atomic operation
    await batch.commit();
  }
}
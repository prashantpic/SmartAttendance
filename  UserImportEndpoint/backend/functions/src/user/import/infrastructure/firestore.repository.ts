import { Firestore, getFirestore, WriteBatch, FieldValue } from "firebase-admin/firestore";
import { UserPayloadDto } from "../interfaces/user-payload.dto";

/**
 * Interface representing a User document fetched from Firestore.
 */
export interface User {
    userId: string;
    name: string;
    email: string;
    tenantId: string;
    supervisorId: string | null;
    role: 'Subordinate' | 'Supervisor' | 'Admin';
    status: 'Invited' | 'Active' | 'Deactivated';
}


/**
 * An adapter for interacting with the Firestore database. It abstracts away
 * Firestore-specific API calls for creating and querying user documents.
 * @summary Handles all communication with the Firestore database for user import.
 */
export class FirestoreRepository {
  private db: Firestore;

  constructor() {
    this.db = getFirestore();
  }

  /**
   * Retrieves all users for a given tenant.
   * @param tenantId The ID of the tenant.
   * @returns A promise that resolves to an array of User objects.
   */
  public async getAllUsersByTenant(tenantId: string): Promise<User[]> {
    const usersCollectionRef = this.db.collection(`/tenants/${tenantId}/users`);
    const snapshot = await usersCollectionRef.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        userId: doc.id,
        name: data.name,
        email: data.email,
        tenantId: data.tenantId,
        supervisorId: data.supervisorId || null,
        role: data.role,
        status: data.status,
      } as User;
    });
  }

  /**
   * Creates multiple user documents in a single atomic operation using a WriteBatch.
   * @param users An array of user payloads to create.
   * @param tenantId The ID of the tenant where users will be created.
   * @returns A promise that resolves when the batch write is complete.
   */
  public async batchCreateUsers(users: Omit<UserPayloadDto, 'createdAt' | 'updatedAt'>[], tenantId: string): Promise<void> {
    if (users.length === 0) {
      return;
    }

    const batch: WriteBatch = this.db.batch();
    const usersCollectionRef = this.db.collection("tenants").doc(tenantId).collection("users");

    for (const userPayload of users) {
      const docRef = usersCollectionRef.doc(); // Auto-generate document ID
      
      const completePayload: UserPayloadDto = {
        ...userPayload,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      batch.set(docRef, completePayload);
    }

    await batch.commit();
  }
}
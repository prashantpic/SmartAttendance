/**
 * @file user.repository.ts
 * @description Implements the IUserRepository interface. It handles all data
 * access operations related to user documents in Firestore, specifically for
 * retrieving information needed for notifications.
 */

import { Firestore } from "firebase-admin/firestore";
import { User } from "../domain/user";
import * as functions from "firebase-functions";

/**
 * Interface for the User repository, defining the contract for user data access.
 */
export interface IUserRepository {
  /**
   * Finds a user by their ID within a specific tenant.
   * @param {string} tenantId - The ID of the tenant.
   * @param {string} userId - The ID of the user to find.
   * @returns {Promise<User | null>} A promise that resolves to the User object or null if not found.
   */
  findById(tenantId: string, userId: string): Promise<User | null>;
}

/**
 * Provides a clean, abstracted interface for querying user data from Firestore.
 */
export class UserRepository implements IUserRepository {
  /**
   * @param {Firestore} db - An instance of the Firestore database.
   */
  constructor(private readonly db: Firestore) {}

  /**
   * Retrieves a user document from Firestore and maps it to a User domain object.
   * @param {string} tenantId - The ID of the tenant.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<User | null>} The User object or null.
   */
  public async findById(
    tenantId: string,
    userId: string
  ): Promise<User | null> {
    const userDocPath = `/tenants/${tenantId}/users/${userId}`;
    try {
      const docSnapshot = await this.db.doc(userDocPath).get();

      if (!docSnapshot.exists) {
        functions.logger.warn(`User document not found at path: ${userDocPath}`);
        return null;
      }

      const data = docSnapshot.data();
      if (!data) {
        functions.logger.error(`User document exists but has no data at path: ${userDocPath}`);
        return null;
      }
      
      // Map Firestore data to the User domain model.
      const user: User = {
        id: docSnapshot.id,
        name: data.name || "Unknown User", // Provide a fallback
        fcmToken: data.fcmToken || null,
      };

      return user;
    } catch (error) {
      functions.logger.error(
        `Error fetching user from Firestore at path ${userDocPath}:`,
        error
      );
      // Re-throwing allows the calling service to handle the failure.
      throw error;
    }
  }
}
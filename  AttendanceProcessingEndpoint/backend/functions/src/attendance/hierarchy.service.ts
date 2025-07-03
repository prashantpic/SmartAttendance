import * as functions from "firebase-functions";
import {Firestore} from "firebase-admin/firestore";
import {User} from "../core/models";

/**
 * Encapsulates the business logic for building a user's supervisory approval chain.
 */
export class HierarchyService {
  private static readonly MAX_DEPTH = 10;

  /**
   * @param {Firestore} db The Firestore database instance.
   */
  constructor(private readonly db: Firestore) {}

  /**
   * Traverses the user hierarchy starting from a given user to build their
   * full chain of command.
   *
   * @param {string} tenantId The ID of the tenant where the user belongs.
   * @param {string} userId The starting user's ID.
   * @return {Promise<string[]>} A promise that resolves to an ordered array
   * of supervisor IDs, from direct supervisor upwards.
   */
  public async buildApproverHierarchy(
    tenantId: string,
    userId: string
  ): Promise<string[]> {
    const hierarchy: string[] = [];
    let currentUserId: string | null | undefined = userId;

    for (let i = 0; i < HierarchyService.MAX_DEPTH && currentUserId; i++) {
      const userRef = this.db
        .collection("tenants")
        .doc(tenantId)
        .collection("users")
        .doc(currentUserId);

      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        functions.logger.warn(
          `User document not found for ID: ${currentUserId} in tenant: ${tenantId} during hierarchy build.`
        );
        break;
      }

      const userData = userDoc.data() as User;
      const {supervisorId} = userData;

      if (supervisorId && typeof supervisorId === "string") {
        hierarchy.push(supervisorId);
        currentUserId = supervisorId; // Continue traversal up the chain.
      } else {
        // Reached the top of the hierarchy for this user.
        break;
      }
    }

    if (hierarchy.length >= HierarchyService.MAX_DEPTH) {
      functions.logger.warn(
        `Hierarchy build for user ${userId} in tenant ${tenantId} reached max depth of ${HierarchyService.MAX_DEPTH}.`
      );
    }

    return hierarchy;
  }
}
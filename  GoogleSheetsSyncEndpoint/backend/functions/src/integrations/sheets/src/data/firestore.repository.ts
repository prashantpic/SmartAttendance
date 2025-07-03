import * as admin from "firebase-admin";
import { config } from "../config";
import { LinkedSheet, AttendanceRecord } from "../models/domain.model";
import * as functions from "firebase-functions";

export class FirestoreRepository {
  private db: admin.firestore.Firestore;

  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Fetches all linked sheet configurations across all tenants using a collection group query.
   * This is efficient as it avoids querying each tenant individually.
   * @returns {Promise<LinkedSheet[]>} A promise that resolves to an array of linked sheet configurations.
   */
  async getTenantsWithLinkedSheets(): Promise<LinkedSheet[]> {
    const snapshot = await this.db
      .collectionGroup(config.COLLECTIONS.LINKED_SHEETS)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const linkedSheets: LinkedSheet[] = snapshot.docs.map((doc) => {
      // The tenantId is the ID of the parent document of the 'linkedSheets' subcollection.
      const tenantId = doc.ref.parent.parent?.id;
      if (!tenantId) {
        // This should theoretically never happen in a valid structure.
        throw new Error(`Could not determine tenantId for sheet doc: ${doc.id}`);
      }
      return {
        id: doc.id,
        tenantId: tenantId,
        ...doc.data(),
      } as LinkedSheet;
    });

    return linkedSheets;
  }

  /**
   * Retrieves new, approved attendance records for a specific tenant that have not yet been synced.
   * @param {string} tenantId - The ID of the tenant.
   * @param {admin.firestore.Timestamp} [lastSyncTimestamp] - The timestamp of the last successful sync.
   * @returns {Promise<AttendanceRecord[]>} A promise that resolves to an array of new attendance records.
   */
  async getNewApprovedAttendanceRecords(
    tenantId: string,
    lastSyncTimestamp?: admin.firestore.Timestamp
  ): Promise<AttendanceRecord[]> {
    const attendanceCollectionRef = this.db.collection(
      `${config.COLLECTIONS.TENANTS}/${tenantId}/${config.COLLECTIONS.ATTENDANCE}`
    );

    let query: admin.firestore.Query = attendanceCollectionRef
      .where("status", "==", "Approved")
      .orderBy("serverSyncTimestamp", "asc");

    // If we have a timestamp from a previous sync, fetch only records created after it.
    if (lastSyncTimestamp) {
      query = query.where("serverSyncTimestamp", ">", lastSyncTimestamp);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as AttendanceRecord)
    );
  }

  /**
   * Updates the sync status and related metadata for a linked sheet document.
   * @param {string} tenantId - The ID of the tenant.
   * @param {string} sheetId - The ID of the linked sheet document.
   * @param {'Success' | 'Failed' | 'In Progress'} status - The new sync status.
   * @param {{ error?: string }} [details] - Additional details, like an error message for failed syncs.
   */
  async updateSyncStatus(
    tenantId: string,
    sheetId: string,
    status: "Success" | "Failed" | "In Progress",
    details?: { error?: string }
  ): Promise<void> {
    const sheetDocRef = this.db.doc(
      `${config.COLLECTIONS.TENANTS}/${tenantId}/${config.COLLECTIONS.LINKED_SHEETS}/${sheetId}`
    );

    const payload: { [key: string]: any } = {
      lastSyncStatus: status,
    };

    switch (status) {
      case "Success":
        payload.lastSyncTimestamp = admin.firestore.FieldValue.serverTimestamp();
        payload.lastSyncError = admin.firestore.FieldValue.delete(); // Clear any previous error
        break;
      case "Failed":
        payload.lastSyncError =
          details?.error || "An unknown error occurred.";
        break;
      case "In Progress":
        // No extra fields needed, just update the status.
        break;
    }

    payload.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    functions.logger.info(
      `Updating sync status to '${status}' for sheet ${sheetId} of tenant ${tenantId}.`
    );
    await sheetDocRef.update(payload);
  }
}
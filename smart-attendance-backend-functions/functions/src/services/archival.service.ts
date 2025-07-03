import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { FIRESTORE_COLLECTIONS } from "../common/constants";
import { TenantConfig, Attendance } from "../domain/models";

/**
 * Service to handle data archival and purging based on tenant-defined retention policies.
 */
export class ArchivalService {
  /**
   * Archives old attendance records from Firestore to Cloud Storage and then
   * purges them from Firestore.
   *
   * @param {string} tenantId The ID of the tenant whose data needs to be processed.
   * @returns {Promise<void>}
   */
  public static async archiveAndPurgeOldRecords(tenantId: string): Promise<void> {
    const db = admin.firestore();
    const storage = admin.storage().bucket(); // Default bucket

    try {
      // 1. Fetch the tenant's data retention policy
      const configRef = db
        .collection(FIRESTORE_COLLECTIONS.TENANTS)
        .doc(tenantId)
        .collection(FIRESTORE_COLLECTIONS.CONFIG)
        .doc("default");

      const configDoc = await configRef.get();
      if (!configDoc.exists) {
        functions.logger.warn(`No config found for tenant ${tenantId}. Skipping archival.`);
        return;
      }
      const { dataRetentionDays } = configDoc.data() as TenantConfig;

      // 2. Calculate the cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dataRetentionDays);
      const cutoffTimestamp = admin.firestore.Timestamp.fromDate(cutoffDate);

      // 3. Query for records to archive (process in batches)
      const attendanceCollection = db
        .collection(FIRESTORE_COLLECTIONS.TENANTS)
        .doc(tenantId)
        .collection(FIRESTORE_COLLECTIONS.ATTENDANCE);
      
      const query = attendanceCollection
        .where("clientCheckInTimestamp", "<", cutoffTimestamp)
        .limit(500); // Process up to 500 records per run to stay within limits

      const snapshot = await query.get();

      if (snapshot.empty) {
        functions.logger.info(`No old records to archive for tenant ${tenantId}.`);
        return;
      }

      const recordsToArchive = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 4. Serialize records to NDJSON format
      const ndjson = recordsToArchive
        .map((record) => JSON.stringify(record))
        .join("\n");

      // 5. Upload the archive file to Cloud Storage
      const archiveDate = new Date().toISOString();
      const filePath = `archives/${tenantId}/${archiveDate}.ndjson`;
      const file = storage.file(filePath);

      await file.save(Buffer.from(ndjson, "utf8"), {
        contentType: "application/x-ndjson",
      });
      functions.logger.info(`Successfully archived ${recordsToArchive.length} records to ${filePath}.`);

      // 6. CRUCIAL: Only after successful upload, purge records from Firestore
      const batch = db.batch();
      for (const record of recordsToArchive) {
        batch.delete(attendanceCollection.doc(record.id));
      }
      await batch.commit();
      functions.logger.info(`Successfully purged ${recordsToArchive.length} archived records from Firestore for tenant ${tenantId}.`);

    } catch (error: any) {
      functions.logger.error(`Error during archival process for tenant ${tenantId}:`, error);
    }
  }
}
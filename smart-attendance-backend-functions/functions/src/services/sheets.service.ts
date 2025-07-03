import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { google, sheets_v4 } from "googleapis";
import { FIRESTORE_COLLECTIONS } from "../common/constants";
import { LinkedSheet, Attendance } from "../domain/models";

/**
 * Service to handle the integration and data synchronization with Google Sheets.
 */
export class SheetsService {
  /**
   * Synchronizes approved attendance data for a given tenant to their linked Google Sheet.
   * It fetches records created since the last successful sync.
   *
   * @param {string} tenantId The ID of the tenant whose data needs to be synced.
   * @returns {Promise<void>}
   */
  public static async syncTenantDataToSheet(tenantId: string): Promise<void> {
    const db = admin.firestore();
    const sheetConfigRef = db
      .collection(FIRESTORE_COLLECTIONS.LINKED_SHEETS)
      .doc(tenantId); // Assuming linkedSheetId is the tenantId for simplicity

    let linkedSheet: LinkedSheet;

    try {
      const doc = await sheetConfigRef.get();
      if (!doc.exists) {
        functions.logger.info(`No linked sheet found for tenant ${tenantId}. Skipping sync.`);
        return;
      }
      linkedSheet = doc.data() as LinkedSheet;

      // Authenticate with Google Sheets API
      // Note: This assumes OAuth2 credentials are set up in the environment.
      // For a real application, you'd manage tokens securely.
      const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      const sheets = google.sheets({ version: "v4", auth });

      // Query for new, approved attendance records
      let query = db
        .collection(FIRESTORE_COLLECTIONS.TENANTS)
        .doc(tenantId)
        .collection(FIRESTORE_COLLECTIONS.ATTENDANCE)
        .where("status", "==", "Approved")
        .orderBy("serverSyncTimestamp", "asc");

      if (linkedSheet.lastSyncTimestamp) {
        query = query.startAfter(linkedSheet.lastSyncTimestamp);
      }

      const snapshot = await query.limit(500).get(); // Process up to 500 records per run
      if (snapshot.empty) {
        functions.logger.info(`No new records to sync for tenant ${tenantId}.`);
        await sheetConfigRef.update({ lastSyncStatus: "Success" });
        return;
      }

      const newRows = snapshot.docs.map((docSnap) => {
        const record = docSnap.data() as Attendance;
        // Format the record into an array of values matching the sheet's columns
        return [
          docSnap.id,
          record.userId,
          record.userName,
          record.clientCheckInTimestamp.toDate().toISOString(),
          record.clientCheckOutTimestamp?.toDate().toISOString() || "",
          record.checkInAddress || "N/A",
          record.checkOutAddress || "N/A",
          record.status,
          record.approvalDetails?.approverId || "",
        ];
      });

      // Append new rows to the sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId: linkedSheet.fileId,
        range: "A1", // Append after the last row in the sheet
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: newRows,
        },
      });
      
      // Update the last sync timestamp to the timestamp of the last processed record
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const lastTimestamp = (lastDoc.data() as Attendance).serverSyncTimestamp;

      await sheetConfigRef.update({
        lastSyncStatus: "Success",
        lastSyncTimestamp: lastTimestamp,
        lastSyncError: admin.firestore.FieldValue.delete(),
      });

      functions.logger.info(`Successfully synced ${newRows.length} records for tenant ${tenantId}.`);

    } catch (error: any) {
      functions.logger.error(`Failed to sync data to Google Sheet for tenant ${tenantId}:`, error);
      await sheetConfigRef.update({
        lastSyncStatus: "Failed",
        lastSyncError: error.message || "An unknown error occurred.",
      });
    }
  }
}
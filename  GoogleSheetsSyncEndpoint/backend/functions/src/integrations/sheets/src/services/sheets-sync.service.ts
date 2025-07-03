import { FirestoreRepository } from "../data/firestore.repository";
import { GoogleSheetsClient } from "../integrations/google-sheets.client";
import { LinkedSheet } from "../models/domain.model";
import { mapAttendanceToSheetRows } from "../utils/data.mapper";
import * as functions from "firebase-functions";

export class SheetsSyncService {
  constructor(
    private firestoreRepo: FirestoreRepository,
    private sheetsClient: GoogleSheetsClient
  ) {}

  /**
   * Main entry point to run the sync job for all tenants with linked sheets.
   * It processes each tenant's sync operation in parallel.
   */
  public async runSync(): Promise<void> {
    const sheetsToSync = await this.firestoreRepo.getTenantsWithLinkedSheets();
    functions.logger.info(`Found ${sheetsToSync.length} sheets to process.`);

    if (sheetsToSync.length === 0) {
      return;
    }

    const syncPromises = sheetsToSync.map((sheet) => this.syncTenant(sheet));

    // Use Promise.allSettled to ensure that one failed sync does not stop others.
    const results = await Promise.allSettled(syncPromises);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        functions.logger.error(
          `Unhandled exception during sync for tenant: ${sheetsToSync[index].tenantId}`,
          { reason: result.reason }
        );
      }
    });
  }

  /**
   * Executes the full sync logic for a single tenant's linked sheet.
   * This includes status updates, data fetching, transformation, and writing.
   */
  private async syncTenant(sheetInfo: LinkedSheet): Promise<void> {
    const { tenantId, id: sheetId, fileId, lastSyncTimestamp } = sheetInfo;
    functions.logger.info(`Starting sync for tenant: ${tenantId}, sheet: ${sheetId}`);

    try {
      // 1. Set status to 'In Progress' to prevent concurrent runs.
      await this.firestoreRepo.updateSyncStatus(tenantId, sheetId, "In Progress");

      // 2. Get new approved attendance records since the last successful sync.
      const records = await this.firestoreRepo.getNewApprovedAttendanceRecords(
        tenantId,
        lastSyncTimestamp
      );

      if (records.length === 0) {
        functions.logger.info(`No new records to sync for tenant: ${tenantId}.`);
        await this.firestoreRepo.updateSyncStatus(tenantId, sheetId, "Success");
        return;
      }

      // 3. Get the current headers from the Google Sheet.
      const headers = await this.sheetsClient.getSheetHeaders(fileId);

      // 4. Map Firestore data to a 2D array based on sheet headers.
      const rows = mapAttendanceToSheetRows(records, headers);

      // 5. Append the formatted rows to the sheet.
      await this.sheetsClient.appendRows(fileId, rows);

      // 6. Set status to 'Success' and update the sync timestamp.
      await this.firestoreRepo.updateSyncStatus(tenantId, sheetId, "Success");
      functions.logger.info(
        `Successfully synced ${records.length} records for tenant: ${tenantId}.`
      );
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error";
      functions.logger.error(
        `Failed to sync for tenant: ${tenantId}, sheet: ${sheetId}.`,
        { error: errorMessage, stack: error.stack }
      );
      // 7. If any step fails, set status to 'Failed' and record the error.
      await this.firestoreRepo.updateSyncStatus(tenantId, sheetId, "Failed", {
        error: errorMessage,
      });
    }
  }
}
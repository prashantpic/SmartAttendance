import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FIRESTORE_COLLECTIONS } from "../common/constants";
import { SheetsService } from "../services/sheets.service";
import { ArchivalService } from "../services/archival.service";

/**
 * Defines and exports all scheduled (pub/sub) Cloud Functions for recurring tasks.
 */

/**
 * A scheduled function that runs every 24 hours to sync data to Google Sheets
 * for all tenants who have enabled the integration.
 */
export const syncToGoogleSheets = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    functions.logger.info("Starting scheduled job: syncToGoogleSheets");

    const db = admin.firestore();
    const linkedSheetsSnapshot = await db.collection(FIRESTORE_COLLECTIONS.LINKED_SHEETS).get();

    if (linkedSheetsSnapshot.empty) {
      functions.logger.info("No linked sheets configured. Job finished.");
      return;
    }

    const syncPromises = linkedSheetsSnapshot.docs.map(doc => {
      const tenantId = doc.data().tenantId;
      return SheetsService.syncTenantDataToSheet(tenantId);
    });

    const results = await Promise.allSettled(syncPromises);

    results.forEach((result, index) => {
        const tenantId = linkedSheetsSnapshot.docs[index].data().tenantId;
        if (result.status === 'rejected') {
            functions.logger.error(`Sync failed for tenant ${tenantId}:`, result.reason);
        } else {
            functions.logger.info(`Sync job completed for tenant ${tenantId}.`);
        }
    });

    functions.logger.info("Finished scheduled job: syncToGoogleSheets");
});

/**
 * A scheduled function that runs every 24 hours to archive and purge old data
 * for all tenants based on their respective retention policies.
 */
export const archiveOldData = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    functions.logger.info("Starting scheduled job: archiveOldData");

    const db = admin.firestore();
    const tenantsSnapshot = await db.collection(FIRESTORE_COLLECTIONS.TENANTS).get();

    if (tenantsSnapshot.empty) {
        functions.logger.info("No tenants found. Job finished.");
        return;
    }

    const archivalPromises = tenantsSnapshot.docs.map(doc => {
        const tenantId = doc.id;
        return ArchivalService.archiveAndPurgeOldRecords(tenantId);
    });

    const results = await Promise.allSettled(archivalPromises);

     results.forEach((result, index) => {
        const tenantId = tenantsSnapshot.docs[index].id;
        if (result.status === 'rejected') {
            functions.logger.error(`Archival failed for tenant ${tenantId}:`, result.reason);
        } else {
            functions.logger.info(`Archival job completed for tenant ${tenantId}.`);
        }
    });

    functions.logger.info("Finished scheduled job: archiveOldData");
});
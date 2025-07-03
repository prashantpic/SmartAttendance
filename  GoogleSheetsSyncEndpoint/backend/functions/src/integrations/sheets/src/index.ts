import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { config } from "./config";
import { SheetsSyncService } from "./services/sheets-sync.service";
import { FirestoreRepository } from "./data/firestore.repository";
import { GoogleSheetsClient } from "./integrations/google-sheets.client";

// Initialize Firebase Admin SDK.
// This is done once when the function instance is cold-started.
admin.initializeApp();

/**
 * Firebase Cloud Function triggered on a schedule to sync approved attendance
 * records from Firestore to tenant-linked Google Sheets.
 */
export const syncDataToGoogleSheets = functions
  .region(config.REGION)
  .pubsub.schedule(config.SCHEDULE)
  .timeZone(config.TIMEZONE)
  .onRun(async (context) => {
    functions.logger.info("Scheduled Google Sheets Sync function triggered.", {
      eventId: context.eventId,
    });

    try {
      // Composition Root: Instantiate all dependencies.
      const firestoreRepo = new FirestoreRepository();
      const sheetsClient = new GoogleSheetsClient();
      const syncService = new SheetsSyncService(firestoreRepo, sheetsClient);

      // Execute the main sync process.
      await syncService.runSync();

      functions.logger.info(
        "Scheduled Google Sheets Sync function finished successfully."
      );
    } catch (error) {
      // This is a top-level catch for any unhandled exceptions from the service.
      functions.logger.error(
        "A critical unhandled error occurred in the Google Sheets Sync function.",
        error
      );
    }
  });
An SDS for this repository is not found. Generating a new one.
# Software Design Specification: GoogleSheetsSyncEndpoint

## 1. Introduction

This document outlines the software design for the `GoogleSheetsSyncEndpoint` repository. This component is a scheduled, idempotent Firebase Cloud Function written in TypeScript. Its primary responsibility is to automatically export approved attendance records from Firestore to a Google Sheet linked by a tenant. This design covers data access, integration with Google APIs, business logic, error handling, and overall orchestration.

### 1.1. Purpose

The purpose of this function is to provide an automated, reliable, and resilient data export mechanism for tenant administrators. It ensures that attendance data can be periodically moved to a familiar reporting tool (Google Sheets) for archival, analysis, or further processing, without manual intervention.

### 1.2. Scope

The scope of this repository is limited to the Cloud Function and its related logic for:
-   Running on a predefined schedule.
-   Querying all tenants to find those with active Google Sheet integrations.
-   Fetching new, approved attendance records for each tenant.
-   Authenticating and communicating with the Google Sheets and Google Drive APIs.
-   Appending data to the correct sheet, resiliently handling column reordering.
-   Managing and reporting the sync status (`In Progress`, `Success`, `Failed`).
-   Handling transient and terminal API errors gracefully.

---

## 2. System Architecture & Design

The function adheres to an **Event-Driven Architecture**, triggered by a time-based schedule (`onSchedule`). It follows a layered design to promote separation of concerns, maintainability, and testability.

-   **Controller (`index.ts`):** The function's entry point, responsible for triggering the process.
-   **Service (`sheets-sync.service.ts`):** Orchestrates the entire workflow and contains the core business logic.
-   **Repository (`firestore.repository.ts`):** Manages all data access and communication with Firestore.
-   **Client (`google-sheets.client.ts`):** Encapsulates all interactions with the external Google Sheets API.
-   **Utilities & Models:** Provide data structures (`domain.model.ts`) and helper functions (`data.mapper.ts`).

---

## 3. Component Design

This section details the design of each file within the repository.

### 3.1. `package.json` (Configuration)

-   **Purpose:** To manage all project dependencies, development dependencies, and scripts.
-   **Dependencies:**
    -   `firebase-admin`: For interacting with Firebase services (Firestore) from a trusted environment.
    -   `firebase-functions`: The core SDK for defining Cloud Functions.
    -   `googleapis`: The official Google client library for Node.js to interact with Sheets and Drive APIs.
-   **Dev Dependencies:**
    -   `typescript`: For compiling TypeScript to JavaScript.
    -   `eslint` & plugins: For static code analysis and linting.
    -   `@types/node`: Type definitions for Node.js.
-   **Scripts:**
    -   `lint`: "eslint --ext .js,.ts ."
    -   `build`: "tsc"
    -   `serve`: "npm run build && firebase emulators:start --only functions"
    -   `deploy`: "firebase deploy --only functions"

### 3.2. `tsconfig.json` (Configuration)

-   **Purpose:** To configure the TypeScript compiler.
-   **Key `compilerOptions`:**
    -   `"module": "commonjs"`: Specifies the module system for Node.js.
    -   `"target": "es2021"`: Targets a modern ECMAScript version compatible with the Cloud Functions Node.js runtime.
    -   `"outDir": "lib"`: Specifies the output directory for compiled JavaScript.
    -   `"sourceMap": true`: Enables source maps for easier debugging.
    -   `"strict": true`: Enforces strict type-checking.
    -   `"esModuleInterop": true`: Allows for cleaner imports of CommonJS modules.

### 3.3. `src/config.ts` (Configuration)

-   **Purpose:** To centralize all environment-specific configurations and application constants.
-   **Implementation:**
    typescript
    import * as functions from 'firebase-functions';

    export const config = {
      // Schedule for the function to run. e.g., 'every 24 hours' or '0 3 * * *' for 3 AM daily.
      SCHEDULE: '0 3 * * *',
      TIMEZONE: 'America/New_York', // Timezone for the scheduled function.
      REGION: 'us-central1',

      // Firestore collection names
      COLLECTIONS: {
        TENANTS: 'tenants',
        LINKED_SHEETS: 'linkedSheets',
        ATTENDANCE: 'attendance',
      },

      // Google API Scopes
      GOOGLE_API_SCOPES: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.readonly',
      ],

      // Retry mechanism settings for Google API calls
      RETRY: {
        MAX_RETRIES: 3,
        INITIAL_BACKOFF_MS: 1000,
      }
    };
    

### 3.4. `src/models/domain.model.ts` (Model)

-   **Purpose:** Defines TypeScript interfaces for all domain entities to ensure type safety.
-   **Interfaces:**
    typescript
    import * as admin from 'firebase-admin';

    // Represents the /tenants/{tenantId}/linkedSheets/{sheetId} document
    export interface LinkedSheet {
      id: string; // The document ID
      tenantId: string;
      fileId: string;
      ownerEmail: string;
      lastSyncStatus: 'Success' | 'Failed' | 'In Progress' | 'Not Started';
      lastSyncTimestamp?: admin.firestore.Timestamp;
      lastSyncError?: string;
    }
    
    // Represents a simplified attendance record for export
    export interface AttendanceRecord {
      userId: string;
      userName: string;
      eventId?: string;
      clientCheckInTimestamp: admin.firestore.Timestamp;
      clientCheckOutTimestamp?: admin.firestore.Timestamp;
      checkInAddress?: string;
      checkOutAddress?: string;
      status: 'Approved'; // The query will only fetch approved records
      approvalDetails?: {
        approverId: string;
        timestamp: admin.firestore.Timestamp;
        comments?: string;
      };
    }
    

### 3.5. `src/data/firestore.repository.ts` (Repository)

-   **Purpose:** To abstract all Firestore data operations.
-   **Class Design:**
    typescript
    import * as admin from 'firebase-admin';
    import { config } from '../config';
    import { LinkedSheet, AttendanceRecord } from '../models/domain.model';

    export class FirestoreRepository {
      private db: admin.firestore.Firestore;

      constructor() {
        this.db = admin.firestore();
      }

      /**
       * Fetches all linked sheet configurations across all tenants.
       * Uses a collection group query for efficiency.
       */
      async getTenantsWithLinkedSheets(): Promise<LinkedSheet[]> {
        // Logic to perform a collectionGroup query on 'linkedSheets'.
        // For each doc, map it to the LinkedSheet interface, including its parent tenantId.
      }

      /**
       * Retrieves new, approved attendance records for a given tenant since the last sync.
       */
      async getNewApprovedAttendanceRecords(
        tenantId: string,
        lastSyncTimestamp?: admin.firestore.Timestamp
      ): Promise<AttendanceRecord[]> {
        // Logic to build a query on the tenant's 'attendance' subcollection.
        // WHERE status == 'Approved'
        // WHERE serverSyncTimestamp > lastSyncTimestamp (if provided)
        // ORDER BY serverSyncTimestamp ASC
      }

      /**
       * Updates the sync status and timestamp for a linked sheet.
       */
      async updateSyncStatus(
        tenantId: string,
        sheetId: string,
        status: 'Success' | 'Failed' | 'In Progress',
        details?: { error?: string }
      ): Promise<void> {
        // Logic to get the document reference: /tenants/{tenantId}/linkedSheets/{sheetId}
        // Build an update payload:
        // - status: status
        // - If Success: lastSyncTimestamp = serverTimestamp(), lastSyncError = deleteField()
        // - If Failed: lastSyncError = details.error
        // - Use docRef.update(payload).
      }
    }
    

### 3.6. `src/integrations/google-sheets.client.ts` (Service/Client)

-   **Purpose:** To encapsulate all communication with Google Sheets and Drive APIs, including authentication and error handling.
-   **Class Design:**
    typescript
    import { google, sheets_v4 } from 'googleapis';
    import { config } from '../config';

    export class GoogleSheetsClient {
      private sheets: sheets_v4.Sheets;

      constructor() {
        // Authentication logic will be handled here or in an init method.
        // Uses a service account key provided via environment configuration.
        const auth = new google.auth.GoogleAuth({
          scopes: config.GOOGLE_API_SCOPES,
        });
        this.sheets = google.sheets({ version: 'v4', auth });
      }

      /**
       * Fetches the header row (first row) from the specified sheet.
       * Implements retry logic for transient errors.
       */
      async getSheetHeaders(fileId: string): Promise<string[]> {
        // Use this.sheets.spreadsheets.values.get for range 'A1:Z1'.
        // Throw a terminal error for 403 (Permission Denied) or 404 (Not Found).
        // Retry on 429 (Rate Limited) or 5xx errors using exponential backoff.
      }

      /**
       * Appends new rows of data to the specified sheet.
       * Implements retry logic for transient errors.
       */
      async appendRows(fileId: string, rows: any[][]): Promise<void> {
        // Use this.sheets.spreadsheets.values.append.
        // Set valueInputOption to 'USER_ENTERED' to allow Sheets to parse dates correctly.
        // Set insertDataOption to 'INSERT_ROWS'.
        // Implement retry logic similar to getSheetHeaders.
      }
    }
    

### 3.7. `src/utils/data.mapper.ts` (Utility)

-   **Purpose:** To transform Firestore `AttendanceRecord` objects into a 2D array that matches the Google Sheet's column order.
-   **Function Design:**
    typescript
    import { AttendanceRecord } from '../models/domain.model';

    /**
     * Maps an array of AttendanceRecord objects to a 2D array for Google Sheets,
     * ordering the data based on the provided headers array.
     */
    export function mapAttendanceToSheetRows(
      records: AttendanceRecord[],
      headers: string[]
    ): any[][] {
      const lowerCaseHeaders = headers.map(h => h.toLowerCase().trim());

      // Define a mapping from a standardized key to a function that extracts the value.
      const valueExtractorMap: { [key: string]: (rec: AttendanceRecord) => any } = {
        'userid': rec => rec.userId,
        'username': rec => rec.userName,
        'checkintime': rec => rec.clientCheckInTimestamp.toDate(),
        'checkouttime': rec => rec.clientCheckOutTimestamp?.toDate() || '',
        'checkinaddress': rec => rec.checkInAddress || '',
        // ... add all other potential columns
      };

      return records.map(record => {
        return lowerCaseHeaders.map(header => {
          const extractor = valueExtractorMap[header];
          return extractor ? extractor(record) : ''; // Return blank if header is unknown
        });
      });
    }
    

### 3.8. `src/services/sheets-sync.service.ts` (Service)

-   **Purpose:** To orchestrate the entire sync process, containing the main business logic.
-   **Class Design:**
    typescript
    import { FirestoreRepository } from '../data/firestore.repository';
    import { GoogleSheetsClient } from '../integrations/google-sheets.client';
    import { LinkedSheet } from '../models/domain.model';
    import { mapAttendanceToSheetRows } from '../utils/data.mapper';
    import * as functions from 'firebase-functions';

    export class SheetsSyncService {
      constructor(
        private firestoreRepo: FirestoreRepository,
        private sheetsClient: GoogleSheetsClient
      ) {}

      /**
       * Main entry point to run the sync job for all tenants.
       */
      public async runSync(): Promise<void> {
        const sheetsToSync = await this.firestoreRepo.getTenantsWithLinkedSheets();
        const syncPromises = sheetsToSync.map(sheet => this.syncTenant(sheet));
        await Promise.allSettled(syncPromises); // Ensure one failure doesn't stop others.
      }

      /**
       * Executes the sync logic for a single tenant.
       */
      private async syncTenant(sheetInfo: LinkedSheet): Promise<void> {
        functions.logger.info(`Starting sync for tenant: ${sheetInfo.tenantId}`);
        try {
          // 1. Set status to 'In Progress'
          await this.firestoreRepo.updateSyncStatus(sheetInfo.tenantId, sheetInfo.id, 'In Progress');

          // 2. Get new records
          const records = await this.firestoreRepo.getNewApprovedAttendanceRecords(
            sheetInfo.tenantId,
            sheetInfo.lastSyncTimestamp
          );
          if (records.length === 0) {
            functions.logger.info(`No new records to sync for tenant: ${sheetInfo.tenantId}`);
            await this.firestoreRepo.updateSyncStatus(sheetInfo.tenantId, sheetInfo.id, 'Success');
            return;
          }

          // 3. Get sheet headers
          const headers = await this.sheetsClient.getSheetHeaders(sheetInfo.fileId);

          // 4. Map data
          const rows = mapAttendanceToSheetRows(records, headers);

          // 5. Append rows
          await this.sheetsClient.appendRows(sheetInfo.fileId, rows);

          // 6. Set status to 'Success'
          await this.firestoreRepo.updateSyncStatus(sheetInfo.tenantId, sheetInfo.id, 'Success');
          functions.logger.info(`Successfully synced ${records.length} records for tenant: ${sheetInfo.tenantId}`);

        } catch (error: any) {
          functions.logger.error(`Failed to sync for tenant: ${sheetInfo.tenantId}`, { error: error.message });
          // 7. Set status to 'Failed'
          await this.firestoreRepo.updateSyncStatus(sheetInfo.tenantId, sheetInfo.id, 'Failed', { error: error.message });
        }
      }
    }
    

### 3.9. `src/index.ts` (Controller)

-   **Purpose:** The entry point for the Firebase Cloud Function, defining the trigger and initializing the service.
-   **Implementation:**
    typescript
    import * as functions from 'firebase-functions';
    import * as admin from 'firebase-admin';
    import { config } from './config';
    import { SheetsSyncService } from './services/sheets-sync.service';
    import { FirestoreRepository } from './data/firestore.repository';
    import { GoogleSheetsClient } from './integrations/google-sheets.client';

    admin.initializeApp();

    export const syncDataToGoogleSheets = functions
      .region(config.REGION)
      .pubsub.schedule(config.SCHEDULE)
      .timeZone(config.TIMEZONE)
      .onRun(async (context) => {
        functions.logger.info('Scheduled Google Sheets Sync function triggered.');
        try {
          const firestoreRepo = new FirestoreRepository();
          const sheetsClient = new GoogleSheetsClient();
          const syncService = new SheetsSyncService(firestoreRepo, sheetsClient);

          await syncService.runSync();
          functions.logger.info('Scheduled Google Sheets Sync function finished successfully.');

        } catch (error) {
          functions.logger.error('Unhandled error in Google Sheets Sync function', error);
        }
      });
    
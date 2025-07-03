# Software Design Specification (SDS) for DataArchivalEndpoint

## 1. Introduction

This document provides a detailed software design for the `DataArchivalEndpoint` repository. This repository contains a single, scheduled Firebase Cloud Function responsible for enforcing data retention policies across all tenants in the system.

The function will:
1.  Run on a daily schedule.
2.  Iterate through each active tenant.
3.  Read the tenant's specific `dataRetentionDays` configuration.
4.  Query for `attendance` records older than the calculated retention period.
5.  Archive the fetched records to a tenant-specific folder in Firebase Storage in Newline Delimited JSON (NDJSON) format.
6.  Upon successful archival of a batch, purge (delete) those same records from Firestore.

This process is designed to be idempotent, scalable, and resilient to failures to prevent data loss.

## 2. System Architecture & Design

The function adheres to a clean, layered architecture to separate concerns and improve maintainability and testability.

-   **Handler (`index.ts`):** The function entry point, responsible for triggering and dependency injection.
-   **Application (`archival.service.ts`):** Contains the core business logic and orchestrates the archival workflow.
-   **Infrastructure (`firestore.repository.ts`, `storage.repository.ts`):** Abstracts all interactions with external services (Firestore, Firebase Storage).
-   **Domain (`models.ts`):** Defines the data structures (types/interfaces).
-   **Utilities (`ndjson.formatter.ts`):** Provides reusable helper functions.
-   **Configuration (`archival.config.ts`):** Manages static configuration values.

## 3. High-Level Logic Flow

mermaid
graph TD
    A[Cloud Scheduler Trigger] --> B{DataArchivalEndpoint};
    B --> C[ArchivalService.executeArchivalProcess];
    C --> D{Get All Active Tenants};
    D --> E{For Each Tenant...};
    E --> F[Get Tenant Config (dataRetentionDays)];
    F --> G{Calculate Cutoff Date};
    G --> H{Fetch Batch of Old Attendance Records};
    H --> I{Any Records?};
    I -- Yes --> J[Format Records to NDJSON];
    J --> K[Save Archive to Storage];
    K -- Success --> L[Purge Records from Firestore];
    L --> H;
    K -- Failure --> M[Log Error & Skip Purge];
    I -- No --> N[End Tenant Processing];
    N --> E;
    E -- All Tenants Processed --> O[End Job];

    subgraph Infrastructure
        D; F; H; K; L;
    end


## 4. Detailed Component Specification

### 4.1. Configuration (`config/archival.config.ts`)

This file centralizes configuration constants.

| Member | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `SCHEDULE_CRON_EXPRESSION` | `string` | `"0 2 * * *"` | Cron expression for a daily trigger at 2:00 AM UTC. |
| `ARCHIVE_BATCH_SIZE` | `number` | `400` | The number of records to process in a single batch. This is kept below the Firestore batch write limit of 500 to be safe. |

### 4.2. Domain (`domain/models.ts`)

Defines the TypeScript interfaces for data transfer objects.

-   **`Tenant` interface:**
    typescript
    export interface Tenant {
      tenantId: string;
      organizationName: string;
      // Other fields as necessary
    }
    
-   **`TenantConfig` interface:**
    typescript
    export interface TenantConfig {
      dataRetentionDays: number;
      // Other config fields
    }
    
-   **`AttendanceRecord` interface:**
    typescript
    // A simplified interface for what's needed in the archival.
    // The actual record may have more fields.
    export interface AttendanceRecord {
      attendanceId: string;
      userId: string;
      clientCheckInTimestamp: { _seconds: number, _nanoseconds: number };
      // All other fields from the Firestore document
      [key: string]: any;
    }
    

### 4.3. Utility (`utils/ndjson.formatter.ts`)

Provides a function to format data into NDJSON.

-   **`toNdjson(records: any[]): string`**
    -   **Purpose:** Converts an array of JavaScript objects into a single NDJSON-formatted string.
    -   **Logic:**
        1.  Takes an array `records` as input.
        2.  If the array is empty, return an empty string.
        3.  Maps over each `record` in the array.
        4.  For each record, calls `JSON.stringify(record)`.
        5.  Joins the resulting array of JSON strings with a newline character (`\n`).
        6.  Returns the final string.

### 4.4. Infrastructure Layer

#### 4.4.1. Firestore Repository (`infrastructure/firestore.repository.ts`)

-   **`FirestoreRepository` class:**
    -   **Constructor:** Initializes a private `db` member with `admin.firestore()`.
    -   **`getActiveTenants(): Promise<Tenant[]>`:**
        -   Queries the root `tenants` collection.
        -   Returns an array of `Tenant` objects, mapping document IDs to `tenantId`.
    -   **`getTenantConfiguration(tenantId: string): Promise<TenantConfig | null>`:**
        -   Fetches the document at `/tenants/{tenantId}/config/default`.
        -   If the document exists, returns its data cast as `TenantConfig`.
        -   If not, returns `null`.
    -   **`getArchivableAttendance(tenantId: string, cutoffDate: Date, limit: number, startAfter?: DocumentSnapshot): Promise<QuerySnapshot>`:**
        -   Constructs a query against the `/tenants/{tenantId}/attendance` collection.
        -   Applies `where('clientCheckInTimestamp', '<=', cutoffDate)`.
        -   Applies `orderBy('clientCheckInTimestamp')`.
        -   Applies `limit(limit)`.
        -   If `startAfter` snapshot is provided, applies `startAfter(startAfter)`.
        -   Executes and returns the `QuerySnapshot`.
    -   **`purgeRecordsInBatch(recordRefs: DocumentReference[]): Promise<void>`:**
        -   Initializes a batched write: `const batch = db.batch()`.
        -   Iterates through the provided `recordRefs` array.
        -   For each `ref`, adds a delete operation to the batch: `batch.delete(ref)`.
        -   Commits the batch: `await batch.commit()`.

#### 4.4.2. Storage Repository (`infrastructure/storage.repository.ts`)

-   **`StorageRepository` class:**
    -   **Constructor:** Initializes a private `storage` member with `admin.storage()`.
    -   **`saveArchiveFile(tenantId: string, fileName: string, fileContent: string): Promise<void>`:**
        -   Gets the default storage bucket.
        -   Defines the file path: `archives/${tenantId}/${fileName}`.
        -   Gets a file reference: `const file = bucket.file(filePath)`.
        -   Uploads the content: `await file.save(fileContent, { contentType: 'application/x-ndjson' })`.

### 4.5. Application Layer (`application/archival.service.ts`)

-   **`ArchivalService` class:**
    -   **Constructor:** Accepts `firestoreRepo` and `storageRepo` as dependencies.
    -   **`executeArchivalProcess(): Promise<void>`:**
        -   Logs the start of the overall job.
        -   Calls `this.firestoreRepo.getActiveTenants()`.
        -   Uses `Promise.allSettled` to iterate over the tenants and call `this.processTenant(tenant)` for each. This ensures that a failure in one tenant does not stop the processing of others.
        -   Logs the results of `allSettled`, indicating which tenants succeeded or failed.
        -   Logs the completion of the overall job.
    -   **`processTenant(tenant: Tenant): Promise<void>`:**
        -   **Step 1: Get Configuration & Calculate Cutoff**
            -   Logs the start of processing for `tenant.tenantId`.
            -   Calls `this.firestoreRepo.getTenantConfiguration(tenant.tenantId)`.
            -   If config or `dataRetentionDays` is null or invalid, log a warning and return.
            -   Calculates the `cutoffDate` by subtracting `dataRetentionDays` from the current date.
        -   **Step 2: Paginate and Process Batches**
            -   Initializes `let lastVisible: DocumentSnapshot | undefined = undefined;`.
            -   Enters a `do-while` loop that continues as long as batches are being processed.
            -   Inside the loop:
                -   Calls `this.firestoreRepo.getArchivableAttendance(...)`, passing `lastVisible` as the `startAfter` cursor.
                -   If `querySnapshot.empty` is true, break the loop.
                -   Update `lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];`.
                -   Extract record data and references from the snapshot.
        -   **Step 3: Archive and Purge Logic (Transactional)**
            -   Inside a `try-catch` block to ensure atomicity:
                -   Generate a unique `fileName` (e.g., `archive-${new Date().toISOString()}.ndjson`).
                -   Call `toNdjson()` utility to format the record data.
                -   Call `this.storageRepo.saveArchiveFile(...)` with the NDJSON content.
                -   **Only if the above succeeds**, call `this.firestoreRepo.purgeRecordsInBatch(...)` with the document references.
                -   Log the successful archival and purging of the batch.
            -   In the `catch` block:
                -   Log the archival failure in detail.
                -   **Crucially, do not proceed with purging.**
                -   Re-throw the error to let `Promise.allSettled` catch it as a tenant-level failure.

### 4.6. Handler (`index.ts`)

This is the main entry point for the Cloud Function.

-   **`scheduledDataArchival` constant:**
    -   Defines the function using `functions.pubsub.schedule(SCHEDULE_CRON_EXPRESSION).onRun(async (context) => { ... })`.
    -   Sets `.timeZone('UTC')`.
    -   Inside the `onRun` handler:
        1.  Instantiates `FirestoreRepository`.
        2.  Instantiates `StorageRepository`.
        3.  Instantiates `ArchivalService` with the repository instances.
        4.  Logs "Data Archival Job Started".
        5.  Wraps the service call in a `try-catch` block for top-level exception handling.
        6.  Calls `await archivalService.executeArchivalProcess()`.
        7.  Logs "Data Archival Job Finished Successfully".
        8.  The `catch` block logs any unhandled "Fatal error during archival job".

## 5. Testing Strategy

-   **Unit Tests:**
    -   `archival.service.ts`: Test the orchestration logic using mocked repositories. Verify that `purge` is only called after `save` succeeds. Test edge cases like no config, no tenants, no old records.
    -   `firestore.repository.ts`: Test the query construction logic. Mock the Firebase Admin SDK.
    -   `storage.repository.ts`: Test the file path construction and save call. Mock the Firebase Admin SDK.
    -   `ndjson.formatter.ts`: Test with empty arrays, single-item arrays, and multi-item arrays.
-   **Integration Tests:**
    -   Use the **Firebase Local Emulator Suite**.
    -   Write a test script that:
        1.  Seeds the Firestore emulator with test tenants, configs, and old/new attendance records.
        2.  Triggers the `scheduledDataArchival` function directly against the emulators.
        3.  Asserts that the correct NDJSON file is created in the Storage emulator.
        4.  Asserts that the old records are deleted from the Firestore emulator.
        5.  Asserts that the new records remain untouched in the Firestore emulator.
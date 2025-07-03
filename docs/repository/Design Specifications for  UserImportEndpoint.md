# Software Design Specification (SDS) for UserImportEndpoint (REPO-007-SVC)

## 1. Overview

This document specifies the design for the `UserImportEndpoint`, a serverless Cloud Function responsible for the bulk import of user data from a CSV file. The function is triggered when an Administrator uploads a CSV file to a designated path in Firebase Cloud Storage.

The architecture follows an event-driven, multi-layered approach to ensure separation of concerns, testability, and maintainability.

- **Trigger (Handler):** An `onFinalize` Cloud Storage trigger that acts as the entry point.
- **Application Service:** Orchestrates the import workflow, coordinating between infrastructure and domain services.
- **Domain Service:** Contains the pure, stateless business logic for validating user records and building the hierarchy.
- **Infrastructure Adapters:** Concrete implementations for interacting with external services like Firestore, Cloud Storage, and CSV parsing.

### Core Process Flow

1.  An Admin uploads a CSV file to `/tenants/{tenantId}/uploads/users/{filename}.csv`.
2.  The `onUserCsvUpload` Cloud Function is triggered.
3.  The function streams the CSV file from Storage.
4.  The CSV stream is parsed into structured records.
5.  All existing users for the tenant are fetched from Firestore for validation purposes.
6.  Each CSV record is validated against business rules (e.g., email format, uniqueness, supervisor existence).
7.  Valid records are prepared as new user payloads with a default status of `Invited`.
8.  Invalid records are compiled into a validation report with specific error reasons.
9.  All valid user payloads are created atomically in Firestore using a single batch write.
10. The final validation report (JSON format) is uploaded to Cloud Storage for the Admin to review at `/tenants/{tenantId}/uploads/reports/users/{filename}-report.json`.

## 2. Function Trigger and Handler

**File:** `backend/functions/src/user/import/handler.ts`

### 2.1. `onUserCsvUpload` Function

This is the main Cloud Function entry point.

-   **Trigger Type:** Cloud Storage `onFinalize` (triggers when a new object is successfully created in a bucket).
-   **Trigger Region:** `us-central1` (or as per project configuration).
-   **Resource:** The default Cloud Storage bucket.
-   **Event Handling:**
    -   The function will listen for files created under the path format: `/tenants/{tenantId}/uploads/users/*.csv`.
    -   It will ignore files in other paths, including the report output path.

#### Logic:

1.  Extract `filePath` and `contentType` from the incoming `ObjectMetadata` event.
2.  If `contentType` is not `text/csv`, log a warning and exit gracefully.
3.  Extract the `tenantId` from the `filePath`. The path structure `tenants/{tenantId}/...` is guaranteed.
4.  Instantiate the `UserImportService`.
5.  Invoke `userImportService.processImport(filePath, tenantId)`.
6.  Implement a top-level `try...catch` block. On any unhandled exception during the process, log the error verbosely to Google Cloud Logging for debugging.

typescript
// Signature in handler.ts
import * as functions from "firebase-functions";
import { UserImportService } from "../application/user-import.service";

export const onUserCsvUpload = functions.storage
    .object()
    .onFinalize(async (object) => {
        // Logic to validate file path and content type
        // Logic to extract tenantId
        // Instantiate and call UserImportService
        // Top-level error handling
    });


## 3. Application Service

**File:** `backend/functions/src/user/import/application/user-import.service.ts`

### 3.1. `UserImportService` Class

This class orchestrates the entire import use case, decoupling the handler from the underlying implementation details.

#### Dependencies (Injected via Constructor):

-   `storageService: StorageService`
-   `csvParserService: CsvParserService`
-   `userRepository: UserRepository` (an interface implemented by `FirestoreRepository`)
-   `userImporter: UserImporter` (domain service)

#### Methods:

-   `public async processImport(filePath: string, tenantId: string): Promise<void>`
    1.  **Get File:** Call `this.storageService.getFileStream(filePath)` to get a readable stream of the uploaded CSV.
    2.  **Parse CSV:** Call `this.csvParserService.parseCsvStream(stream)` to get an array of `CsvRecordDto`.
    3.  **Fetch Existing Users:** Call `this.userRepository.getAllUsersByTenant(tenantId)` to get an array of existing `User` objects for validation.
    4.  **Process and Validate:** Call `this.userImporter.validateAndPrepareUsers(csvRecords, existingUsers, tenantId)`. This returns an object containing `validUsers` (an array of `UserPayloadDto`) and a `report` (`ValidationReport`).
    5.  **Persist Users:** If `validUsers` array is not empty, call `this.userRepository.batchCreateUsers(validUsers, tenantId)`.
    6.  **Upload Report:** Call `this.storageService.uploadReport(report, filePath)` to save the validation results.

## 4. Domain Logic

**File:** `backend/functions/src/user/import/domain/user-importer.ts`

### 4.1. `UserImporter` Class

This class contains pure, testable business logic for the import process. It is stateless and has no knowledge of external systems like Firebase.

#### Methods:

-   `public validateAndPrepareUsers(csvRecords: CsvRecordDto[], existingUsers: User[], tenantId: string): { validUsers: UserPayloadDto[], report: ValidationReport }`
    1.  **Initialization:**
        -   Create an empty `report` object with summary counts initialized to zero.
        -   Create an empty `validUsers` array.
        -   Create a `Set<string>` of existing user emails for O(1) lookup.
        -   Create a `Set<string>` to track emails within the current CSV to detect duplicates within the file itself.
        -   Create a `Map<string, string>` to map `supervisorEmail` to a future or existing `supervisorId`. Populate it initially with all `existingUsers`.

    2.  **First Pass (Validation & ID Mapping):**
        -   Iterate through `csvRecords`.
        -   For each record:
            -   **Validate Name:** Check if `name` is a non-empty string.
            -   **Validate Email:** Use a regex to check for valid email format.
            -   **Check for Duplicates:** Check if the email exists in the `existingEmails` set or the `batchEmails` set.
            -   If any validation fails, add an error to `report.errors`, increment the failed count, and continue to the next record.
            -   If validations pass, add the email to the `batchEmails` set.

    3.  **Second Pass (Hierarchy Resolution & Payload Creation):**
        -   Iterate through the now-validated records (or combine with the first pass for efficiency).
        -   For each valid record:
            -   **Resolve Supervisor:** If `supervisorEmail` is present:
                -   Check if `supervisorEmail` exists in the `existingEmails` set or `batchEmails` set.
                -   If it doesn't exist, it's an invalid hierarchy. Add an error to the report and skip this record.
                -   If it exists, the `supervisorId` can be looked up from the `existingUsers` or will be resolved after the batch write. For simplicity, the logic will assume the supervisor must be an *existing* user. *Correction:* The logic must support supervisors present in the same file. The email-to-ID map needs to be populated with placeholder IDs for new users and then resolved.
                -   A more robust approach: First create all users without a `supervisorId`, then in a second batch update, set the `supervisorId` based on the newly created user IDs. For this implementation, we will simplify: the `supervisorId` will be looked up from the `supervisorEmail` against the `existingUsers` list. Supervisors must exist prior to import. This simplifies the logic significantly.
            -   **Create Payload:** Construct a `UserPayloadDto` object:
                -   `name`: from CSV.
                -   `email`: from CSV.
                -   `supervisorId`: the resolved ID, or `null`.
                -   `status`: 'Invited'.
                -   `role`: 'Subordinate' (by default, can be adjusted later if needed).
                -   `tenantId`: the provided `tenantId`.
                -   `createdAt`, `updatedAt`: `FieldValue.serverTimestamp()`.
            -   Add the payload to the `validUsers` array.

    4.  **Finalization:**
        -   Update `report.summary` with final counts.
        -   Return `{ validUsers, report }`.

## 5. Infrastructure Layer

This layer contains concrete implementations for interacting with external services.

### 5.1. Firestore Repository

**File:** `backend/functions/src/user/import/infrastructure/firestore.repository.ts`

**Class:** `FirestoreRepository`
**Implements:** `UserRepository` (conceptual interface)

#### Methods:

-   `public async getAllUsersByTenant(tenantId: string): Promise<User[]>`
    -   Queries the collection `/tenants/${tenantId}/users`.
    -   Returns all documents, mapped to the `User` interface.
-   `public async batchCreateUsers(users: UserPayloadDto[], tenantId: string): Promise<void>`
    -   Initializes a Firestore `WriteBatch`.
    -   Iterates through the `users` array.
    -   For each user, it gets a new document reference using `db.collection(...).doc()`.
    -   It calls `batch.set(docRef, userPayload)` for each new user.
    -   Executes `await batch.commit()`.

### 5.2. Storage Service

**File:** `backend/functions/src/user/import/infrastructure/storage.service.ts`

**Class:** `StorageService`

#### Methods:

-   `public getFileStream(filePath: string): Readable`
    -   Gets a reference to the default storage bucket.
    -   Gets a file reference using the `filePath`.
    -   Returns `file.createReadStream()`.
-   `public async uploadReport(report: ValidationReport, originalFilePath: string): Promise<void>`
    -   Constructs the report file path. It should replace the `/uploads/` part of the path with `/uploads/reports/` and append `-report.json` to the original filename.
    -   Serializes the `report` object to a JSON string (`JSON.stringify(report, null, 2)`).
    -   Gets a reference to the report file path in the storage bucket.
    -   Saves the JSON string to the file using `file.save()` with `contentType: 'application/json'`.

### 5.3. CSV Parser Service

**File:** `backend/functions/src/user/import/infrastructure/csv-parser.service.ts`

**Class:** `CsvParserService`

#### Methods:

-   `public parseCsvStream(stream: Readable): Promise<CsvRecordDto[]>`
    -   Uses the `csv-parse` library.
    -   Creates a parser instance with options: `{ columns: true, skip_empty_lines: true, trim: true }`.
    -   Pipes the input `stream` to the parser.
    -   Collects records from the `data` event into an array.
    -   Wraps the entire operation in a `Promise`, resolving with the array of records on the `end` event, and rejecting on the `error` event.

## 6. Data Interfaces (DTOs)

The following DTOs define the data contracts between layers.

### 6.1. `CsvRecordDto`

**File:** `backend/functions/src/user/import/interfaces/csv-record.dto.ts`
Represents a single row parsed from the input file.

typescript
export interface CsvRecordDto {
    name: string;
    email: string;
    supervisorEmail: string; // Can be an empty string
}


### 6.2. `UserPayloadDto`

**File:** `backend/functions/src/user/import/interfaces/user-payload.dto.ts`
Represents the data structure used to create a new user document in Firestore.

typescript
import { FieldValue } from "firebase-admin/firestore";

export interface UserPayloadDto {
    name: string;
    email: string;
    tenantId: string;
    supervisorId: string | null;
    role: 'Subordinate' | 'Supervisor'; // Default to Subordinate
    status: 'Invited';
    createdAt: FieldValue;
    updatedAt: FieldValue;
    lastLoginTimestamp: null;
    fcmToken: null;
    subordinateIds: string[]; // Initially empty
}


### 6.3. `ValidationReportDto`

**File:** `backend/functions/src/user/import/interfaces/validation-report.dto.ts`
Defines the structure of the final JSON report.

typescript
import { CsvRecordDto } from "./csv-record.dto";

export interface ValidationError {
    record: CsvRecordDto;
    reason: string;
}

export interface ValidationReport {
    summary: {
        totalRecords: number;
        successful: number;
        failed: number;
    };
    errors: ValidationError[];
}


## 7. IAM Permissions

The service account used by this Cloud Function requires the following IAM roles:
-   **Cloud Storage Object Admin (`roles/storage.objectAdmin`):** To read the uploaded CSV and write the output report.
-   **Cloud Datastore User (`roles/datastore.user`):** To read from and write to the Firestore database.
-   **Cloud Functions Invoker (`roles/cloudfunctions.invoker`):** Standard role for function execution.
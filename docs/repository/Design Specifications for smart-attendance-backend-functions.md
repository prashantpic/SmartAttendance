# Software Design Specification (SDS) for Smart Attendance Backend Functions

## 1. Introduction

### 1.1. Purpose
This document provides a detailed software design specification for the `smart-attendance-backend-functions` repository (`REPO-02-BKN`). This repository contains the complete set of server-side logic, implemented as Firebase Cloud Functions in TypeScript. It serves as the event-driven backend core for the Smart Attendance system.

### 1.2. Scope
The scope of this document is limited to the design and implementation of the Cloud Functions within this repository. This includes:
- HTTP-triggered functions for public-facing endpoints (e.g., tenant registration).
- Firestore-triggered functions for reactive data processing and augmentation.
- Cloud Storage-triggered functions for file processing (e.g., bulk user import).
- Scheduled functions for recurring batch jobs (e.g., data export and archival).
- The services, data models, and utilities that support these functions.

This document assumes that Firebase services (Firestore, Authentication, Storage, etc.) and the CI/CD pipeline are configured as per the architecture design.

## 2. System Overview
The backend architecture is **Event-Driven** and built on a **Serverless (MBaaS)** model using Firebase. Functions are stateless, single-purpose, and triggered by specific events within the system. This promotes loose coupling, scalability, and maintainability.

- **Data Flow:** Client applications or other services trigger events (e.g., a Firestore document write). These events trigger one or more Cloud Functions. The function executes its business logic, which may involve interacting with Firestore, calling other Google Cloud services, or triggering further events.
- **Modularity:** Logic is separated into `services` (core business logic) and `functions` (trigger definitions). This separation of concerns improves testability and reusability.

## 3. Core Configuration & Initialization

### 3.1. Firebase Admin SDK
The `firebase-admin` SDK will be initialized once at the application's root to be used across all functions.

**File:** `src/index.ts`
typescript
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// ... export all functions


### 3.2. Project Configuration (`package.json` and `tsconfig.json`)
- **`package.json`**: This file will manage all project dependencies and scripts.
  - **Dependencies**: `firebase-functions`, `firebase-admin`, `googleapis`, `csv-parse`.
  - **Dev Dependencies**: `@typescript-eslint/parser`, `eslint`, `typescript`, `firebase-functions-test`.
  - **Scripts**:
    - `lint`: `eslint --ext .js,.ts .`
    - `build`: `tsc`
    - `serve`: `npm run build && firebase emulators:start --only functions`
    - `shell`: `npm run build && firebase functions:shell`
    - `deploy`: `firebase deploy --only functions`

- **`tsconfig.json`**: Configures the TypeScript compiler.
  - **`target`**: `es2020`
  - **`module`**: `commonjs`
  - **`outDir`**: `lib` (This is where the compiled JS code will reside)
  - **`rootDir`**: `src`
  - **`strict`**: `true`
  - **`sourceMap`**: `true`

## 4. Domain Model (`src/domain/models.ts`)
This file will contain TypeScript interfaces that mirror the Firestore data structures, ensuring type safety.

typescript
import { firestore } from 'firebase-admin';

export type UserRole = 'Admin' | 'Supervisor' | 'Subordinate';
export type UserStatus = 'Active' | 'Invited' | 'Deactivated';
export type AttendanceStatus = 'Pending' | 'Approved' | 'Rejected';
export type SyncStatus = 'Queued' | 'Synced' | 'Failed';

export interface Tenant {
  organizationName: string;
  createdAt: firestore.Timestamp;
  updatedAt: firestore.Timestamp;
}

export interface User {
  tenantId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  supervisorId?: string;
  fcmToken?: string;
  lastLoginTimestamp?: firestore.Timestamp;
  createdAt: firestore.Timestamp;
  updatedAt: firestore.Timestamp;
}

export interface Attendance {
  tenantId: string;
  userId: string;
  userName: string; // Denormalized for performance
  eventId?: string;
  clientCheckInTimestamp: firestore.Timestamp;
  clientCheckOutTimestamp?: firestore.Timestamp;
  serverSyncTimestamp: firestore.Timestamp;
  checkInLocation: firestore.GeoPoint;
  checkOutLocation?: firestore.GeoPoint;
  checkInAccuracy: number;
  checkOutAccuracy?: number;
  checkInAddress?: string;
  checkOutAddress?: string;
  status: AttendanceStatus;
  syncStatus: SyncStatus;
  isOutsideGeofence: boolean;
  deviceInfo: { [key: string]: any };
  approvalDetails?: {
    approverId: string;
    timestamp: firestore.Timestamp;
    comments: string;
  };
  approverHierarchy: string[];
}

export interface TenantConfig {
  tenantId: string;
  dataRetentionDays: number;
  approvalLevels: number;
  timezone: string;
  geofence?: {
    center: firestore.GeoPoint;
    radius: number; // in meters
  };
  // ... other config fields
}

export interface LinkedSheet {
  tenantId: string;
  fileId: string;
  ownerEmail: string;
  lastSyncStatus: 'Success' | 'Failed' | 'In Progress' | 'Not Started';
  lastSyncTimestamp?: firestore.Timestamp;
  lastSyncError?: string;
}

// ... other models like Event, AuditLog


## 5. Shared Utilities (`src/common/constants.ts`)

This file will export constants to avoid magic strings.

typescript
export const FIRESTORE_COLLECTIONS = {
  TENANTS: 'tenants',
  USERS: 'users',
  ATTENDANCE: 'attendance',
  CONFIG: 'config',
  EVENTS: 'events',
  LINKED_SHEETS: 'linkedSheets',
  AUDIT_LOGS: 'auditLogs',
};

export const USER_ROLES: { [key: string]: UserRole } = {
  ADMIN: 'Admin',
  SUPERVISOR: 'Supervisor',
  SUBORDINATE: 'Subordinate',
};

export const USER_STATUSES: { [key: string]: UserStatus } = {
  ACTIVE: 'Active',
  INVITED: 'Invited',
  DEACTIVATED: 'Deactivated',
};

// ... other constants


## 6. Service Layer Implementation (`src/services/`)

This layer contains the core, reusable business logic.

### 6.1. Tenant Service (`src/services/tenant.service.ts`)
**Purpose**: Handles the entire lifecycle of a new tenant's creation.
- **`public static async provisionNewTenant(orgName: string, adminName: string, adminEmail: string, adminPassword: string): Promise<{ tenantId: string; userId: string; }>`**
  - **Logic**:
    1.  Initialize a Firestore batched write operation.
    2.  Create a new document in the `tenants` collection with `organizationName` and timestamps. Get the new `tenantId`.
    3.  Create a new user in Firebase Authentication with the provided `adminEmail` and `adminPassword`. Get the new `userId`.
    4.  Set custom claims on the newly created user using `admin.auth().setCustomUserClaims()`: `{ tenantId: newTenantId, role: 'Admin', status: 'Active' }`.
    5.  Create a user profile document in `/tenants/{tenantId}/users/{userId}`. Populate it with `name`, `email`, `role: 'Admin'`, `status: 'Active'`, and `tenantId`.
    6.  Create a default configuration document in `/tenants/{tenantId}/config/default`. Populate with `dataRetentionDays: 365`, `approvalLevels: 1`, etc.
    7.  Atomically commit the batched write.
    8.  Return the `tenantId` and `userId` on success. Throw an `HttpsError` on failure, ensuring any created artifacts (like the Auth user) are cleaned up if the transaction fails.

### 6.2. Attendance Service (`src/services/attendance.service.ts`)
**Purpose**: Processes new and updated attendance records.
- **`public static async augmentNewRecord(recordId: string, tenantId: string, data: Attendance): Promise<void>`**
  - **Logic**:
    1.  Fetch the user's document from `/tenants/{tenantId}/users/{data.userId}`.
    2.  **Build Approver Hierarchy**:
        - Start with the user's `supervisorId`. If it exists, add it to an array `hierarchy`.
        - In a `while` loop (with a depth limit to prevent infinite loops), fetch the supervisor's document.
        - Add the supervisor's `supervisorId` to the `hierarchy` array.
        - Continue until a user with no `supervisorId` is reached.
    3.  **Reverse Geocode**:
        - Use a geocoding client (e.g., from `googleapis`) to convert `data.checkInLocation` into a human-readable address string.
    4.  Create an update payload object containing `approverHierarchy`, `checkInAddress`, and `serverSyncTimestamp: firestore.FieldValue.serverTimestamp()`.
    5.  Update the attendance document at `/tenants/{tenantId}/attendance/{recordId}` with the payload.
- **`public static async notifyOnStatusChange(before: Attendance, after: Attendance): Promise<void>`**
  - **Logic**:
    1. Check if `before.status` was 'Pending' and `after.status` is now 'Approved' or 'Rejected'.
    2. If true, construct a notification payload (e.g., `title: 'Attendance Update'`, `body: 'Your attendance on [date] has been [status].'`).
    3. Call `NotificationService.sendNotificationToUser(after.userId, payload)`.

### 6.3. User Service (`src/services/user.service.ts`)
**Purpose**: Handles bulk user data operations.
- **`public static async importUsersFromCSV(fileBuffer: Buffer, tenantId: string): Promise<{...}>`**
  - **Logic**:
    1.  Initialize success/error counters and an error details array.
    2.  Use the `csv-parse` library to parse the `fileBuffer` into an array of row objects.
    3.  Iterate over each row. For each row:
        a. Validate required fields (`name`, `email`).
        b. Validate email format.
        c. Check for email uniqueness within the tenant (query Firestore).
        d. If `supervisorEmail` exists, validate that it corresponds to an existing user in the tenant.
        e. If validation fails, add an error entry to the `errors` array and continue.
        f. If validation passes, add a `create` operation to a batched write: create a new user document in `/tenants/{tenantId}/users/` with `status: 'Invited'`, `role: 'Subordinate'`, and other details from the CSV.
    4.  Atomically commit the batched write.
    5.  Return a report with `successCount`, `errorCount`, and the `errors` array.

### 6.4. Sheets Service (`src/services/sheets.service.ts`)
**Purpose**: Manages data export to Google Sheets.
- **`public static async syncTenantDataToSheet(tenantId: string): Promise<void>`**
  - **Logic**:
    1.  Fetch the `LinkedSheet` document for the `tenantId`. If none, return.
    2.  Authenticate with the Google Sheets API using stored credentials/tokens.
    3.  Query the `attendance` collection for records where `status: 'Approved'` and `serverSyncTimestamp` is after the `lastSyncTimestamp` from the `LinkedSheet` doc. Use pagination (`limit` and `startAfter`) for large datasets.
    4.  For each new record, format it into a row array matching the expected sheet schema.
    5.  Use the Sheets API `spreadsheets.values.append` method to add the new rows to the sheet specified by `fileId`.
    6.  On successful completion, update the `LinkedSheet` document with the new `lastSyncTimestamp` and `lastSyncStatus: 'Success'`.
    7.  On failure, log the error and update the `LinkedSheet` document with `lastSyncStatus: 'Failed'` and the error message.

### 6.5. Archival Service (`src/services/archival.service.ts`)
**Purpose**: Enforces data retention policies.
- **`public static async archiveAndPurgeOldRecords(tenantId: string): Promise<void>`**
  - **Logic**:
    1.  Fetch the `TenantConfig` document for the `tenantId` to get `dataRetentionDays`.
    2.  Calculate the cutoff date (`now - dataRetentionDays`).
    3.  Query the `attendance` collection for records where `clientCheckInTimestamp` is before the cutoff date. Use pagination.
    4.  If records are found, serialize them into a single string in NDJSON format (each record is a JSON object on a new line).
    5.  Upload this string to a file in Firebase Storage at a path like `/archives/{tenantId}/{YYYY-MM-DD}.ndjson`.
    6.  **Crucially, only upon successful upload**, create a new batched write.
    7.  Iterate through the IDs of the archived records and add a `delete` operation for each to the batch.
    8.  Commit the batch delete.

### 6.6. Notification Service (`src/services/notification.service.ts`)
**Purpose**: Centralizes sending of FCM push notifications.
- **`public static async sendNotificationToUser(userId: string, tenantId: string, payload: { title: string; body: string; }): Promise<void>`**
  - **Logic**:
    1.  Fetch the user document from `/tenants/{tenantId}/users/{userId}` to get their `fcmToken`.
    2.  If `fcmToken` does not exist, log a warning and exit.
    3.  Construct the FCM message using `admin.messaging().send()`.
    4.  Use a `try-catch` block. If sending fails with an 'unregistered' or 'invalid-argument' error, it indicates a stale token. Log this and consider adding logic to clear the token from the user's document.

## 7. Function Triggers Implementation (`src/functions/`)

This layer defines the Cloud Function triggers that invoke the service layer.

### 7.1. Tenant Functions (`src/functions/tenant.functions.ts`)
- **`export const onboardNewTenant = functions.https.onCall(async (data, context) => { ... });`**
  - **Trigger**: HTTPS Callable Function.
  - **Logic**:
    1.  Validate input `data` for `orgName`, `adminName`, `email`, `password`.
    2.  Call `TenantService.provisionNewTenant(data.orgName, ...)`.
    3.  Return the result or throw an `HttpsError`.

### 7.2. Attendance Functions (`src/functions/attendance.functions.ts`)
- **`export const onAttendanceCreated = functions.firestore.document('/tenants/{tenantId}/attendance/{attendanceId}').onCreate(async (snap, context) => { ... });`**
  - **Trigger**: Firestore `onCreate`.
  - **Logic**:
    1.  Extract `tenantId`, `attendanceId` from `context.params`.
    2.  Extract `data` from `snap.data()`.
    3.  Call `AttendanceService.augmentNewRecord(attendanceId, tenantId, data)`.
- **`export const onAttendanceUpdated = functions.firestore.document('/tenants/{tenantId}/attendance/{attendanceId}').onUpdate(async (change, context) => { ... });`**
  - **Trigger**: Firestore `onUpdate`.
  - **Logic**:
    1.  Get `before` and `after` data snapshots from `change`.
    2.  Call `AttendanceService.notifyOnStatusChange(before.data(), after.data())`.

### 7.3. User Functions (`src/functions/user.functions.ts`)
- **`export const onUserCSVUploaded = functions.storage.object().onFinalize(async (object) => { ... });`**
  - **Trigger**: Cloud Storage `onFinalize`.
  - **Logic**:
    1.  Check `object.name` to ensure the file is in the correct path (e.g., `uploads/{tenantId}/user-imports/...`). If not, exit.
    2.  Extract `tenantId` from the file path.
    3.  Download the file content as a Buffer.
    4.  Call `UserService.importUsersFromCSV(fileBuffer, tenantId)`.
    5.  (Optional) Send a notification/email to the admin with the import report.

### 7.4. Scheduled Functions (`src/functions/scheduled.functions.ts`)
- **`export const syncToGoogleSheets = functions.pubsub.schedule('every 24 hours').onRun(async (context) => { ... });`**
  - **Trigger**: Scheduled (Pub/Sub).
  - **Logic**:
    1.  Query the `linkedSheets` collection for all documents that need syncing.
    2.  For each tenant, call `SheetsService.syncTenantDataToSheet(tenantId)`. Handle promises correctly to manage concurrent executions.
- **`export const archiveOldData = functions.pubsub.schedule('every 24 hours').onRun(async (context) => { ... });`**
  - **Trigger**: Scheduled (Pub/Sub).
  - **Logic**:
    1.  Query the `tenants` collection to get all `tenantId`s.
    2.  For each `tenantId`, call `ArchivalService.archiveAndPurgeOldRecords(tenantId)`.

## 8. Error Handling & Security

- **Error Handling**: Functions will use `try-catch` blocks for all external API calls and database operations. HTTP functions will throw `functions.https.HttpsError` with appropriate error codes (`invalid-argument`, `unauthenticated`, `internal`) to provide clear feedback to the client. Background functions will log errors verbosely to Google Cloud Logging.
- **Idempotency**: All background functions (Firestore triggers, scheduled functions) will be designed to be idempotent. For example, the `onAttendanceCreated` function should not fail if run twice on the same record. The Sheets sync and archival functions will have inherent checks to prevent duplicate processing.
- **Security**: While Firestore Security Rules are the primary enforcement mechanism, functions will not implicitly trust client data. All callable functions will validate input schemas. Function logic will operate on the assumption that it has administrative privileges and must therefore be carefully designed to respect tenant boundaries, typically by using a `tenantId` parameter in all service methods.
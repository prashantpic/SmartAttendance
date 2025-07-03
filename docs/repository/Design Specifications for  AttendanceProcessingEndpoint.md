# Software Design Specification for AttendanceProcessingEndpoint (REPO-004-SVC)

## 1. Introduction

### 1.1. Purpose
This document provides a detailed software design for the `AttendanceProcessingEndpoint` repository. This repository contains a single, critical Firebase Cloud Function responsible for the asynchronous, server-side enrichment of newly created attendance records. The function ensures data integrity, consistency, and offloads complex processing from the client application.

### 1.2. Scope
The scope of this design is limited to the TypeScript Cloud Function triggered by a `onCreate` event in a specific Firestore path. The function will:
1.  Add a server-authoritative synchronization timestamp.
2.  Calculate and embed the user's full supervisory approval hierarchy.
3.  Perform reverse geocoding to convert GPS coordinates into a human-readable address.
4.  Atomically update the source attendance record with the enriched data.

This design covers the function's logic, its supporting services, data models, configuration, and deployment entry point.

## 2. System Architecture & Design

The function operates within an **Event-Driven Architecture**. It is a stateless, idempotent function that reacts to data creation events in Firestore.

-   **Trigger:** `onCreate` of a document at `tenants/{tenantId}/attendance/{attendanceId}`.
-   **Pattern:** The function acts as a data enrichment service. It uses the **Adapter** pattern for the `GeocodingService` to wrap the Google Maps API and a **Service Layer** pattern to encapsulate the business logic for hierarchy calculation.
-   **Data Flow:**
    1.  A new attendance document is created in Firestore by a client.
    2.  The `onAttendanceCreate` function is triggered.
    3.  The function reads the new document's data.
    4.  It concurrently calls internal services (`HierarchyService`, `GeocodingService`).
    5.  `HierarchyService` reads from `/tenants/{tenantId}/users` to build the approval chain.
    6.  `GeocodingService` calls the external Google Maps Geocoding API.
    7.  The function aggregates the results.
    8.  It performs a single, atomic `update` operation back to the trigger document.

## 3. Project Configuration

### 3.1. `package.json`
This file manages all Node.js dependencies and project scripts.

json
{
  "name": "functions",
  "scripts": {
    "lint": "eslint --ext .js,.ts .",
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "@googlemaps/google-maps-services-js": "^3.3.30",
    "firebase-admin": "^11.9.0",
    "firebase-functions": "^4.4.1"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^5.12.0",
    "@typescript-eslint/parser": "^5.12.0",
    "eslint": "^8.9.0",
    "eslint-config-google": "^0.14.0",
    "eslint-plugin-import": "^2.25.4",
    "typescript": "^4.9.0"
  },
  "private": true
}


### 3.2. `tsconfig.json`
Configures the TypeScript compiler.

json
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2020",
    "esModuleInterop": true
  },
  "compileOnSave": true,
  "include": [
    "src"
  ]
}


### 3.3. Environment Variables
The function requires one environment variable for configuration:
-   `GOOGLE_MAPS_API_KEY`: The API key for the Google Maps Geocoding API. This should be set using Firebase function configuration: `firebase functions:config:set google.maps_api_key="YOUR_KEY"`

## 4. Core Components

### 4.1. Firebase Admin Initialization (`src/core/firebase.ts`)
A singleton module to initialize the Firebase Admin SDK.

-   **Purpose:** To provide a single, configured instance of the Firebase Admin SDK and Firestore database client to all other modules.
-   **Implementation:**
    -   Import `firebase-admin`.
    -   Call `admin.initializeApp()` at the module's top level.
    -   Export a `const admin` and `const db = admin.firestore()`.

### 4.2. Data Models (`src/core/models.ts`)
Defines the TypeScript interfaces for Firestore documents to ensure type safety.

-   **`User` Interface:**
    typescript
    export interface User {
      userId: string;
      supervisorId?: string | null;
      // Other user fields are not required by this function
    }
    
-   **`Attendance` Interface:**
    typescript
    import * as admin from "firebase-admin";

    export interface Attendance {
      userId: string;
      checkInLocation: admin.firestore.GeoPoint;
      // Fields to be added by the function
      serverSyncTimestamp?: admin.firestore.Timestamp;
      approverHierarchy?: string[];
      checkInAddress?: string;
      // Other attendance fields
    }
    

## 5. Service Layer Implementation

### 5.1. `HierarchyService` (`src/attendance/hierarchy.service.ts`)
Encapsulates the logic for building a user's supervisory chain.

-   **Class:** `HierarchyService`
-   **Constructor:** `constructor(private readonly db: admin.firestore.Firestore)`
-   **Method:** `public async buildApproverHierarchy(tenantId: string, userId: string): Promise<string[]>`
    -   **Logic:**
        1.  Initialize an empty array `hierarchy: string[]`.
        2.  Define a maximum depth to prevent infinite loops (e.g., `MAX_DEPTH = 10`).
        3.  Set `currentUserId = userId`.
        4.  Start a loop that runs up to `MAX_DEPTH` times.
        5.  Fetch the user document: `doc = await this.db.collection('tenants').doc(tenantId).collection('users').doc(currentUserId).get()`.
        6.  If the document does not exist, break the loop.
        7.  Extract the `supervisorId` from the document data.
        8.  If `supervisorId` exists and is a non-empty string:
            -   Add `supervisorId` to the `hierarchy` array.
            -   Set `currentUserId` to the `supervisorId` to continue traversal.
        9.  If `supervisorId` does not exist, break the loop.
        10. Return the `hierarchy` array.

### 5.2. `GeocodingService` (`src/attendance/geocoding.service.ts`)
A wrapper for the Google Maps Geocoding API.

-   **Class:** `GeocodingService`
-   **Constructor:** `constructor()`
    -   Initializes the Google Maps Client: `this.mapsClient = new Client({});`
-   **Member:** `private readonly mapsClient: Client;`
-   **Method:** `public async getAddressFromCoordinates(location: admin.firestore.GeoPoint): Promise<string | null>`
    -   **Logic:**
        1.  Retrieve the API key from function configuration: `const apiKey = functions.config().google.maps_api_key;`.
        2.  Check if `apiKey` is present; if not, log an error and return `null`.
        3.  Call the reverse geocode method: `response = await this.mapsClient.reverseGeocode({ params: { latlng: { latitude: location.latitude, longitude: location.longitude }, key: apiKey } });`
        4.  Inside a `try...catch` block to handle API errors.
        5.  If `response.data.results` has at least one result, return the `formatted_address` of the first result (`response.data.results[0].formatted_address`).
        6.  If no results are found or an error occurs, log the issue and return `null`.

## 6. Function Handler Implementation (`src/attendance/on-create.ts`)

This is the main orchestrator for the data enrichment process.

-   **File:** `src/attendance/on-create.ts`
-   **Exported Function:** `handler`
-   **Signature:** `export const handler = async (snap: functions.firestore.DocumentSnapshot, context: functions.EventContext): Promise<void> => { ... }`
-   **Logic:**
    1.  **Logging & Context:** Log the start of the function execution with `context.params.tenantId` and `context.params.attendanceId`.
    2.  **Idempotency Check:**
        -   Get the document data: `const data = snap.data() as Attendance;`.
        -   Check if `data.serverSyncTimestamp` already exists. If so, log a message ("Record already processed.") and return immediately.
    3.  **Initialization:**
        -   Instantiate services: `const hierarchyService = new HierarchyService(db);` and `const geocodingService = new GeocodingService();`
    4.  **Data Extraction:**
        -   Get `userId` and `checkInLocation` from `data`.
        -   Get `tenantId` from `context.params`.
    5.  **Concurrent Processing:**
        -   Use `Promise.all` to execute hierarchy and geocoding lookups in parallel.
        -   `const [approverHierarchy, checkInAddress] = await Promise.all([ hierarchyService.buildApproverHierarchy(tenantId, data.userId), geocodingService.getAddressFromCoordinates(data.checkInLocation) ]);`
    6.  **Payload Construction:**
        -   Create an `updatePayload` object.
        -   Add `serverSyncTimestamp: admin.firestore.FieldValue.serverTimestamp()`.
        -   Add `approverHierarchy: approverHierarchy`.
        -   If `checkInAddress` is not null, add it to the payload: `checkInAddress: checkInAddress`.
    7.  **Atomic Update:**
        -   Perform the update on the document reference: `await snap.ref.update(updatePayload);`.
    8.  **Logging:** Log successful completion.
    9.  **Error Handling:** The entire async function should be wrapped in a `try...catch` block. Any error should be logged using `functions.logger.error()` for visibility in Google Cloud Logging.

## 7. Entrypoint & Deployment (`src/index.ts`)

This file registers the function for deployment.

-   **File:** `src/index.ts`
-   **Logic:**
    1.  Import `firebase-functions`.
    2.  Import the `handler` from `./attendance/on-create`.
    3.  Perform the one-time Firebase Admin initialization by importing from `./core/firebase.ts`.
    4.  Export the Cloud Function with the correct trigger path and event type:
        typescript
        import * as functions from "firebase-functions";
        import { handler as onAttendanceCreateHandler } from "./attendance/on-create";
        import "./core/firebase"; // Initializes admin SDK

        export const onAttendanceCreate = functions
          .runWith({
            // Optional: configure memory, timeout if needed
          })
          .firestore
          .document("tenants/{tenantId}/attendance/{attendanceId}")
          .onCreate(onAttendanceCreateHandler);
        

## 8. Testing Strategy

-   **Unit Testing:**
    -   `hierarchy.service.test.ts`: Use a mocking framework (like Jest) to mock the Firestore `db` calls. Test scenarios like a user with no supervisor, a multi-level hierarchy, and reaching the max depth limit.
    -   `geocoding.service.test.ts`: Mock the `@googlemaps/google-maps-services-js` client. Test successful response parsing, handling of no results, and API error scenarios.
-   **Integration Testing:**
    -   Use the **Firebase Local Emulator Suite**.
    -   Write a test script that:
        1.  Starts the emulators.
        2.  Clears the emulated Firestore.
        3.  Seeds the database with test users (including a supervisor chain).
        4.  Creates a new attendance document for a test user.
        5.  Waits for a short period to allow the triggered function to execute.
        6.  Fetches the updated attendance document and asserts that `serverSyncTimestamp`, `approverHierarchy`, and `checkInAddress` have been correctly populated.
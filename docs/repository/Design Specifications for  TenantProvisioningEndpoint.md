# Software Design Specification (SDS) for TenantProvisioningEndpoint (REPO-001-SVC)

## 1. Introduction

This document provides a detailed software design specification for the `TenantProvisioningEndpoint` repository. This repository contains a single, secure, idempotent `onCall` Firebase Cloud Function responsible for the initial registration and provisioning of a new organization (tenant) in the Smart Attendance System.

The function orchestrates the creation of all necessary backend resources, including the tenant record, the initial administrator user account, and default configuration settings, ensuring an atomic and consistent onboarding process.

## 2. System Overview

### 2.1. Architecture

The function adheres to a serverless, event-driven architecture pattern.

-   **Endpoint Type**: `onCall` HTTPS Cloud Function. This provides a clean interface for the client application, automatically deserializes the request body, and integrates seamlessly with Firebase App Check.
-   **Atomicity**: The core provisioning logic within Firestore is executed as a single atomic operation using a Batched Write, ensuring that all related documents are created successfully or none are, preventing partial data states.
-   **Idempotency**: The function ensures that submitting the same registration request multiple times does not result in duplicate tenants or users. It checks for the existence of the admin email across all tenants before proceeding.
-   **Security**: Access to the function is protected by Firebase App Check, ensuring that requests originate only from legitimate application clients.

### 2.2. Technology Stack

-   **Language**: TypeScript
-   **Runtime**: Node.js (latest LTS)
-   **Framework**: Firebase Cloud Functions SDK
-   **Primary Services**:
    -   Firebase Firestore: For all data persistence.
    -   Firebase Authentication: For user identity management.
    -   Firebase App Check: For backend request verification.

## 3. Core Logic & Workflow

The tenant provisioning workflow is initiated when a client application calls the `provisionTenant` endpoint with the required data. The server-side process is as follows:

1.  **Request & Verification**: The `onCall` function receives the request. Firebase automatically verifies the App Check token. If invalid, the request is rejected.
2.  **Input Validation**: The request payload is validated against the `ProvisionTenantRequest` DTO.
3.  **Idempotency Check**: The system queries the `users` collection group in Firestore to ensure no user with the provided `adminEmail` already exists in any tenant. If a user exists, an `already-exists` error is returned.
4.  **User Creation (Auth)**: A new user is created in Firebase Authentication using the provided email and password.
5.  **Custom Claims Assignment**: Critical metadata (`tenantId`, `role: 'Admin'`, `status: 'Active'`) is set as custom claims on the newly created Firebase Auth user. These claims are vital for enforcing security rules efficiently.
6.  **Atomic Data Provisioning (Firestore)**: A Firestore batched write is prepared to perform the following actions atomically:
    a. Create the main tenant document in `/tenants/{newTenantId}`.
    b. Create the admin's user profile document in `/tenants/{newTenantId}/users/{newUserId}`.
    c. Create the default configuration document in `/tenants/{newTenantId}/config/default`.
7.  **Commit**: The batch is committed to Firestore. If any part of the batch fails, the entire operation is rolled back.
8.  **Response**: Upon successful commit, a success response containing the new `tenantId` and `userId` is returned to the client.

## 4. Component Design

This section details the design of each file within the `src` directory.

### 4.1. `src/index.ts` (Endpoint Entry Point)

-   **Purpose**: To define and export the public `onCall` Cloud Function, handle top-level request/response logic, and orchestrate the service calls.
-   **Implementation Details**:
    -   Initialize the Firebase Admin SDK: `admin.initializeApp()`.
    -   Export a single `onCall` function named `provisionTenant`.
    -   The function must be configured to enforce App Check: `functions.runWith({ enforceAppCheck: true }).https.onCall(async (data, context) => { ... });`
    -   **Handler Logic**:
        1.  Perform basic validation on the `data` object to ensure it contains all required fields (`organizationName`, `adminFullName`, `adminEmail`, `adminPassword`). If invalid, throw a `functions.https.HttpsError('invalid-argument', 'Request payload is missing required fields.')`.
        2.  Instantiate dependencies: `AuthAdapter`, `FirestoreRepository`, and `ProvisioningService`.
        3.  Wrap the call to the service in a `try...catch` block.
        4.  Call `provisioningService.provisionNewTenant(data)`.
        5.  On success, return `{ success: true, tenantId: result.tenantId, userId: result.userId }`.
        6.  In the `catch` block, inspect the error message. If it's the specific 'USER_EXISTS' error from the service, throw `new functions.https.HttpsError('already-exists', 'A user with this email address already exists.')`. For all other errors, log the error and throw a generic `new functions.https.HttpsError('internal', 'An unexpected error occurred while provisioning the tenant.')`.

### 4.2. `src/application/provisioning.service.ts` (Business Logic)

-   **Purpose**: To encapsulate and orchestrate the core business logic of the tenant provisioning workflow.
-   **Class**: `ProvisioningService`
    -   **Constructor**:
        typescript
        constructor(
          private readonly authAdapter: AuthAdapter,
          private readonly firestoreRepo: FirestoreRepository
        ) {}
        
    -   **Method**: `public async provisionNewTenant(request: ProvisionTenantRequest): Promise<{ tenantId: string; userId: string; }>`
        -   **Logic**:
            1.  Check for user existence: `const userExists = await this.firestoreRepo.doesUserExistInAnyTenant(request.adminEmail);`
            2.  If `userExists` is true, throw `new Error('USER_EXISTS')`.
            3.  Generate a new unique tenant ID: `const tenantId = this.firestoreRepo.generateTenantId();`
            4.  Create the authentication user: `const authUser = await this.authAdapter.createAuthUser(request.adminEmail, request.adminPassword, request.adminFullName);`
            5.  Set custom claims for the new user: `await this.authAdapter.setAdminClaims(authUser.uid, tenantId);`
            6.  Call the repository to create all Firestore documents in one atomic transaction: `await this.firestoreRepo.provisionNewTenantInBatch(...)`.
            7.  Return `{ tenantId, userId: authUser.uid }`.

### 4.3. `src/infrastructure/firestore.repository.ts` (Data Access - Firestore)

-   **Purpose**: To abstract all interactions with the Firestore database, providing clean, testable methods for data persistence.
-   **Class**: `FirestoreRepository`
    -   **Constructor**:
        typescript
        constructor(private readonly db: admin.firestore.Firestore) {}
        
    -   **Method**: `public generateTenantId(): string`
        -   **Logic**: Returns `this.db.collection('tenants').doc().id`.
    -   **Method**: `public async doesUserExistInAnyTenant(email: string): Promise<boolean>`
        -   **Logic**:
            1.  Perform a collection group query: `const querySnapshot = await this.db.collectionGroup('users').where('email', '==', email).limit(1).get();`
            2.  Return `!querySnapshot.empty`.
    -   **Method**: `public async provisionNewTenantInBatch(details: { ... }): Promise<void>`
        -   **Logic**:
            1.  Create a batched write: `const batch = this.db.batch();`
            2.  Define references to the new documents: `tenantRef`, `userRef`, `configRef`.
            3.  **Tenant Document**: `batch.set(tenantRef, { ... });`
            4.  **User Document**: `batch.set(userRef, { role: 'Admin', status: 'Active', ... });`
            5.  **Config Document**: `batch.set(configRef, { dataRetentionDays: DEFAULT_DATA_RETENTION_DAYS, approvalLevels: DEFAULT_APPROVAL_LEVELS, ... });`
            6.  Commit the batch: `await batch.commit();`

### 4.4. `src/infrastructure/auth.adapter.ts` (Data Access - Auth)

-   **Purpose**: To encapsulate all interactions with the Firebase Authentication service.
-   **Class**: `AuthAdapter`
    -   **Constructor**:
        typescript
        constructor(private readonly auth: admin.auth.Auth) {}
        
    -   **Method**: `public async createAuthUser(email: string, password: string, fullName: string): Promise<admin.auth.UserRecord>`
        -   **Logic**: Calls and returns `this.auth.createUser({ email, password, displayName: fullName });`.
    -   **Method**: `public async setAdminClaims(userId: string, tenantId: string): Promise<void>`
        -   **Logic**: Calls `this.auth.setCustomUserClaims(userId, { tenantId, role: 'Admin', status: 'Active' });`. This is a critical security step.

### 4.5. `src/dtos/provision-tenant.dto.ts` (Data Transfer Object)

-   **Purpose**: To define the data contract for the provisioning request.
-   **Implementation**:
    typescript
    export interface ProvisionTenantRequest {
      readonly organizationName: string;
      readonly adminFullName: string;
      readonly adminEmail: string;
      readonly adminPassword: string;
    }
    

### 4.6. `src/config/tenant.defaults.ts` (Configuration Constants)

-   **Purpose**: To centralize default values for new tenant configurations.
-   **Implementation**:
    typescript
    // Default number of days to retain active attendance records.
    export const DEFAULT_DATA_RETENTION_DAYS = 365;

    // Default number of approval levels required for an attendance record.
    export const DEFAULT_APPROVAL_LEVELS = 1;
    

## 5. Configuration & Dependencies

### 5.1. `package.json`

-   **`dependencies`**:
    -   `firebase-admin`: "latest"
    -   `firebase-functions`: "latest"
-   **`devDependencies`**:
    -   `typescript`: "latest"
    -   `eslint`: "latest"
    -   `@typescript-eslint/parser`: "latest"
-   **`scripts`**:
    -   `lint`: "eslint --ext .js,.ts ."
    -   `build`: "tsc"
    -   `serve`: "npm run build && firebase emulators:start --only functions"
    -   `shell`: "npm run build && firebase functions:shell"
    -   `deploy`: "firebase deploy --only functions"

### 5.2. `tsconfig.json`

-   **Key Compiler Options**:
    -   `"module": "commonjs"`
    -   `"target": "es2021"`
    -   `"outDir": "lib"`
    -   `"rootDir": "src"`
    -   `"sourceMap": true`
    -   `"strict": true`
# Software Design Specification (SDS) for Firestore Security Rules

## 1. Introduction

This document provides the detailed software design specification for the `firestore.rules` file. This file is the single source of truth for the application's data security model, defining all access control logic for the Firebase Firestore database. The rules are designed to be secure, efficient, and maintainable, enforcing strict multi-tenancy, role-based access control (RBAC), and hierarchical permissions.

## 2. Core Principles & Custom Claims

The security rules are built upon the following core principles and assumptions:

*   **Multi-Tenancy:** All data is strictly partitioned by a `tenantId`. A user can only ever interact with data belonging to their own tenant.
*   **Role-Based Access Control (RBAC):** Permissions are granted based on a user's role: 'Admin', 'Supervisor', or 'Subordinate'.
*   **Hierarchical Access:** 'Supervisor' roles have read access to the data of users within their management chain.
*   **Principle of Least Privilege:** Users are only granted the minimum permissions necessary to perform their tasks.
*   **Server-Side Trust:** Critical data creation and augmentation (e.g., `approverHierarchy` population, audit logging, tenant provisioning) are performed by trusted backend Cloud Functions, not by the client. Client-side write permissions are restricted accordingly.

### 2.1. Firebase Authentication Custom Claims

The rules heavily rely on custom claims being set in the user's Firebase Authentication token during the login process. The application backend is responsible for setting and maintaining these claims.

*   `tenantId` (String): The unique ID of the tenant the user belongs to.
*   `role` (String): The user's role, one of 'Admin', 'Supervisor', or 'Subordinate'.
*   `status` (String): The user's account status, must be 'Active' for most operations.

## 3. `firestore.rules` File Specification

The `firestore.rules` file will contain all the logic described below.

### 3.1. Rules Version and Service Definition


rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // All collection rules will be defined here
  }
}


### 3.2. Helper Functions

A set of reusable functions will be defined at the top of the rules file to improve readability and maintainability.


// --- Helper Functions ---

// Checks if the user is authenticated.
function isLoggedIn() {
  return request.auth != null;
}

// Checks if the authenticated user's custom claim tenantId matches the one in the path.
function isUserInTenant(tenantId) {
  return isLoggedIn() && request.auth.token.tenantId == tenantId;
}

// Checks if the authenticated user has the specified role.
function isRole(role) {
  return isLoggedIn() && request.auth.token.role == role;
}

// Checks if the user is an Admin of the specified tenant.
function isAdmin(tenantId) {
  return isUserInTenant(tenantId) && isRole('Admin');
}

// Checks if the user is a Supervisor of the specified tenant.
function isSupervisor(tenantId) {
  return isUserInTenant(tenantId) && isRole('Supervisor');
}

// Checks if the user is a Subordinate of the specified tenant.
function isSubordinate(tenantId) {
  return isUserInTenant(tenantId) && isRole('Subordinate');
}

// Checks if the requesting user's UID matches the provided userId.
function isRequestingUser(userId) {
  return isLoggedIn() && request.auth.uid == userId;
}

// Checks if the requesting user owns the document (by comparing UID to a 'userId' field).
function isOwner(docData) {
    return isLoggedIn() && request.auth.uid == docData.userId;
}

// Validates common fields for a new document creation.
function isNewDocValid(tenantId) {
    let data = request.resource.data;
    return isUserInTenant(tenantId)
        && data.tenantId == tenantId // TenantId in document must match path
        && data.createdAt == request.time // Must be a server timestamp
        && data.updatedAt == request.time; // Must be a server timestamp
}

// Validates that specific fields have not been changed during an update.
function hasUnchangedFields(fields) {
    let data = request.resource.data;
    let oldData = resource.data;
    return fields.size() == 0 || fields[0] in data && data[fields[0]] == oldData[fields[0]] && hasUnchangedFields(fields.slice(1, fields.size()));
}


### 3.3. Collection-Specific Rules

The following `match` blocks will define the access rules for each collection in the database.

#### 3.3.1. `tenants` Collection

Defines rules for the top-level tenant documents.


    // --- Tenant Rules ---
    // Tenants are provisioned by a trusted backend function, not the client.
    match /tenants/{tenantId} {
      allow read: if isUserInTenant(tenantId);
      allow write: if false; // Disallow client-side create, update, delete.
    }


#### 3.3.2. `users` Sub-collection

Defines rules for user profile documents within a tenant.


    // --- User Rules ---
    // /tenants/{tenantId}/users/{userId}
    match /tenants/{tenantId}/users/{userId} {
      allow read: if isUserInTenant(tenantId)
                     && (isAdmin(tenantId) || isSupervisor(tenantId) || isRequestingUser(userId));

      allow create: if isAdmin(tenantId)
                      && isNewDocValid(tenantId)
                      && request.resource.data.userId == userId;

      allow update: if isUserInTenant(tenantId)
                      // Admins can update any user in their tenant.
                      && (isAdmin(tenantId)
                      // A user can update only their own name and fcmToken.
                      || (isRequestingUser(userId)
                          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['name', 'fcmToken', 'updatedAt'])))
                      // Ensure updatedAt is always updated.
                      && request.resource.data.updatedAt == request.time
                      && hasUnchangedFields(['userId', 'tenantId', 'email', 'createdAt']);

      // Deletion is handled by Admins, but deactivation is preferred.
      allow delete: if isAdmin(tenantId);
    }


#### 3.3.3. `attendance` Sub-collection

Defines rules for attendance records, including hierarchical supervisor access.


    // --- Attendance Rules ---
    // /tenants/{tenantId}/attendance/{recordId}
    match /tenants/{tenantId}/attendance/{recordId} {
      allow read: if isUserInTenant(tenantId)
                    // Admins can read all records in the tenant.
                    && (isAdmin(tenantId)
                    // The record owner can read their own records.
                    || isOwner(resource.data)
                    // A supervisor in the hierarchy can read the record.
                    || request.auth.uid in resource.data.approverHierarchy);

      allow create: if isUserInTenant(tenantId)
                      && isOwner(request.resource.data)
                      && isNewDocValid(tenantId)
                      // Client must set initial status to Pending.
                      && request.resource.data.status == 'Pending'
                      // Client must not set server-side fields.
                      && !('serverSyncTimestamp' in request.resource.data)
                      && !('checkInAddress' in request.resource.data)
                      && !('approverHierarchy' in request.resource.data);

      allow update: if isUserInTenant(tenantId)
                      // Admins or Supervisors in the hierarchy can approve/reject.
                      && (isAdmin(tenantId) || (isSupervisor(tenantId) && request.auth.uid in resource.data.approverHierarchy))
                      // They can only change the status and approvalDetails.
                      && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'approvalDetails', 'updatedAt'])
                      && hasUnchangedFields(['userId', 'tenantId', 'createdAt', 'checkInLocation', 'clientCheckInTimestamp', 'approverHierarchy']);

      // Records are purged by a trusted backend function, not deleted by clients.
      allow delete: if false;
    }


#### 3.3.4. Other Sub-collections

Defines rules for events, configuration, audit logs, and other tenant-specific data.


    // --- Event Rules ---
    // /tenants/{tenantId}/events/{eventId}
    match /tenants/{tenantId}/events/{eventId} {
      allow read: if isUserInTenant(tenantId)
                    && (isAdmin(tenantId) || isSupervisor(tenantId) || request.auth.uid in resource.data.assignedTo);

      // Only Admins and Supervisors can manage events.
      allow write: if isAdmin(tenantId) || isSupervisor(tenantId);
    }

    // --- Tenant Configuration Rules ---
    // /tenants/{tenantId}/config/{configId}
    match /tenants/{tenantId}/config/{configId} {
      // Any user in the tenant can read the configuration.
      allow read: if isUserInTenant(tenantId);

      // Only Admins can change the configuration.
      allow write: if isAdmin(tenantId);
    }

    // --- Audit Log Rules ---
    // /tenants/{tenantId}/auditLogs_*/{logId} - Covers partitioned collections
    match /tenants/{tenantId}/{collection}/{logId}
        where collection.matches('auditLogs_.*') {
      // Only Admins can view audit logs.
      allow read: if isAdmin(tenantId);
      // Logs are immutable and created by backend functions only.
      allow write: if false;
    }

    // --- Linked Sheet Rules ---
    // /tenants/{tenantId}/linkedSheets/{sheetId}
    match /tenants/{tenantId}/linkedSheets/{sheetId} {
      // Only Admins can manage the Google Sheets integration.
      allow read, write: if isAdmin(tenantId);
    }

    // --- User Legal Acceptance Rules ---
    // /tenants/{tenantId}/userLegalAcceptance/{acceptanceId}
    match /tenants/{tenantId}/userLegalAcceptance/{acceptanceId} {
      allow read: if isAdmin(tenantId) || isRequestingUser(acceptanceId);
      allow create: if isRequestingUser(acceptanceId) && isRequestingUser(request.resource.data.userId);

      // Acceptance is a one-time event, cannot be updated or deleted by client.
      allow update, delete: if false;
    }

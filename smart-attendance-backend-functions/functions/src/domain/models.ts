import { firestore } from "firebase-admin";

/**
 * This file contains TypeScript interfaces and type definitions that represent
 * the core domain entities of the system. These types mirror the Firestore data
 * structures, ensuring type safety and data consistency across all backend services
 * and functions.
 */

// Type alias for user roles to enforce consistency.
export type UserRole = "Admin" | "Supervisor" | "Subordinate";

// Type alias for user account statuses.
export type UserStatus = "Active" | "Invited" | "Deactivated";

// Type alias for attendance record approval statuses.
export type AttendanceStatus = "Pending" | "Approved" | "Rejected";

// Type alias for offline synchronization statuses.
export type SyncStatus = "Queued" | "Synced" | "Failed";

/**
 * Represents a single organization or company in the multi-tenant architecture.
 */
export interface Tenant {
  organizationName: string;
  createdAt: firestore.Timestamp;
  updatedAt: firestore.Timestamp;
}

/**
 * Represents an individual user account within a specific tenant.
 * Corresponds to a document in `/tenants/{tenantId}/users/{userId}`.
 */
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

/**
 * Represents a single attendance event, including check-in and check-out data.
 * Corresponds to a document in `/tenants/{tenantId}/attendance/{attendanceId}`.
 */
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
  checkInAddress?: string; // Populated by a Cloud Function
  checkOutAddress?: string; // Populated by a Cloud Function
  status: AttendanceStatus;
  syncStatus: SyncStatus;
  isOutsideGeofence: boolean;
  deviceInfo: { [key: string]: any };
  approvalDetails?: {
    approverId: string;
    timestamp: firestore.Timestamp;
    comments: string;
  };
  approverHierarchy: string[]; // Populated by a Cloud Function
}

/**
 * Stores tenant-specific configuration settings.
 * Corresponds to a document in `/tenants/{tenantId}/config/{configId}`.
 */
export interface TenantConfig {
  tenantId: string;
  dataRetentionDays: number;
  approvalLevels: number;
  timezone: string; // IANA format (e.g., 'America/New_York')
  geofence?: {
    center: firestore.GeoPoint;
    radius: number; // in meters
  };
}

/**
 * Stores metadata for a Google Sheet linked by a tenant for data export.
 * Corresponds to a document in `/tenants/{tenantId}/linkedSheets/{linkedSheetId}`.
 */
export interface LinkedSheet {
  tenantId: string;
  fileId: string;
  ownerEmail: string;
  lastSyncStatus: "Success" | "Failed" | "In Progress" | "Not Started";
  lastSyncTimestamp?: firestore.Timestamp;
  lastSyncError?: string;
}

/**
 * Represents a scheduled event or task that can be assigned to users.
 */
export interface Event {
  tenantId: string;
  title: string;
  description?: string;
  eventDate: firestore.Timestamp;
  assignedTo: string[];
  createdBy: string;
  createdAt: firestore.Timestamp;
  updatedAt: firestore.Timestamp;
}

/**
 * Represents an immutable log of a critical action.
 */
export interface AuditLog {
  tenantId: string;
  timestamp: firestore.Timestamp;
  actorId: string;
  action: string;
  targetId?: string;
  details?: { [key: string]: any };
}
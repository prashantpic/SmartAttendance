/**
 * @file Defines the TypeScript interfaces for the core domain entities
 * involved in the data archival process. This ensures type safety and a
 * clear data contract throughout the function.
 * @namespace jobs.scheduled.dataArchival.domain
 */

/**
 * Represents a single tenant in the system.
 */
export interface Tenant {
  /** The globally unique identifier for the tenant. */
  tenantId: string;
  /** The display name of the tenant's organization. */
  organizationName: string;
  // Other tenant fields can be added here as necessary.
}

/**
 * Represents the specific configuration settings for a tenant,
 * particularly those relevant to data retention.
 */
export interface TenantConfig {
  /** The number of days to retain active attendance records before archival. */
  dataRetentionDays: number;
  // Other configuration fields can be added here.
}

/**
 * Represents a simplified structure of an attendance record document in Firestore.
 * It includes only the fields necessary for the archival process, plus an
 * index signature to capture all other fields from the document.
 */
export interface AttendanceRecord {
  /** The unique identifier for the attendance record document. */
  attendanceId: string;
  /** The ID of the user who created the record. */
  userId: string;
  /** The Firestore Timestamp object representing the check-in time. */
  clientCheckInTimestamp: {
    _seconds: number;
    _nanoseconds: number;
  };
  /**
   * Index signature to allow for any other fields present in the
   * Firestore document, ensuring no data is lost during processing.
   */
  [key: string]: any;
}
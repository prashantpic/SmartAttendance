import {Timestamp, GeoPoint} from "firebase-admin/firestore";

/**
 * Defines the data structure for a User document in Firestore.
 * Contains only the fields relevant to the attendance processing function.
 */
export interface User {
  userId: string;
  supervisorId?: string | null;
  // Other user fields are not required by this function
}

/**
 * Defines the data structure for an Attendance document in Firestore.
 * Includes both the initial client-written fields and the optional fields
 * that will be added by the server-side enrichment function.
 */
export interface Attendance {
  userId: string;
  checkInLocation: GeoPoint;

  // Fields to be added by the function
  serverSyncTimestamp?: Timestamp;
  approverHierarchy?: string[];
  checkInAddress?: string;

  // Other pre-existing attendance fields are not strictly needed by the function's logic
  // but are part of the model for completeness.
}
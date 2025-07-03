import * as admin from "firebase-admin";

/**
 * Represents the structure of a document in the /tenants/{tenantId}/linkedSheets/{sheetId} subcollection.
 * It stores metadata about the Google Sheet integration for a specific tenant.
 */
export interface LinkedSheet {
  id: string; // The Firestore document ID.
  tenantId: string; // The ID of the parent tenant.
  fileId: string; // The ID of the Google Sheet file.
  ownerEmail: string; // The email of the user who linked the sheet.
  lastSyncStatus: "Success" | "Failed" | "In Progress" | "Not Started";
  lastSyncTimestamp?: admin.firestore.Timestamp;
  lastSyncError?: string; // Stores the error message on a failed sync.
}

/**
 * Represents a simplified version of an attendance record, structured for export.
 * This interface contains only the fields necessary for the Google Sheet.
 */
export interface AttendanceRecord {
  // Fields from the Firestore 'attendance' document.
  userId: string;
  userName: string;
  eventId?: string;
  clientCheckInTimestamp: admin.firestore.Timestamp;
  clientCheckOutTimestamp?: admin.firestore.Timestamp;
  checkInAddress?: string;
  checkOutAddress?: string;
  status: "Approved"; // The query specifically targets 'Approved' records.
  serverSyncTimestamp: admin.firestore.Timestamp; // Used for incremental syncs.

  // Optional nested object for approval details.
  approvalDetails?: {
    approverId: string;
    timestamp: admin.firestore.Timestamp;
    comments?: string;
  };
}
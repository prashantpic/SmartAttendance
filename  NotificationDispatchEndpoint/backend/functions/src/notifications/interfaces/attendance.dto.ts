/**
 * @file attendance.dto.ts
 * @description Defines the Data Transfer Object (DTO) for an attendance document.
 * This interface provides a strict type definition for the data coming from the
 * Firestore `onWrite` event, preventing runtime errors and improving code readability.
 */

/**
 * Represents the data structure of an attendance document in Firestore.
 */
export interface AttendanceDto {
  /** The ID of the user who submitted the attendance record. */
  readonly userId: string;

  /** Denormalized name of the user for display purposes. */
  readonly userName: string;

  /** The current status of the attendance record. */
  readonly status: 'Pending' | 'Approved' | 'Rejected';

  /**
   * An array of user IDs representing the approval hierarchy for this user,
   * starting from the direct supervisor.
   */
  readonly approverHierarchy: string[];

  /** Optional details about the approval or rejection action. */
  readonly approvalDetails?: {
    approverId: string;
    timestamp: any; // Firestore Timestamp
  };
}
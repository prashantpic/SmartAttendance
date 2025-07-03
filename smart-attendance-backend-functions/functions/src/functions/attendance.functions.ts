import * as functions from "firebase-functions";
import { AttendanceService } from "../services/attendance.service";
import { Attendance } from "../domain/models";

/**
 * Defines and exports Firestore-triggered Cloud Functions that react to changes
 * in the 'attendance' collection.
 */

/**
 * Triggered when a new attendance document is created.
 * It invokes the AttendanceService to augment the new record with server-side data
 * like the approver hierarchy and reverse-geocoded address.
 */
export const onAttendanceCreated = functions.firestore
  .document("/tenants/{tenantId}/attendance/{attendanceId}")
  .onCreate(async (snap, context) => {
    const { tenantId, attendanceId } = context.params;
    const data = snap.data() as Attendance;

    functions.logger.info(`New attendance record ${attendanceId} created for tenant ${tenantId}. Starting augmentation.`);

    try {
      await AttendanceService.augmentNewRecord(attendanceId, tenantId, data);
      functions.logger.info(`Successfully augmented attendance record ${attendanceId}.`);
    } catch (error) {
      functions.logger.error(`Error augmenting attendance record ${attendanceId}:`, error);
      // Depending on requirements, you might want to add retry logic or
      // write to an error queue here.
    }
  });

/**
 * Triggered when an attendance document is updated.
 * It invokes the AttendanceService to check if a notification needs to be sent,
 * for example, when an attendance record's status is changed to 'Approved' or 'Rejected'.
 */
export const onAttendanceUpdated = functions.firestore
  .document("/tenants/{tenantId}/attendance/{attendanceId}")
  .onUpdate(async (change, context) => {
    const { tenantId, attendanceId } = context.params;
    const beforeData = change.before.data() as Attendance;
    const afterData = change.after.data() as Attendance;

    if (beforeData.status !== afterData.status) {
        functions.logger.info(`Attendance record ${attendanceId} in tenant ${tenantId} status changed from ${beforeData.status} to ${afterData.status}.`);

        try {
            await AttendanceService.notifyOnStatusChange(beforeData, afterData);
        } catch (error) {
            functions.logger.error(`Error sending notification for attendance update on record ${attendanceId}:`, error);
        }
    }
  });
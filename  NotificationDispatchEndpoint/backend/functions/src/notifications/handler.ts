/**
 * @file handler.ts
 * @description Contains the Firebase Cloud Function trigger that listens for
 * onWrite events on the attendance collection. It serves as the primary entry
 * point for the notification dispatch logic, delegating processing to the
 * NotificationService.
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { NotificationService } from "./application/notification.service";
import { UserRepository } from "./infrastructure/user.repository";
import { FcmService } from "./infrastructure/fcm.service";
import { AttendanceDto } from "./interfaces/attendance.dto";

// --- Initialization & Dependency Injection ---

// Initialize the Firebase Admin SDK. This should only be done once per function deployment.
if (admin.apps.length === 0) {
    admin.initializeApp();
}


// Instantiate infrastructure layers
const db = admin.firestore();
const messaging = admin.messaging();
const userRepository = new UserRepository(db);
const fcmService = new FcmService(messaging);

// Instantiate the application service layer, injecting dependencies
const notificationService = new NotificationService(userRepository, fcmService);

// --- Cloud Function Trigger Definition ---

/**
 * Firebase Cloud Function triggered on any write (create, update, delete) to an
 * attendance document.
 * Path: /tenants/{tenantId}/attendance/{attendanceId}
 */
export const attendanceOnWrite = functions.firestore
  .document("/tenants/{tenantId}/attendance/{attendanceId}")
  .onWrite(async (change, context) => {
    const { tenantId, attendanceId } = context.params;

    functions.logger.info(
      `Function triggered for tenantId: ${tenantId}, attendanceId: ${attendanceId}.`
    );

    // Get the data snapshots before and after the event
    const beforeData = change.before.data() as AttendanceDto | undefined;
    const afterData = change.after.data() as AttendanceDto | undefined;

    try {
      // Delegate the core logic to the application service
      await notificationService.handleAttendanceUpdate(beforeData, afterData, {
        tenantId,
        attendanceId,
      });
      functions.logger.info(
        `Successfully processed attendance write for ${attendanceId}.`
      );
    } catch (error) {
      functions.logger.error(
        `A fatal error occurred in the handler for attendanceId ${attendanceId}:`,
        error
      );
      // Re-throwing the error might cause the function to retry, depending on
      // the function's configuration and the nature of the error.
      throw error;
    }
  });
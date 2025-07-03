/**
 * @file notification.service.ts
 * @description Contains the core business logic for determining which notifications
 * to send based on an attendance record update. It decouples the trigger handler
 * from the notification logic.
 */

import { IUserRepository } from "../infrastructure/user.repository";
import { IFcmService } from "../infrastructure/fcm.service";
import { AttendanceDto } from "../interfaces/attendance.dto";
import { notificationTemplates } from "../config/notification.templates";
import { Notification } from "../domain/notification";
import * as functions from "firebase-functions";

/**
 * This service encapsulates the business rules for sending notifications. It
 * orchestrates the process of sending push notifications by identifying the event
 * type, fetching necessary user data, and dispatching the message.
 */
export class NotificationService {
  /**
   * @param {IUserRepository} userRepository - The repository for accessing user data.
   * @param {IFcmService} fcmService - The service for sending FCM messages.
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly fcmService: IFcmService
  ) {}

  /**
   * Handles an update to an attendance record, determines if a notification is
   * needed, and dispatches it.
   * @param {AttendanceDto | undefined} before - The document state before the change.
   * @param {AttendanceDto | undefined} after - The document state after the change.
   * @param {{ tenantId: string, attendanceId: string }} context - Event context.
   * @returns {Promise<void>}
   */
  public async handleAttendanceUpdate(
    before: AttendanceDto | undefined,
    after: AttendanceDto | undefined,
    context: { tenantId: string; attendanceId: string }
  ): Promise<void> {
    try {
      // Deletion event, no action needed.
      if (!after) {
        functions.logger.log(`Attendance record ${context.attendanceId} deleted. No notification sent.`);
        return;
      }

      // Case 1: New Pending Request (Create Event)
      if (!before && after.status === "Pending") {
        await this.handleNewRequest(after, context);
        return;
      }

      // Case 2: Request Actioned (Update Event)
      if (
        before?.status === "Pending" &&
        (after.status === "Approved" || after.status === "Rejected")
      ) {
        await this.handleRequestActioned(after, context);
        return;
      }

      functions.logger.log(
        `No notification criteria met for attendanceId: ${context.attendanceId}. Before status: ${before?.status}, After status: ${after.status}`
      );
    } catch (error) {
      functions.logger.error(
        `Error in NotificationService for attendanceId ${context.attendanceId}:`, error
      );
    }
  }

  /**
   * Handles the logic for notifying a supervisor about a new pending request.
   */
  private async handleNewRequest(
    after: AttendanceDto,
    context: { tenantId: string }
  ): Promise<void> {
    functions.logger.log(`New pending request detected for user ${after.userId}.`);

    if (!after.approverHierarchy || after.approverHierarchy.length === 0) {
      functions.logger.warn(
        `Cannot send notification: approverHierarchy is missing or empty for user ${after.userId}.`
      );
      return;
    }

    const supervisorId = after.approverHierarchy[0];
    const supervisor = await this.userRepository.findById(
      context.tenantId,
      supervisorId
    );

    if (!supervisor) {
      functions.logger.warn(`Supervisor with ID ${supervisorId} not found.`);
      return;
    }

    if (supervisor.fcmToken) {
      const notification: Notification = {
        recipientToken: supervisor.fcmToken,
        title: notificationTemplates.NEW_REQUEST_TITLE,
        body: notificationTemplates.NEW_REQUEST_BODY(after.userName),
        data: { attendanceId: context.attendanceId, tenantId: context.tenantId },
      };
      await this.fcmService.sendPushNotification(notification);
    } else {
      functions.logger.log(`Supervisor ${supervisorId} does not have an FCM token. No notification sent.`);
    }
  }

  /**
   * Handles the logic for notifying a subordinate that their request was actioned.
   */
  private async handleRequestActioned(
    after: AttendanceDto,
    context: { tenantId: string }
  ): Promise<void> {
    functions.logger.log(
      `Request from user ${after.userId} was actioned with status: ${after.status}.`
    );
    const subordinateId = after.userId;
    const subordinate = await this.userRepository.findById(
      context.tenantId,
      subordinateId
    );

    if (!subordinate) {
      functions.logger.warn(`Subordinate with ID ${subordinateId} not found.`);
      return;
    }

    if (subordinate.fcmToken) {
      const notification: Notification = {
        recipientToken: subordinate.fcmToken,
        title:
          after.status === "Approved"
            ? notificationTemplates.REQUEST_APPROVED_TITLE
            : notificationTemplates.REQUEST_REJECTED_TITLE,
        body:
          after.status === "Approved"
            ? notificationTemplates.REQUEST_APPROVED_BODY
            : notificationTemplates.REQUEST_REJECTED_BODY,
        data: { attendanceId: context.attendanceId, tenantId: context.tenantId },
      };
      await this.fcmService.sendPushNotification(notification);
    } else {
      functions.logger.log(`Subordinate ${subordinateId} does not have an FCM token. No notification sent.`);
    }
  }
}
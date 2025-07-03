/**
 * @file notification.templates.ts
 * @description A configuration file that stores the string templates for all
 * push notifications sent by the system. This centralizes user-facing text for
 * easy management and future localization, separating content from application logic.
 */

/**
 * A collection of templates for generating notification content.
 */
export const notificationTemplates = {
  /**
   * Title for a new attendance request notification sent to a supervisor.
   */
  NEW_REQUEST_TITLE: "New Attendance Request",

  /**
   * Generates the body for a new attendance request notification.
   * @param {string} userName - The name of the employee who submitted the request.
   * @returns {string} The formatted notification body.
   */
  NEW_REQUEST_BODY: (userName: string): string =>
    `You have a new attendance request from ${userName}.`,

  /**
   * Title for a notification informing the user their request was approved.
   */
  REQUEST_APPROVED_TITLE: "Request Approved",

  /**
   * Body for a notification informing the user their request was approved.
   */
  REQUEST_APPROVED_BODY:
    "Your recent attendance request has been approved by your supervisor.",

  /**
   * Title for a notification informing the user their request was rejected.
   */
  REQUEST_REJECTED_TITLE: "Request Rejected",

  /**
   * Body for a notification informing the user their request was rejected.
   */
  REQUEST_REJECTED_BODY:
    "Your recent attendance request has been rejected by your supervisor.",
};
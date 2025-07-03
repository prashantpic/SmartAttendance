/**
 * @file index.ts
 * @description The main entry point for all Firebase Cloud Functions in this project.
 * This file imports function triggers from various modules, such as the notification
 * handler, and exports them for deployment to the Firebase environment.
 * It serves as the root manifest for the serverless functions.
 */

import { attendanceOnWrite } from "./notifications/handler";

/**
 * Aggregates and exports all defined Cloud Functions, making them discoverable
 * by the Firebase CLI for deployment.
 *
 * This function dispatches push notifications based on status changes in
 * attendance records.
 */
export const notificationDispatchEndpoint = attendanceOnWrite;
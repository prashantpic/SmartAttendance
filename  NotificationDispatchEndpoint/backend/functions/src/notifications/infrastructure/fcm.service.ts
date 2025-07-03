/**
 * @file fcm.service.ts
 * @description An adapter that encapsulates the logic for sending push
 * notifications using the Firebase Admin SDK for Firebase Cloud Messaging (FCM).
 */

import { Messaging } from "firebase-admin/messaging";
import { Notification } from "../domain/notification";
import * as functions from "firebase-functions";

/**
 * Interface for the FCM service, defining the contract for sending push notifications.
 */
export interface IFcmService {
  /**
   * Sends a push notification to a specific device.
   * @param {Notification} notification - The notification object containing recipient, title, and body.
   * @returns {Promise<void>} A promise that resolves when the send operation is complete.
   */
  sendPushNotification(notification: Notification): Promise<void>;
}

/**
 * Concrete implementation of IFcmService using the Firebase Admin SDK.
 */
export class FcmService implements IFcmService {
  /**
   * @param {Messaging} messaging - An instance of the Firebase Admin Messaging service.
   */
  constructor(private readonly messaging: Messaging) {}

  /**
   * Constructs and dispatches a push notification via FCM.
   * @param {Notification} notification - The notification payload.
   */
  public async sendPushNotification(notification: Notification): Promise<void> {
    const messagePayload: {
      token: string;
      notification: { title: string; body: string };
      data?: { [key: string]: string };
    } = {
      token: notification.recipientToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
    };

    if (notification.data) {
      messagePayload.data = notification.data;
    }

    try {
      functions.logger.info(
        `Attempting to send notification titled "${notification.title}" to token ${notification.recipientToken.substring(0, 20)}...`
      );
      const response = await this.messaging.send(messagePayload);
      functions.logger.info("Successfully sent notification:", response);
    } catch (error) {
      // FCM errors for invalid tokens are well-known. We log them differently.
      if (
        error instanceof Error &&
        "code" in error &&
        (error.code === "messaging/invalid-registration-token" ||
          error.code === "messaging/registration-token-not-registered")
      ) {
        functions.logger.warn(
          `FCM token ${notification.recipientToken.substring(0, 20)}... is invalid or unregistered. It should be removed from the user's document.`,
          error
        );
      } else {
        functions.logger.error(
          "Failed to send push notification.",
          error
        );
      }
      // We do not re-throw the error to prevent the entire function from retrying
      // for a single failed notification.
    }
  }
}
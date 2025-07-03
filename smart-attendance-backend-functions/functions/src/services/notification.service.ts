import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { FIRESTORE_COLLECTIONS } from "../common/constants";
import { User } from "../domain/models";

/**
 * Provides a centralized service for sending Firebase Cloud Messaging (FCM) push notifications.
 * This service abstracts away the details of fetching user tokens and handling API responses.
 */
export class NotificationService {
  /**
   * Sends a push notification to a single user.
   *
   * @param {string} userId The ID of the user to notify.
   * @param {string} tenantId The tenant context for the user.
   * @param {{ title: string; body: string; data?: { [key: string]: string } }} payload The notification payload.
   * @returns {Promise<void>} A promise that resolves when the notification has been sent.
   */
  public static async sendNotificationToUser(
    userId: string,
    tenantId: string,
    payload: { title: string; body: string; data?: { [key: string]: string } }
  ): Promise<void> {
    const userRef = admin
      .firestore()
      .collection(FIRESTORE_COLLECTIONS.TENANTS)
      .doc(tenantId)
      .collection(FIRESTORE_COLLECTIONS.USERS)
      .doc(userId);

    try {
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        functions.logger.warn(
          `User document not found for userId: ${userId} in tenant: ${tenantId}. Cannot send notification.`
        );
        return;
      }

      const user = userDoc.data() as User;
      const fcmToken = user.fcmToken;

      if (!fcmToken) {
        functions.logger.warn(
          `FCM token not found for user: ${userId}. Cannot send notification.`
        );
        return;
      }

      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        }
      };

      await admin.messaging().send(message);
      functions.logger.info(`Notification sent successfully to user: ${userId}`);
    } catch (error: any) {
      functions.logger.error(
        `Failed to send notification to user: ${userId}`,
        error
      );

      // Check for common error indicating a stale or invalid token
      if (
        error.code === "messaging/registration-token-not-registered" ||
        error.code === "messaging/invalid-registration-token"
      ) {
        functions.logger.info(
          `FCM token for user ${userId} is invalid. Clearing it from Firestore.`
        );
        // Asynchronously clear the stale token from the user's document
        await userRef.update({ fcmToken: admin.firestore.FieldValue.delete() });
      }
    }
  }
}
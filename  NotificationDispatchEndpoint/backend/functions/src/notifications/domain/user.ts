/**
 * @file user.ts
 * @description Defines the lightweight domain model for a User.
 * This model contains only the properties necessary for the notification context,
 * ensuring the NotificationService has access to required fields without being
 * coupled to the full user profile.
 */

/**
 * Represents a user within the notification bounded context.
 */
export interface User {
  /** The unique identifier for the user (document ID). */
  readonly id: string;

  /** The full name of the user. */
  readonly name: string;

  /** The Firebase Cloud Messaging (FCM) token for sending push notifications. Can be null if the user is not subscribed. */
  readonly fcmToken: string | null;
}
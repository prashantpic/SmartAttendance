/**
 * @file notification.ts
 * @description Defines the domain model for a push notification.
 * This interface provides a type-safe, structured representation of a push
 * notification payload, ensuring consistency when passing notification data
 * between the application and infrastructure layers.
 */

/**
 * Represents a push notification to be sent.
 */
export interface Notification {
  /** The FCM device token of the recipient. */
  readonly recipientToken: string;

  /** The title of the push notification. */
  readonly title: string;

  /** The body text of the push notification. */
  readonly body: string;

  /** Optional data payload for client-side logic like deep-linking. */
  readonly data?: { [key: string]: string };
}
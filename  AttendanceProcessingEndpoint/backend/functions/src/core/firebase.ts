import * as admin from "firebase-admin";

/**
 * Initializes the Firebase Admin SDK. This is done once per function deployment
 * and the resulting instances are exported for use across all modules.
 * This singleton approach prevents re-initialization on every function invocation.
 */
admin.initializeApp();

/**
 * A singleton instance of the Firebase Admin SDK's Firestore client.
 * Provides authenticated access to the Firestore database.
 */
export const db = admin.firestore();

// Exporting the admin app itself in case other admin services (like Auth) are needed.
export {admin};
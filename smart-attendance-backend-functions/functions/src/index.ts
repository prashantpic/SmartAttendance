import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK once at the application's root.
// This is used across all functions.
admin.initializeApp();

/**
 * This is the main entry point for all Firebase Cloud Functions.
 * It aggregates and exports all function triggers defined in separate files,
 * allowing Firebase to discover and deploy them.
 * This pattern keeps the codebase organized and modular.
 */

// Export all functions from the tenant management module
export * from "./functions/tenant.functions";

// Export all functions from the attendance processing module
export * from "./functions/attendance.functions";

// Export all functions from the user management module
export * from "./functions/user.functions";

// Export all functions from the scheduled tasks module
export * from "./functions/scheduled.functions";
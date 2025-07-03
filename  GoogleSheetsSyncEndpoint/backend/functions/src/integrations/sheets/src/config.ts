import * as functions from "firebase-functions";

// Centralized configuration for the Google Sheets Sync function.
export const config = {
  // Schedule for the function to run. This is a cron string for 3 AM daily.
  SCHEDULE: "0 3 * * *",

  // Timezone for the scheduled function to ensure it runs at the correct local time.
  TIMEZONE: "America/New_York",

  // The region where the function will be deployed.
  REGION: "us-central1",

  // Firestore collection and subcollection names.
  COLLECTIONS: {
    TENANTS: "tenants",
    LINKED_SHEETS: "linkedSheets",
    ATTENDANCE: "attendance",
  },

  // Scopes required for the Google Sheets and Google Drive APIs.
  // 'spreadsheets' for writing data.
  // 'drive.readonly' might be needed to verify file existence/metadata in future enhancements, included as per SDS.
  GOOGLE_API_SCOPES: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.readonly",
  ],

  // Settings for the retry mechanism for transient Google API errors.
  RETRY: {
    MAX_RETRIES: 3, // Maximum number of retries for a failed API call.
    INITIAL_BACKOFF_MS: 1000, // Initial delay before the first retry.
  },
};
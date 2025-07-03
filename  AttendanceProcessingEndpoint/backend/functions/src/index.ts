import * as functions from "firebase-functions";

// Initializes the Firebase Admin SDK. This import must run before any other
// code that uses the SDK. It's imported for its side effect.
import "./core/firebase";

import {handler as onAttendanceCreateHandler} from "./attendance/on-create";

/**
 * Cloud Function triggered when a new attendance document is created.
 * It enriches the new document with server-authoritative data like timestamps,
 * user hierarchy, and reverse-geocoded addresses.
 */
export const onAttendanceCreate = functions
  .runWith({
    // Optional: Configure runtime options like memory, timeout, etc.
    // memory: "256MB",
    // timeoutSeconds: 60,
  })
  .firestore.document("tenants/{tenantId}/attendance/{attendanceId}")
  .onCreate(onAttendanceCreateHandler);
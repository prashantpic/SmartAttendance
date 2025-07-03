import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import { ProvisionTenantRequest } from "./dtos/provision-tenant.dto";
import { AuthAdapter } from "./infrastructure/auth.adapter";
import { FirestoreRepository } from "./infrastructure/firestore.repository";
import { ProvisioningService } from "./application/provisioning.service";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Create singleton instances of core Firebase services
const db = admin.firestore();
const auth = admin.auth();

/**
 * @name provisionTenant
 * @description An onCall HTTPS Cloud Function that handles the initial
 * registration and provisioning of a new organization (tenant).
 * It is secure, idempotent, and atomic.
 *
 * This function orchestrates:
 * 1. Verifying the request with Firebase App Check.
 * 2. Validating the input payload.
 * 3. Ensuring no user exists with the provided admin email.
 * 4. Creating a new user in Firebase Authentication.
 * 5. Setting custom claims for role-based access control.
 * 6. Atomically creating all necessary Firestore documents in a batch.
 */
export const provisionTenant = functions
  .runWith({ enforceAppCheck: true }) // Enforce App Check for all requests
  .https.onCall(async (data, context) => {
    // 1. Basic Input Validation
    if (
      !data.organizationName ||
      !data.adminFullName ||
      !data.adminEmail ||
      !data.adminPassword
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Request payload is missing required fields.",
      );
    }

    const request = data as ProvisionTenantRequest;

    // 2. Instantiate dependencies (Adapters, Repositories, Services)
    const authAdapter = new AuthAdapter(auth);
    const firestoreRepo = new FirestoreRepository(db);
    const provisioningService = new ProvisioningService(
      authAdapter,
      firestoreRepo,
    );

    try {
      // 3. Delegate the core logic to the Provisioning Service
      const result = await provisioningService.provisionNewTenant(request);

      // 4. On success, return the new identifiers to the client
      functions.logger.info(`Successfully provisioned tenant ${result.tenantId}`);
      return {
        success: true,
        tenantId: result.tenantId,
        userId: result.userId,
      };
    } catch (error: unknown) {
      // 5. Error Handling
      if (error instanceof Error) {
        // Handle specific, known business logic errors
        if (error.message === "USER_EXISTS") {
          functions.logger.warn(
            `Attempt to provision tenant with existing email: ${request.adminEmail}`,
          );
          throw new functions.https.HttpsError(
            "already-exists",
            "A user with this email address already exists.",
          );
        }
      }

      // Handle all other unexpected errors
      functions.logger.error(
        "An unexpected error occurred while provisioning a tenant:",
        error,
      );
      throw new functions.https.HttpsError(
        "internal",
        "An unexpected error occurred while provisioning the tenant.",
      );
    }
  });
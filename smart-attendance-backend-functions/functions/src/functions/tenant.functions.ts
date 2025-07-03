import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/v1/https";
import { TenantService } from "../services/tenant.service";

/**
 * Defines and exports the HTTP-triggered Cloud Function responsible for
 * new tenant onboarding.
 */

/**
 * A callable HTTPS function to provision a new tenant.
 * It expects organization and admin details in the request data.
 * This endpoint should be protected and only called from the public registration page.
 */
export const onboardNewTenant = functions.https.onCall(async (data, context) => {
  // Although we are using a callable function, which provides some security,
  // we should still validate the input data schema on the server.
  const { orgName, adminName, email, password } = data;

  if (
    !orgName || typeof orgName !== "string" ||
    !adminName || typeof adminName !== "string" ||
    !email || typeof email !== "string" ||
    !password || typeof password !== "string"
  ) {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with 'orgName', 'adminName', 'email', and 'password' arguments."
    );
  }

  try {
    functions.logger.info(`Attempting to onboard new tenant: ${orgName}`);

    const result = await TenantService.provisionNewTenant(
      orgName,
      adminName,
      email,
      password
    );

    functions.logger.info(`Successfully onboarded tenant ${result.tenantId} with admin user ${result.userId}.`);
    return result;
  } catch (error) {
    if (error instanceof HttpsError) {
      // Re-throw HttpsError exceptions from the service layer directly to the client.
      throw error;
    }
    // For any other unexpected errors, log them and throw a generic internal error.
    functions.logger.error("An unexpected error occurred during tenant onboarding:", error);
    throw new HttpsError("internal", "An internal error occurred. Please try again later.");
  }
});
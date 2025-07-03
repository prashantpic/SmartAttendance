import { AuthAdapter } from "../infrastructure/auth.adapter";
import { FirestoreRepository } from "../infrastructure/firestore.repository";
import { ProvisionTenantRequest } from "../dtos/provision-tenant.dto";

/**
 * @class ProvisioningService
 * @description Encapsulates and orchestrates the core business logic of the
 * tenant provisioning workflow. It coordinates between the authentication
 * and database layers to ensure a consistent and idempotent process.
 */
export class ProvisioningService {
  /**
   * @param authAdapter Adapter for Firebase Authentication operations.
   * @param firestoreRepo Repository for Firestore database operations.
   */
  constructor(
    private readonly authAdapter: AuthAdapter,
    private readonly firestoreRepo: FirestoreRepository,
  ) {}

  /**
   * Orchestrates the entire process of provisioning a new tenant.
   *
   * @param request The DTO containing the new tenant's information.
   * @returns A promise that resolves with the new tenant and user IDs.
   * @throws An error with message 'USER_EXISTS' if the admin email is already in use.
   */
  public async provisionNewTenant(
    request: ProvisionTenantRequest,
  ): Promise<{ tenantId: string; userId: string }> {
    // 1. Idempotency Check: Ensure the admin email is unique across all tenants.
    const userExists = await this.firestoreRepo.doesUserExistInAnyTenant(
      request.adminEmail,
    );
    if (userExists) {
      throw new Error("USER_EXISTS");
    }

    // 2. Generate a new unique ID for the tenant.
    const tenantId = this.firestoreRepo.generateTenantId();

    // 3. Create the user in Firebase Authentication.
    const authUser = await this.authAdapter.createAuthUser(
      request.adminEmail,
      request.adminPassword,
      request.adminFullName,
    );

    // 4. Set custom claims on the new auth user for security rules.
    await this.authAdapter.setAdminClaims(authUser.uid, tenantId);

    // 5. Create all Firestore documents in a single atomic transaction.
    await this.firestoreRepo.provisionNewTenantInBatch({
      tenantId,
      organizationName: request.organizationName,
      userId: authUser.uid,
      adminFullName: request.adminFullName,
      adminEmail: request.adminEmail,
    });

    // 6. Return the newly created identifiers.
    return { tenantId, userId: authUser.uid };
  }
}
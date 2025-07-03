/**
 * @fileoverview Defines the Data Transfer Object (DTO) for the tenant
 * provisioning request.
 * This interface establishes a strict data contract for the information
 * required to create a new organization and its initial administrator.
 */

/**
 * Represents the payload required to provision a new tenant.
 * The properties are readonly to promote immutability.
 */
export interface ProvisionTenantRequest {
  /**
   * The legal or display name of the new organization.
   */
  readonly organizationName: string;

  /**
   * The full name of the initial administrator user.
   */
  readonly adminFullName: string;

  /**
   * The email address for the initial administrator. This will be their
   * login username and must be unique across the entire system.
   */
  readonly adminEmail: string;

  /**
   * The password for the initial administrator's account.
   */
  readonly adminPassword: string;
}
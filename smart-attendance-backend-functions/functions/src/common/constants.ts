import { UserRole, UserStatus } from "../domain/models";

/**
 * A centralized module for storing application-wide constants.
 * This approach avoids "magic strings" in the codebase, making it more
 * readable, maintainable, and less prone to typos.
 */

/**
 * Defines the names of the Firestore collections used throughout the application.
 * Using this constant object ensures consistency when querying the database.
 */
export const FIRESTORE_COLLECTIONS = Object.freeze({
  TENANTS: "tenants",
  USERS: "users",
  ATTENDANCE: "attendance",
  CONFIG: "config",
  EVENTS: "events",
  LINKED_SHEETS: "linkedSheets",
  AUDIT_LOGS: "auditLogs",
});

/**
 * Defines the possible roles a user can have within the system.
 * This is typed against the UserRole type for compile-time safety.
 */
export const USER_ROLES: { [key: string]: UserRole } = Object.freeze({
  ADMIN: "Admin",
  SUPERVISOR: "Supervisor",
  SUBORDINATE: "Subordinate",
});

/**
 * Defines the possible statuses of a user account.
 * This is typed against the UserStatus type for compile-time safety.
 */
export const USER_STATUSES: { [key: string]: UserStatus } = Object.freeze({
  ACTIVE: "Active",
  INVITED: "Invited",
  DEACTIVATED: "Deactivated",
});

/**
 * Defines the possible statuses of an attendance record.
 */
export const ATTENDANCE_STATUSES = Object.freeze({
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
});

/**
 * Default configuration values for a new tenant.
 */
export const DEFAULT_TENANT_CONFIG = Object.freeze({
  DATA_RETENTION_DAYS: 365,
  APPROVAL_LEVELS: 1,
  TIMEZONE: "UTC",
});
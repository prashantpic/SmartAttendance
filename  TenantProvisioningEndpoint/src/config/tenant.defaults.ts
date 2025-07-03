/**
 * @fileoverview Centralizes default values for new tenant configurations.
 * This ensures that all new organizations start with a standard,
 * consistent baseline for key operational parameters.
 */

/**
 * Default number of days to retain active attendance records before they are
 * considered for archival.
 */
export const DEFAULT_DATA_RETENTION_DAYS = 365;

/**
 * Default number of supervisory approval levels required for a new attendance
 * record to be considered fully approved.
 */
export const DEFAULT_APPROVAL_LEVELS = 1;
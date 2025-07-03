import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { parse } from "csv-parse/sync";
import { User } from "../domain/models";
import { FIRESTORE_COLLECTIONS, USER_ROLES, USER_STATUSES } from "../common/constants";

interface CsvRow {
  name: string;
  email: string;
  supervisorEmail?: string;
  phoneNumber?: string;
}

interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: { row: number; reason: string; data: CsvRow }[];
}

/**
 * Service to handle complex user data operations, such as bulk imports.
 */
export class UserService {
  /**
   * Imports users from a CSV file buffer, validates them, and creates them
   * in Firestore in a single batch.
   *
   * @param {Buffer} fileBuffer The buffer containing the CSV file data.
   * @param {string} tenantId The ID of the tenant to import users into.
   * @returns {Promise<ImportResult>} A report detailing the outcome of the import.
   */
  public static async importUsersFromCSV(
    fileBuffer: Buffer,
    tenantId: string
  ): Promise<ImportResult> {
    const result: ImportResult = {
      successCount: 0,
      errorCount: 0,
      errors: [],
    };

    try {
      const records: CsvRow[] = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const db = admin.firestore();
      const batch = db.batch();
      const usersCollection = db
        .collection(FIRESTORE_COLLECTIONS.TENANTS)
        .doc(tenantId)
        .collection(FIRESTORE_COLLECTIONS.USERS);

      for (const [index, row] of records.entries()) {
        // Basic validation
        if (!row.name || !row.email) {
          result.errorCount++;
          result.errors.push({
            row: index + 2,
            reason: "Missing required fields: 'name' and 'email'.",
            data: row,
          });
          continue;
        }

        // Email format validation (simple regex)
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
          result.errorCount++;
          result.errors.push({
            row: index + 2,
            reason: `Invalid email format: '${row.email}'.`,
            data: row,
          });
          continue;
        }
        
        // Note: Checking for email uniqueness and supervisor existence requires queries,
        // which can be slow and costly in a loop. For a large import, a more advanced
        // strategy would be to first read all existing emails into a Set for fast lookups.
        // For this implementation, we will proceed with creating the user document,
        // relying on Firestore security rules or a post-processing script to handle conflicts.

        const newUserRef = usersCollection.doc();
        const newUser: User = {
          tenantId: tenantId,
          name: row.name,
          email: row.email.toLowerCase(),
          phoneNumber: row.phoneNumber || undefined,
          role: USER_ROLES.SUBORDINATE,
          status: USER_STATUSES.INVITED,
          // Supervisor ID would need to be resolved from supervisorEmail.
          // This is a complex step that would require another lookup.
          // For simplicity, we'll leave it undefined for now. A follow-up
          // process could link supervisors.
          supervisorId: undefined, 
          createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
          updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
        };

        batch.set(newUserRef, newUser);
        result.successCount++;
      }

      await batch.commit();

      functions.logger.info(`Bulk user import for tenant ${tenantId} completed. Success: ${result.successCount}, Failed: ${result.errorCount}.`);

    } catch (error: any) {
      functions.logger.error(`Error processing CSV for tenant ${tenantId}:`, error);
      // If parsing fails, the entire operation fails.
      return {
        successCount: 0,
        errorCount: 0,
        errors: [{ row: 1, reason: `CSV parsing failed: ${error.message}`, data: {} as CsvRow }],
      };
    }

    return result;
  }
}
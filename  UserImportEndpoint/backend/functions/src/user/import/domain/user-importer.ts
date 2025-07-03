import { CsvRecordDto } from "../interfaces/csv-record.dto";
import { UserPayloadDto } from "../interfaces/user-payload.dto";
import { ValidationReport, ValidationError } from "../interfaces/validation-report.dto";

// A simplified User interface representing an existing user from Firestore.
// Only fields relevant to the import logic are included.
interface User {
    userId: string;
    email: string;
    name: string;
}

/**
 * Contains the pure, stateless business logic for validating a batch of user records.
 * It is completely independent of Firebase or other infrastructure concerns, making it highly testable.
 * @summary The heart of the import logic, applying business rules to raw records.
 */
export class UserImporter {

  /**
   * Validates CSV records against business rules and prepares valid records for persistence.
   * @param csvRecords The array of records parsed from the CSV file.
   * @param existingUsers An array of all existing users for the tenant.
   * @param tenantId The ID of the tenant.
   * @returns An object containing an array of valid user payloads and a detailed validation report.
   */
  public validateAndPrepareUsers(
    csvRecords: CsvRecordDto[],
    existingUsers: User[],
    tenantId: string
  ): { validUsers: Omit<UserPayloadDto, 'createdAt' | 'updatedAt'>[], report: ValidationReport } {
    
    // 1. Initialization
    const report: ValidationReport = {
      summary: {
        totalRecords: csvRecords.length,
        successful: 0,
        failed: 0,
      },
      errors: [],
    };
    const validUsersToCreate: Omit<UserPayloadDto, 'createdAt' | 'updatedAt'>[] = [];
    
    const existingUserEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));
    const existingUserMap = new Map(existingUsers.map(u => [u.email.toLowerCase(), u]));
    const emailsInThisBatch = new Set<string>();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 2. Validation Loop
    for (const record of csvRecords) {
      const recordErrors: string[] = [];
      const normalizedEmail = record.email ? record.email.trim().toLowerCase() : "";
      const normalizedSupervisorEmail = record.supervisorEmail ? record.supervisorEmail.trim().toLowerCase() : "";

      // Validate Name
      if (!record.name || record.name.trim() === "") {
        recordErrors.push("Name is required.");
      }

      // Validate Email
      if (!normalizedEmail) {
        recordErrors.push("Email is required.");
      } else if (!emailRegex.test(normalizedEmail)) {
        recordErrors.push("Invalid email format.");
      } else {
        // Check for Duplicates
        if (existingUserEmails.has(normalizedEmail)) {
          recordErrors.push("Email already exists in the system.");
        }
        if (emailsInThisBatch.has(normalizedEmail)) {
          recordErrors.push("Email is duplicated in the CSV file.");
        }
      }

      // Validate Supervisor (must be an existing user)
      if (normalizedSupervisorEmail) {
        if (!existingUserEmails.has(normalizedSupervisorEmail)) {
            recordErrors.push(`Supervisor with email '${record.supervisorEmail}' does not exist.`);
        }
        if (normalizedSupervisorEmail === normalizedEmail) {
            recordErrors.push("User cannot be their own supervisor.");
        }
      }

      // 3. Process Results
      if (recordErrors.length > 0) {
        report.summary.failed++;
        report.errors.push({
          record,
          reason: recordErrors.join(" "),
        });
      } else {
        report.summary.successful++;
        emailsInThisBatch.add(normalizedEmail);

        // Resolve Supervisor ID
        const supervisor = normalizedSupervisorEmail ? existingUserMap.get(normalizedSupervisorEmail) : null;
        const supervisorId = supervisor ? supervisor.userId : null;

        // Create Payload
        validUsersToCreate.push({
          name: record.name.trim(),
          email: normalizedEmail,
          supervisorId: supervisorId,
          tenantId: tenantId,
          status: 'Invited',
          role: 'Subordinate',
          subordinateIds: [],
          fcmToken: null,
          lastLoginTimestamp: null,
        });
      }
    }

    // 4. Finalization
    return { validUsers: validUsersToCreate, report };
  }
}
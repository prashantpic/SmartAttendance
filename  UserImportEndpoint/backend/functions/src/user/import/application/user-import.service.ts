import * as functions from "firebase-functions";
import { UserImporter } from "../domain/user-importer";
import { CsvParserService } from "../infrastructure/csv-parser.service";
import { FirestoreRepository } from "../infrastructure/firestore.repository";
import { StorageService } from "../infrastructure/storage.service";

/**
 * The application service layer that coordinates the user import use case.
 * It orchestrates the flow of data between infrastructure services (parsing, storage)
 * and the core domain logic.
 * @summary Acts as the central coordinator for the user import feature.
 */
export class UserImportService {
  /**
   * @param storageService Adapter for Cloud Storage operations.
   * @param csvParserService Service to parse CSV streams.
   * @param userRepository Repository for Firestore user data access.
   * @param userImporter Domain service for validation and business logic.
   */
  constructor(
    private readonly storageService: StorageService,
    private readonly csvParserService: CsvParserService,
    private readonly userRepository: FirestoreRepository,
    private readonly userImporter: UserImporter
  ) {}

  /**
   * Orchestrates the entire user import process.
   * @param filePath The full path to the uploaded CSV file in Cloud Storage.
   * @param tenantId The ID of the tenant for whom the users are being imported.
   */
  public async processImport(filePath: string, tenantId: string): Promise<void> {
    functions.logger.info(`[UserImportService] Starting import for tenant ${tenantId} from ${filePath}`);

    // 1. Get File
    const stream = this.storageService.getFileStream(filePath);

    // 2. Parse CSV
    const csvRecords = await this.csvParserService.parseCsvStream(stream);
    functions.logger.info(`[UserImportService] Parsed ${csvRecords.length} records from CSV.`);

    // 3. Fetch Existing Users
    const existingUsers = await this.userRepository.getAllUsersByTenant(tenantId);
    functions.logger.info(`[UserImportService] Fetched ${existingUsers.length} existing users for validation.`);

    // 4. Process and Validate
    const { validUsers, report } = this.userImporter.validateAndPrepareUsers(
      csvRecords,
      existingUsers,
      tenantId
    );
    functions.logger.info(`[UserImportService] Validation complete. Successful: ${report.summary.successful}, Failed: ${report.summary.failed}.`);


    // 5. Persist Users
    if (validUsers.length > 0) {
      await this.userRepository.batchCreateUsers(validUsers, tenantId);
      functions.logger.info(`[UserImportService] Successfully created ${validUsers.length} new users in Firestore.`);
    } else {
        functions.logger.info(`[UserImportService] No valid users to create.`);
    }

    // 6. Upload Report
    await this.storageService.uploadReport(report, filePath);
    functions.logger.info(`[UserImportService] Uploaded validation report for ${filePath}.`);

    functions.logger.info(`[UserImportService] Import process finished for tenant ${tenantId}.`);
  }
}
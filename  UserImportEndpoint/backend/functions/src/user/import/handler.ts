import * as functions from "firebase-functions";
import { ObjectMetadata } from "firebase-functions/v1/storage";
import { UserImportService } from "./application/user-import.service";
import { StorageService } from "./infrastructure/storage.service";
import { CsvParserService } from "./infrastructure/csv-parser.service";
import { FirestoreRepository } from "./infrastructure/firestore.repository";
import { UserImporter } from "./domain/user-importer";
import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin SDK if not already initialized
if (!process.env.FUNCTION_NAME) {
  initializeApp();
}

/**
 * Cloud Function entry point triggered by a CSV file upload to Cloud Storage.
 * It orchestrates the entire user import process.
 * @summary Receives a Firebase Storage event upon CSV file upload.
 */
export const onUserCsvUpload = functions.storage
  .object()
  .onFinalize(async (object: ObjectMetadata) => {
    const { name: filePath, contentType } = object;

    // 1. Validate file path and content type
    if (!filePath) {
      functions.logger.error("File path is undefined. Exiting function.", { object });
      return;
    }

    if (contentType !== "text/csv") {
      functions.logger.warn(`File is not a CSV. Content-Type: ${contentType}. Path: ${filePath}.`, { filePath, contentType });
      return;
    }
    
    const pathRegex = /^tenants\/([^/]+)\/uploads\/users\/(?!.*-report\.json$).+\.csv$/;
    const match = filePath.match(pathRegex);

    if (!match) {
      functions.logger.log(`File path ${filePath} does not match the target pattern for user imports. Ignoring.`, { filePath });
      return;
    }
    
    // 2. Extract tenantId
    const tenantId = match[1];
    if (!tenantId) {
        functions.logger.error("Could not extract tenantId from file path.", { filePath });
        return;
    }

    functions.logger.info(`Starting user import for tenant: ${tenantId} from file: ${filePath}`);

    // 3. Instantiate services
    const storageService = new StorageService();
    const csvParserService = new CsvParserService();
    const firestoreRepository = new FirestoreRepository();
    const userImporter = new UserImporter();
    const userImportService = new UserImportService(
      storageService,
      csvParserService,
      firestoreRepository,
      userImporter
    );

    // 4. Invoke the application service and handle errors
    try {
      await userImportService.processImport(filePath, tenantId);
      functions.logger.info(`Successfully processed user import for tenant: ${tenantId}, file: ${filePath}`);
    } catch (error) {
      functions.logger.error("Unhandled exception during user import process.", {
        tenantId,
        filePath,
        error,
      });
    }
  });
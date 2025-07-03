import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { UserService } from "../services/user.service";

/**
 * Defines and exports the Cloud Storage-triggered function for processing bulk user imports.
 */

const IMPORT_PATH_REGEX = /^uploads\/([^/]+)\/user-imports\/(.+\.csv)$/;

/**
 * Triggered when a new file is finalized in Cloud Storage.
 * It specifically handles CSV files uploaded for bulk user import.
 */
export const onUserCSVUploaded = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const contentType = object.contentType;

  if (!filePath) {
    functions.logger.warn("File path is undefined. Exiting function.");
    return;
  }

  // 1. Validate file path and type
  const pathMatch = filePath.match(IMPORT_PATH_REGEX);
  if (!pathMatch || contentType !== "text/csv") {
    functions.logger.log(`File ${filePath} is not a valid user import CSV. Skipping.`);
    return;
  }

  const [, tenantId, fileName] = pathMatch;
  functions.logger.info(`Processing user import file '${fileName}' for tenant '${tenantId}'.`);

  // 2. Download the file content
  const bucket = admin.storage().bucket(object.bucket);
  const file = bucket.file(filePath);

  try {
    const [fileBuffer] = await file.download();

    // 3. Call the user service to process the import
    const result = await UserService.importUsersFromCSV(fileBuffer, tenantId);

    // 4. (Optional) Post-processing: Send a report or move the processed file
    functions.logger.info(`Import for ${fileName} completed. Success: ${result.successCount}, Errors: ${result.errorCount}.`);

    // You could write a report file back to storage:
    const reportContent = JSON.stringify(result, null, 2);
    const reportFileName = `reports/${tenantId}/user-imports/${fileName.replace('.csv', '')}-report.json`;
    await bucket.file(reportFileName).save(reportContent, { contentType: 'application/json' });

    // Move the original file to a 'processed' folder to prevent re-triggering
    await file.move(`processed/${tenantId}/user-imports/${fileName}`);
    functions.logger.info(`Moved processed file to processed folder.`);

  } catch (error) {
    functions.logger.error(`Failed to process user import file ${filePath}:`, error);
    // Move the file to an 'errors' folder for manual inspection
    await file.move(`errors/${tenantId}/user-imports/${fileName}`).catch(moveError => {
        functions.logger.error(`Failed to move error file ${filePath}:`, moveError);
    });
  }
});
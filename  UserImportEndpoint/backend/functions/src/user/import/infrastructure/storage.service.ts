import { getStorage, Storage } from "firebase-admin/storage";
import { Readable } from "stream";
import { ValidationReport } from "../interfaces/validation-report.dto";
import * as path from "path";

/**
 * An adapter for interacting with Firebase Cloud Storage. It handles downloading
 * the uploaded CSV and uploading the generated validation report.
 * @summary Manages file I/O with Cloud Storage.
 */
export class StorageService {
  private storage: Storage;

  constructor() {
    this.storage = getStorage();
  }

  /**
   * Gets a readable stream for a file in the default Cloud Storage bucket.
   * @param filePath The full path to the file.
   * @returns A readable stream of the file content.
   */
  public getFileStream(filePath: string): Readable {
    const bucket = this.storage.bucket();
    const file = bucket.file(filePath);
    return file.createReadStream();
  }

  /**
   * Uploads the validation report to Cloud Storage.
   * @param report The validation report object.
   * @param originalFilePath The path of the CSV file that was processed.
   * @returns A promise that resolves when the upload is complete.
   */
  public async uploadReport(report: ValidationReport, originalFilePath: string): Promise<void> {
    const reportJson = JSON.stringify(report, null, 2);

    const originalFilename = path.basename(originalFilePath);
    const reportFilename = `${originalFilename}-report.json`;

    // Construct path like: /tenants/{tenantId}/uploads/reports/users/{filename}-report.json
    const originalDir = path.dirname(originalFilePath);
    const reportPath = originalDir
      .replace("/uploads/users", "/uploads/reports/users") + "/" + reportFilename;

    const bucket = this.storage.bucket();
    const file = bucket.file(reportPath);

    await file.save(reportJson, {
      metadata: {
        contentType: "application/json",
      },
    });
  }
}
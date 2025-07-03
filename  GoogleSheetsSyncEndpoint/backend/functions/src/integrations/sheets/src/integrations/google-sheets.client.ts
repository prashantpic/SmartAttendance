import { google, sheets_v4 } from "googleapis";
import { config } from "../config";
import * as functions from "firebase-functions";

export class GoogleSheetsClient {
  private sheets: sheets_v4.Sheets;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      scopes: config.GOOGLE_API_SCOPES,
    });
    this.sheets = google.sheets({ version: "v4", auth });
  }

  /**
   * A private helper to wrap Google API calls with an exponential backoff retry mechanism.
   */
  private async _withRetry<T>(apiCall: () => Promise<T>): Promise<T> {
    let lastError: any;
    for (let i = 0; i < config.RETRY.MAX_RETRIES; i++) {
      try {
        return await apiCall();
      } catch (error: any) {
        lastError = error;
        // Check for terminal errors that should not be retried (e.g., permissions).
        if (error.code === 403 || error.code === 404) {
          functions.logger.error("Terminal Google API error, not retrying.", { error });
          throw error;
        }
        // Check for transient errors to retry (e.g., rate limits, server errors).
        if (error.code === 429 || (error.code >= 500 && error.code < 600)) {
          const backoff = config.RETRY.INITIAL_BACKOFF_MS * Math.pow(2, i);
          functions.logger.warn(`Transient Google API error, retrying in ${backoff}ms...`, { attempt: i + 1, error });
          await new Promise((resolve) => setTimeout(resolve, backoff));
        } else {
          // For other unexpected errors, fail immediately.
          throw error;
        }
      }
    }
    // If all retries fail, throw the last captured error.
    throw new Error(`Google API call failed after ${config.RETRY.MAX_RETRIES} retries: ${lastError.message}`);
  }

  /**
   * Fetches the header row (first row) from the specified sheet.
   * @param {string} fileId - The ID of the Google Sheet.
   * @returns {Promise<string[]>} A promise that resolves to an array of header strings.
   */
  async getSheetHeaders(fileId: string): Promise<string[]> {
    return this._withRetry(async () => {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: fileId,
        range: "A1:Z1", // Assuming headers are within the first 26 columns.
      });

      const headers = response.data.values?.[0];
      if (!headers || headers.length === 0) {
        throw new Error(`No headers found in sheet with fileId: ${fileId}. The sheet might be empty or misconfigured.`);
      }
      return headers as string[];
    });
  }

  /**
   * Appends new rows of data to the specified sheet.
   * @param {string} fileId - The ID of the Google Sheet.
   * @param {any[][]} rows - A 2D array of data to append.
   */
  async appendRows(fileId: string, rows: any[][]): Promise<void> {
    if (rows.length === 0) {
      return;
    }
    
    await this._withRetry(async () => {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: fileId,
        range: "A1", // Append after the last row of the first sheet.
        valueInputOption: "USER_ENTERED", // Allows Sheets to parse dates, numbers, etc.
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: rows,
        },
      });
    });
  }
}
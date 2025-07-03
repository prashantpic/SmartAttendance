import { CsvRecordDto } from "./csv-record.dto";

/**
 * Represents a single validation failure, containing the problematic
 * record and a human-readable reason for the failure.
 */
export interface ValidationError {
    /** The original CSV record that failed validation. */
    record: CsvRecordDto;
    /** A descriptive string explaining why the validation failed. */
    reason: string;
}

/**
 * Defines the structure for the validation report that is generated
 * after the import process. It provides a consistent structure for the JSON file
 * saved to Cloud Storage for the Admin.
 * @summary Represents the final output report detailing the successful and failed records.
 */
export interface ValidationReport {
    /** A summary of the import results. */
    summary: {
        totalRecords: number;
        successful: number;
        failed: number;
    };
    /** An array of all validation errors encountered during the import. */
    errors: ValidationError[];
}
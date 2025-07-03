/**
 * Defines the data transfer object (DTO) for a single, parsed record
 * from the uploaded CSV file. It provides a typed interface for CSV records,
 * ensuring data consistency.
 * @summary Represents the data structure of one row in the user import CSV file.
 */
export interface CsvRecordDto {
    /** The full name of the user. */
    name: string;

    /** The email address of the user. */
    email: string;

    /** The email address of the user's supervisor. Can be an empty string. */
    supervisorEmail: string;
}
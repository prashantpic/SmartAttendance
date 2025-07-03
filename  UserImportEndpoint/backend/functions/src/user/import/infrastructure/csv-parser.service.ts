import { Readable } from "stream";
import { parse } from "csv-parse";
import { CsvRecordDto } from "../interfaces/csv-record.dto";

/**
 * A service that wraps the 'csv-parse' library to provide a simple,
 * promise-based interface for parsing a CSV stream into an array of structured objects.
 * @summary Transforms a raw CSV file stream into a structured array of DTOs.
 */
export class CsvParserService {
  /**
   * Parses a CSV stream into an array of CsvRecordDto objects.
   * @param stream A readable stream of the CSV file content.
   * @returns A promise that resolves to an array of parsed records.
   */
  public parseCsvStream(stream: Readable): Promise<CsvRecordDto[]> {
    return new Promise((resolve, reject) => {
      const records: CsvRecordDto[] = [];

      const parser = parse({
        columns: true,          // Treat the first line as headers
        skip_empty_lines: true, // Ignore empty lines
        trim: true,             // Trim whitespace from values
        cast: true,             // Attempt to cast values to native types
      });

      stream.pipe(parser);

      parser.on("data", (record: CsvRecordDto) => {
        records.push(record);
      });

      parser.on("end", () => {
        resolve(records);
      });

      parser.on("error", (error) => {
        reject(error);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    });
  }
}
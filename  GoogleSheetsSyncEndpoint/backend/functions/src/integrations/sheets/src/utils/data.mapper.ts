import { AttendanceRecord } from "../models/domain.model";

/**
 * Maps an array of AttendanceRecord objects to a 2D array suitable for the Google Sheets API.
 * The order of columns in the output array is determined by the 'headers' parameter,
 * making the function resilient to column reordering in the target sheet.
 *
 * @param {AttendanceRecord[]} records - The array of Firestore attendance records.
 * @param {string[]} headers - The array of header strings from the Google Sheet.
 * @returns {any[][]} A 2D array of values ready for insertion.
 */
export function mapAttendanceToSheetRows(
  records: AttendanceRecord[],
  headers: string[]
): any[][] {
  // Normalize headers from the sheet to be lowercase and trimmed for robust matching.
  const lowerCaseHeaders = headers.map((h) => (h || "").toLowerCase().trim());

  // A map where keys are normalized header names and values are functions
  // that extract the corresponding data from an AttendanceRecord.
  const valueExtractorMap: { [key: string]: (rec: AttendanceRecord) => any } = {
    userid: (rec) => rec.userId,
    username: (rec) => rec.userName,
    eventid: (rec) => rec.eventId || "",
    checkintime: (rec) => rec.clientCheckInTimestamp.toDate(),
    checkouttime: (rec) => rec.clientCheckOutTimestamp?.toDate() || "",
    checkinaddress: (rec) => rec.checkInAddress || "",
    checkoutaddress: (rec) => rec.checkOutAddress || "",
    status: (rec) => rec.status,
    serversynctimestamp: (rec) => rec.serverSyncTimestamp.toDate(),
    approverid: (rec) => rec.approvalDetails?.approverId || "",
    approvaltimestamp: (rec) => rec.approvalDetails?.timestamp.toDate() || "",
    approvalcomments: (rec) => rec.approvalDetails?.comments || "",
  };

  return records.map((record) => {
    // For each record, create a row array by mapping over the headers.
    return lowerCaseHeaders.map((header) => {
      // Find the corresponding data extractor for the current header.
      const extractor = valueExtractorMap[header];
      // If an extractor exists, use it; otherwise, return a blank string.
      return extractor ? extractor(record) : "";
    });
  });
}
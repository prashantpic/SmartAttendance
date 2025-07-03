/**
 * @file A utility module to format an array of JavaScript objects into a
 * Newline Delimited JSON (NDJSON) string.
 * @namespace jobs.scheduled.dataArchival.utils
 */

/**
 * Converts an array of JavaScript objects into a single NDJSON-formatted string.
 * Each object is stringified and separated by a newline character.
 *
 * @param {any[]} records - The array of objects to convert.
 * @returns {string} The NDJSON formatted string. Returns an empty string
 * if the input array is null or empty.
 */
export function toNdjson(records: any[]): string {
  if (!records || records.length === 0) {
    return '';
  }

  return records.map(record => JSON.stringify(record)).join('\n');
}
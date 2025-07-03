/**
 * @file Contains static configuration and environment-specific settings for
 * the data archival function. This externalizes tunable parameters from the
 * core logic for easy adjustments without code changes.
 * @namespace jobs.scheduled.dataArchival.config
 */

/**
 * The CRON expression that defines the schedule for the archival job.
 * Default is "0 2 * * *", which triggers the function daily at 2:00 AM UTC.
 * @see https://crontab.guru/ for help building CRON expressions.
 */
export const SCHEDULE_CRON_EXPRESSION = '0 2 * * *';

/**
 * The number of records to fetch and process in a single batch.
 * This value helps manage memory usage and avoids hitting Firestore's
 * batch write limits (which is 500 operations). A value of 400 provides a
 * safe margin.
 */
export const ARCHIVE_BATCH_SIZE = 400;
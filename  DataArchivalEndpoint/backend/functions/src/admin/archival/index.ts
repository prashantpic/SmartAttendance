/**
 * @file The entry point for the DataArchivalEndpoint Cloud Function. This file
 * defines the scheduled trigger and wires up the dependencies needed to run
 * the archival service.
 * @namespace jobs.scheduled.dataArchival
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';

import {SCHEDULE_CRON_EXPRESSION} from './config/archival.config';
import {FirestoreRepository} from './infrastructure/firestore.repository';
import {StorageRepository} from './infrastructure/storage.repository';
import {ArchivalService} from './application/archival.service';

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * The scheduled Cloud Function that triggers the data archival and purging process.
 * It is configured with a CRON expression and a specific timezone.
 */
export const scheduledDataArchival = functions.pubsub
  .schedule(SCHEDULE_CRON_EXPRESSION)
  .timeZone('UTC')
  .onRun(async context => {
    logger.info(
      `Data Archival Job Started. Triggered by event: ${context.eventId}`
    );

    try {
      // 1. Instantiate Repositories
      const firestoreRepo = new FirestoreRepository(admin.firestore());
      const storageRepo = new StorageRepository(admin.storage());

      // 2. Instantiate the Application Service with dependencies
      const archivalService = new ArchivalService(firestoreRepo, storageRepo);

      // 3. Execute the core business logic
      await archivalService.executeArchivalProcess();

      logger.info('Data Archival Job Finished Successfully.');
    } catch (error) {
      logger.error('Fatal error during archival job execution:', error);
      // Firebase will automatically report the function execution as an error.
    }
  });
/**
 * @file The core application service that contains the business logic for the
 * data archival process. It orchestrates the flow of fetching, formatting,
 * archiving, and purging data by coordinating the infrastructure repositories.
 * @namespace jobs.scheduled.dataArchival.application
 */

import * as logger from 'firebase-functions/logger';
import {DocumentSnapshot, DocumentReference} from 'firebase-admin/firestore';
import {FirestoreRepository} from '../infrastructure/firestore.repository';
import {StorageRepository} from '../infrastructure/storage.repository';
import {Tenant, AttendanceRecord} from '../domain/models';
import {toNdjson} from '../utils/ndjson.formatter';
import {ARCHIVE_BATCH_SIZE} from '../config/archival.config';

/**
 * @class ArchivalService
 * @description Orchestrates the entire data archival workflow, acting as the
 * brain of the function. It uses the Firestore and Storage repositories to
 * perform its tasks.
 */
export class ArchivalService {
  private readonly firestoreRepo: FirestoreRepository;
  private readonly storageRepo: StorageRepository;

  /**
   * Initializes the service with its dependencies.
   * @param {FirestoreRepository} firestoreRepo - The repository for Firestore operations.
   * @param {StorageRepository} storageRepo - The repository for Storage operations.
   */
  constructor(
    firestoreRepo: FirestoreRepository,
    storageRepo: StorageRepository
  ) {
    this.firestoreRepo = firestoreRepo;
    this.storageRepo = storageRepo;
  }

  /**
   * The main execution method for the archival job. It fetches all tenants and
   * processes them concurrently but independently.
   * A failure in one tenant's archival process will not stop others.
   * @returns {Promise<void>} A promise that resolves when all tenants have been processed.
   */
  public async executeArchivalProcess(): Promise<void> {
    logger.info('Starting archival process for all tenants...');

    const tenants = await this.firestoreRepo.getActiveTenants();
    if (tenants.length === 0) {
      logger.info('No active tenants found. Archival job finished.');
      return;
    }

    logger.info(`Found ${tenants.length} tenants to process.`);

    const results = await Promise.allSettled(
      tenants.map(tenant => this.processTenant(tenant))
    );

    results.forEach((result, index) => {
      const tenantId = tenants[index].tenantId;
      if (result.status === 'fulfilled') {
        logger.info(`Successfully finished processing for tenant: ${tenantId}`);
      } else {
        logger.error(
          `Failed to process tenant: ${tenantId}. Reason:`,
          result.reason
        );
      }
    });

    logger.info('Overall archival job has completed.');
  }

  /**
   * Processes a single tenant's data for archival and purging.
   * @param {Tenant} tenant - The tenant to process.
   * @returns {Promise<void>} A promise that resolves on completion or rejects on failure.
   * @private
   */
  private async processTenant(tenant: Tenant): Promise<void> {
    logger.info(`[${tenant.tenantId}] Starting processing.`);

    // Step 1: Get Configuration & Calculate Cutoff
    const config = await this.firestoreRepo.getTenantConfiguration(
      tenant.tenantId
    );
    if (!config?.dataRetentionDays || config.dataRetentionDays <= 0) {
      logger.warn(
        `[${tenant.tenantId}] No valid dataRetentionDays configured. Skipping.`
      );
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.dataRetentionDays);
    logger.info(
      `[${tenant.tenantId}] Data retention set to ${config.dataRetentionDays} days. Archiving records older than ${cutoffDate.toISOString()}.`
    );

    // Step 2: Paginate and Process Batches
    let lastVisible: DocumentSnapshot | undefined = undefined;
    let batchNumber = 0;
    let keepProcessing = true;

    do {
      batchNumber++;
      const querySnapshot = await this.firestoreRepo.getArchivableAttendance(
        tenant.tenantId,
        cutoffDate,
        ARCHIVE_BATCH_SIZE,
        lastVisible
      );

      if (querySnapshot.empty) {
        logger.info(`[${tenant.tenantId}] No more records to archive.`);
        keepProcessing = false;
        continue;
      }

      lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      const recordsToArchive = querySnapshot.docs.map(doc => ({
        attendanceId: doc.id,
        ...doc.data(),
      })) as AttendanceRecord[];
      const recordRefs = querySnapshot.docs.map(
        doc => doc.ref
      ) as DocumentReference[];

      logger.info(
        `[${tenant.tenantId}] Batch #${batchNumber}: Found ${recordsToArchive.length} records to process.`
      );

      // Step 3: Archive and Purge Logic (Transactional per batch)
      try {
        const ndjsonContent = toNdjson(recordsToArchive);
        if (ndjsonContent) {
          const fileName = `archive-${new Date().toISOString()}-${batchNumber}.ndjson`;

          // Attempt to save to storage first
          await this.storageRepo.saveArchiveFile(
            tenant.tenantId,
            fileName,
            ndjsonContent
          );
          logger.info(
            `[${tenant.tenantId}] Batch #${batchNumber}: Successfully archived ${recordsToArchive.length} records to Storage file: ${fileName}.`
          );

          // ONLY if save is successful, purge from Firestore
          await this.firestoreRepo.purgeRecordsInBatch(recordRefs);
          logger.info(
            `[${tenant.tenantId}] Batch #${batchNumber}: Successfully purged ${recordRefs.length} records from Firestore.`
          );
        }
      } catch (error) {
        logger.error(
          `[${tenant.tenantId}] Batch #${batchNumber}: CRITICAL - Failed to archive batch. DATA WAS NOT PURGED to prevent loss.`,
          error
        );
        // Re-throw to let Promise.allSettled catch it as a tenant-level failure
        throw error;
      }

      // Continue if the batch was full, as there might be more records
      keepProcessing = querySnapshot.size === ARCHIVE_BATCH_SIZE;
    } while (keepProcessing);
  }
}
/**
 * @file Provides an abstraction layer for all interactions with Firebase Firestore.
 * It handles querying for tenants, configurations, and old attendance records,
 * as well as the batch deletion of purged records.
 * @namespace jobs.scheduled.dataArchival.infrastructure
 */

import {
  Firestore,
  QuerySnapshot,
  DocumentSnapshot,
  DocumentReference,
} from 'firebase-admin/firestore';
import {Tenant, TenantConfig} from '../domain/models';

/**
 * @class FirestoreRepository
 * @description Encapsulates all Firestore-specific logic, allowing the
 * application service to remain unaware of the underlying database
 * implementation details.
 */
export class FirestoreRepository {
  private db: Firestore;

  /**
   * Initializes the repository with a Firestore instance.
   * @param {Firestore} db - The Firestore database instance from `admin.firestore()`.
   */
  constructor(db: Firestore) {
    this.db = db;
  }

  /**
   * Queries the root `tenants` collection to get all active tenants.
   * @returns {Promise<Tenant[]>} A promise that resolves to an array of Tenant objects.
   */
  public async getActiveTenants(): Promise<Tenant[]> {
    const snapshot = await this.db.collection('tenants').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({
      tenantId: doc.id,
      ...doc.data(),
    } as Tenant));
  }

  /**
   * Fetches the configuration document for a specific tenant.
   * @param {string} tenantId - The ID of the tenant.
   * @returns {Promise<TenantConfig | null>} A promise that resolves to the
   * tenant's configuration or null if not found.
   */
  public async getTenantConfiguration(
    tenantId: string
  ): Promise<TenantConfig | null> {
    const configRef = this.db.doc(`/tenants/${tenantId}/config/default`);
    const doc = await configRef.get();

    if (!doc.exists) {
      return null;
    }
    return doc.data() as TenantConfig;
  }

  /**
   * Fetches a batch of attendance records older than a specified cutoff date for a tenant.
   * Supports pagination using a `startAfter` cursor.
   * @param {string} tenantId - The ID of the tenant whose records are to be fetched.
   * @param {Date} cutoffDate - The date threshold. Records on or before this date will be fetched.
   * @param {number} limit - The maximum number of records to fetch in this batch.
   * @param {DocumentSnapshot} [startAfter] - The Firestore document snapshot to start the query after, for pagination.
   * @returns {Promise<QuerySnapshot>} A promise that resolves to the query snapshot containing the batch of records.
   */
  public async getArchivableAttendance(
    tenantId: string,
    cutoffDate: Date,
    limit: number,
    startAfter?: DocumentSnapshot
  ): Promise<QuerySnapshot> {
    let query = this.db
      .collection(`/tenants/${tenantId}/attendance`)
      .where('clientCheckInTimestamp', '<=', cutoffDate)
      .orderBy('clientCheckInTimestamp')
      .limit(limit);

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    return await query.get();
  }

  /**
   * Deletes a batch of Firestore documents atomically using a Batched Write.
   * @param {DocumentReference[]} recordRefs - An array of DocumentReference objects to be deleted.
   * @returns {Promise<void>} A promise that resolves when the batch deletion is complete.
   */
  public async purgeRecordsInBatch(
    recordRefs: DocumentReference[]
  ): Promise<void> {
    if (recordRefs.length === 0) {
      return;
    }

    const batch = this.db.batch();
    recordRefs.forEach(ref => {
      batch.delete(ref);
    });

    await batch.commit();
  }
}
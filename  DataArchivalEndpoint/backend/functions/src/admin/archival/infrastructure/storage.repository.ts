/**
 * @file Provides an abstraction layer for all interactions with Firebase Storage.
 * It handles the creation and writing of NDJSON archive files to the appropriate
 * tenant-specific folder.
 * @namespace jobs.scheduled.dataArchival.infrastructure
 */

import {Storage} from 'firebase-admin/storage';

/**
 * @class StorageRepository
 * @description Encapsulates all Firebase Storage logic, enabling the application
 * service to save an archive file without knowing the implementation details.
 */
export class StorageRepository {
  private storage: Storage;

  /**
   * Initializes the repository with a Storage instance.
   * @param {Storage} storage - The Firebase Storage instance from `admin.storage()`.
   */
  constructor(storage: Storage) {
    this.storage = storage;
  }

  /**
   * Saves a string content to a file in Firebase Storage.
   *
   * @param {string} tenantId - The ID of the tenant, used to create a specific folder.
   * @param {string} fileName - The name of the file to be created (e.g., 'archive-2023-10-27.ndjson').
   * @param {string} fileContent - The string content to be written to the file.
   * @returns {Promise<void>} A promise that resolves when the file has been successfully saved.
   */
  public async saveArchiveFile(
    tenantId: string,
    fileName: string,
    fileContent: string
  ): Promise<void> {
    const bucket = this.storage.bucket();
    const filePath = `archives/${tenantId}/${fileName}`;
    const file = bucket.file(filePath);

    await file.save(fileContent, {
      contentType: 'application/x-ndjson',
      resumable: false, // Use simple upload for smaller files
    });
  }
}
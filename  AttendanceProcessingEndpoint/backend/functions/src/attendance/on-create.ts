import * as functions from "firebase-functions";
import {FieldValue} from "firebase-admin/firestore";
import {db} from "../core/firebase";
import {Attendance} from "../core/models";
import {HierarchyService} from "./hierarchy.service";
import {GeocodingService} from "./geocoding.service";

/**
 * The main handler function triggered on the creation of a new attendance document.
 * It orchestrates the server-side enrichment of the document.
 *
 * @param {functions.firestore.DocumentSnapshot} snap The snapshot of the new document.
 * @param {functions.EventContext} context The event context, containing path parameters.
 * @return {Promise<void>} A promise that resolves when the processing is complete.
 */
export const handler = async (
  snap: functions.firestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<void> => {
  const {tenantId, attendanceId} = context.params;
  functions.logger.info(
    `Starting attendance processing for tenant: ${tenantId}, attendanceId: ${attendanceId}`
  );

  try {
    const data = snap.data() as Attendance | undefined;

    // --- 1. Validation and Idempotency Check ---
    if (!data) {
      functions.logger.warn(
        `Document ${attendanceId} had no data. Exiting function.`
      );
      return;
    }

    if (data.serverSyncTimestamp) {
      functions.logger.info(
        `Record ${attendanceId} already processed (serverSyncTimestamp exists). Exiting.`
      );
      return;
    }

    if (!data.userId || !data.checkInLocation) {
      functions.logger.error(
        `Record ${attendanceId} is missing required fields 'userId' or 'checkInLocation'.`,
        {data}
      );
      return;
    }

    // --- 2. Initialize Services ---
    const hierarchyService = new HierarchyService(db);
    const geocodingService = new GeocodingService();

    // --- 3. Concurrent Data Enrichment ---
    const [approverHierarchy, checkInAddress] = await Promise.all([
      hierarchyService.buildApproverHierarchy(tenantId, data.userId),
      geocodingService.getAddressFromCoordinates(data.checkInLocation),
    ]);

    functions.logger.info(`Enrichment complete for ${attendanceId}.`, {
      hasHierarchy: approverHierarchy.length > 0,
      hasAddress: !!checkInAddress,
    });

    // --- 4. Construct Payload and Perform Atomic Update ---
    const updatePayload: {[key: string]: unknown} = {
      serverSyncTimestamp: FieldValue.serverTimestamp(),
      approverHierarchy: approverHierarchy,
    };

    if (checkInAddress) {
      updatePayload.checkInAddress = checkInAddress;
    }

    await snap.ref.update(updatePayload);

    functions.logger.info(
      `Successfully updated attendance record ${attendanceId} in tenant ${tenantId}.`
    );
  } catch (error) {
    functions.logger.error(
      `Unhandled error processing attendance record ${attendanceId} in tenant ${tenantId}.`,
      {error}
    );
  }
};
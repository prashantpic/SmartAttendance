import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { Client as MapsClient, LatLng } from "@googlemaps/google-maps-services-js";
import { Attendance, User } from "../domain/models";
import { FIRESTORE_COLLECTIONS } from "../common/constants";
import { NotificationService } from "./notification.service";

// Initialize the Google Maps client.
// It's best to set the API key in environment variables.
const mapsClient = new MapsClient({});

/**
 * Service to handle business logic for attendance records.
 * This includes data enrichment (like reverse geocoding) and sending notifications.
 */
export class AttendanceService {
  /**
   * Augments a newly created attendance record with server-generated data.
   * This includes the approver hierarchy and a human-readable address.
   *
   * @param {string} recordId The ID of the new attendance record.
   * @param {string} tenantId The ID of the tenant.
   * @param {Attendance} data The data of the newly created attendance record.
   * @returns {Promise<void>}
   */
  public static async augmentNewRecord(
    recordId: string,
    tenantId: string,
    data: Attendance
  ): Promise<void> {
    const updatePayload: { [key: string]: any } = {};

    // 1. Build Approver Hierarchy
    try {
      const hierarchy = await this.buildApproverHierarchy(tenantId, data.userId);
      updatePayload.approverHierarchy = hierarchy;
    } catch (error) {
      functions.logger.error(`Failed to build approver hierarchy for user ${data.userId} in tenant ${tenantId}`, error);
      // Decide if this is a fatal error. For now, we'll continue without it.
      updatePayload.approverHierarchy = [];
    }

    // 2. Reverse Geocode the check-in location
    try {
      const address = await this.reverseGeocode(data.checkInLocation);
      updatePayload.checkInAddress = address;
    } catch (error) {
      functions.logger.error(`Failed to reverse geocode location for attendance record ${recordId}`, error);
      updatePayload.checkInAddress = "Address not available";
    }

    // 3. Set server-side timestamp
    updatePayload.serverSyncTimestamp = admin.firestore.FieldValue.serverTimestamp();

    // 4. Update the attendance document
    if (Object.keys(updatePayload).length > 0) {
      const recordRef = admin
        .firestore()
        .collection(FIRESTORE_COLLECTIONS.TENANTS)
        .doc(tenantId)
        .collection(FIRESTORE_COLLECTIONS.ATTENDANCE)
        .doc(recordId);

      await recordRef.update(updatePayload);
    }
  }

  /**
   * Sends a notification to the user when their attendance status changes to Approved or Rejected.
   * @param {Attendance} before The attendance record data before the update.
   * @param {Attendance} after The attendance record data after the update.
   * @returns {Promise<void>}
   */
  public static async notifyOnStatusChange(before: Attendance, after: Attendance): Promise<void> {
    const statusChanged = before.status !== after.status;
    const wasPending = before.status === "Pending";
    const isNowDecided = after.status === "Approved" || after.status === "Rejected";

    if (wasPending && isNowDecided && statusChanged) {
      const date = after.clientCheckInTimestamp.toDate().toLocaleDateString();
      const payload = {
        title: "Attendance Status Updated",
        body: `Your attendance record for ${date} has been ${after.status}.`,
        data: {
            attendanceId: after.userId, // Using userId as a placeholder, would need doc ID if available.
            status: after.status
        }
      };
      await NotificationService.sendNotificationToUser(after.userId, after.tenantId, payload);
    }
  }

  /**
   * Builds the supervisory chain for a given user.
   * @private
   * @param {string} tenantId The user's tenant ID.
   * @param {string} userId The starting user's ID.
   * @returns {Promise<string[]>} An ordered array of supervisor IDs.
   */
  private static async buildApproverHierarchy(tenantId: string, userId: string): Promise<string[]> {
    const hierarchy: string[] = [];
    let currentUserId: string | undefined = userId;
    const maxDepth = 10; // Safety break to prevent infinite loops

    for (let i = 0; i < maxDepth && currentUserId; i++) {
      const userDoc = await admin
        .firestore()
        .collection(FIRESTORE_COLLECTIONS.TENANTS)
        .doc(tenantId)
        .collection(FIRESTORE_COLLECTIONS.USERS)
        .doc(currentUserId)
        .get();

      if (!userDoc.exists) break;
      const userData = userDoc.data() as User;
      currentUserId = userData.supervisorId;
      if (currentUserId) {
        hierarchy.push(currentUserId);
      }
    }
    return hierarchy;
  }

  /**
   * Converts a GeoPoint to a human-readable address string.
   * @private
   * @param {admin.firestore.GeoPoint} location The location to geocode.
   * @returns {Promise<string>} The formatted address.
   */
  private static async reverseGeocode(location: admin.firestore.GeoPoint): Promise<string> {
    const apiKey = functions.config().googlemaps?.key;
    if (!apiKey) {
      functions.logger.warn("Google Maps API key is not configured. Skipping reverse geocoding.");
      return "N/A";
    }

    const latlng: LatLng = [location.latitude, location.longitude];
    const response = await mapsClient.reverseGeocode({
      params: {
        latlng,
        key: apiKey,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    }
    throw new Error("No results found for reverse geocoding.");
  }
}
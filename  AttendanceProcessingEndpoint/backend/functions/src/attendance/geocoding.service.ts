import * as functions from "firebase-functions";
import {Client} from "@googlemaps/google-maps-services-js";
import {GeoPoint} from "firebase-admin/firestore";

/**
 * A service that wraps the Google Maps Geocoding API to provide
 * reverse geocoding functionality (coordinates to address).
 */
export class GeocodingService {
  private readonly mapsClient: Client;

  constructor() {
    this.mapsClient = new Client({});
  }

  /**
   * Converts GPS coordinates into a human-readable street address.
   *
   * @param {GeoPoint} location The latitude and longitude to reverse geocode.
   * @return {Promise<string | null>} A promise that resolves to the formatted
   * address string, or null if an address could not be found or an error occurred.
   */
  public async getAddressFromCoordinates(
    location: GeoPoint
  ): Promise<string | null> {
    const apiKey = functions.config().google?.maps_api_key;

    if (!apiKey) {
      functions.logger.error(
        "Google Maps API Key is not configured. Set it with `firebase functions:config:set google.maps_api_key=...`"
      );
      return null;
    }

    try {
      const response = await this.mapsClient.reverseGeocode({
        params: {
          latlng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          key: apiKey,
        },
      });

      if (response.data.results && response.data.results.length > 0) {
        // The first result is typically the most specific/accurate.
        return response.data.results[0].formatted_address;
      } else {
        functions.logger.warn(
          `No reverse geocoding results found for lat: ${location.latitude}, lon: ${location.longitude}.`,
          {responseStatus: response.data.status}
        );
        return null;
      }
    } catch (error) {
      functions.logger.error(
        "Error calling Google Maps Reverse Geocoding API.",
        {error}
      );
      return null;
    }
  }
}
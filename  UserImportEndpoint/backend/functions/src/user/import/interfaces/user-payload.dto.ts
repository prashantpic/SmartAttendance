import { FieldValue } from "firebase-admin/firestore";

/**
 * Defines the data transfer object (DTO) for a new user that is ready to be
 * persisted to Firestore. It specifies the precise shape and data types for a new
 * user document.
 * @summary Represents the data payload for creating a new user document in Firestore.
 */
export interface UserPayloadDto {
    name: string;
    email: string;
    tenantId: string;
    supervisorId: string | null;
    role: 'Subordinate' | 'Supervisor';
    status: 'Invited';
    createdAt: FieldValue;
    updatedAt: FieldValue;
    lastLoginTimestamp: null;
    fcmToken: null;
    subordinateIds: string[]; // Should be initialized as []
}
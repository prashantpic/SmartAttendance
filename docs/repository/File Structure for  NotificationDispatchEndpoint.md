# Specification

# 1. Files

- **Path:** backend/functions/src/index.ts  
**Description:** The main entry point for all Firebase Cloud Functions within this project. This file imports function triggers from various modules, such as the notification handler, and exports them for deployment to the Firebase environment.  
**Template:** TypeScript Function Index  
**Dependency Level:** 3  
**Name:** index  
**Type:** Index  
**Relative Path:**   
**Repository Id:** REPO-005-SVC  
**Pattern Ids:**
    
    - EventDriven
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Function Export
    
**Requirement Ids:**
    
    - 3.5.4
    
**Purpose:** To aggregate and export all defined Cloud Functions, making them discoverable by the Firebase CLI for deployment.  
**Logic Description:** This file will use named exports to expose the functions defined in other files. It will import the `attendanceOnWrite` function from './notifications/handler' and re-export it under a descriptive name, like `notificationDispatchEndpoint`.  
**Documentation:**
    
    - **Summary:** Aggregates and exports all cloud functions for deployment. It serves as the root manifest for the serverless functions in this backend project.
    
**Namespace:** functions  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** backend/functions/src/notifications/handler.ts  
**Description:** Contains the Firebase Cloud Function trigger that listens for onWrite events (create, update, delete) on the attendance collection in Firestore. It serves as the primary entry point for the notification dispatch logic.  
**Template:** TypeScript Cloud Function Handler  
**Dependency Level:** 2  
**Name:** handler  
**Type:** Handler  
**Relative Path:** notifications  
**Repository Id:** REPO-005-SVC  
**Pattern Ids:**
    
    - EventDriven
    
**Members:**
    
    
**Methods:**
    
    - **Name:** attendanceOnWrite  
**Parameters:**
    
    - change: functions.Change<firestore.DocumentSnapshot>
    - context: functions.EventContext
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Firestore Trigger
    - Event Orchestration
    
**Requirement Ids:**
    
    - 3.5.4
    
**Purpose:** To react to changes in attendance records and initiate the appropriate notification workflow by calling the NotificationService.  
**Logic Description:** The function will be defined using `functions.firestore.document('/tenants/{tenantId}/attendance/{attendanceId}').onWrite()`. It will extract the before and after data snapshots from the `change` object. It will determine if the event is a creation (new pending request) or an update (approved/rejected). It will then instantiate the NotificationService and call its `handleAttendanceUpdate` method, passing the relevant data and context parameters.  
**Documentation:**
    
    - **Summary:** This file defines the `onWrite` Firestore trigger for attendance records. It receives the event data and context, then delegates the business logic to the NotificationService for processing.
    
**Namespace:** functions.notifications  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** backend/functions/src/notifications/application/notification.service.ts  
**Description:** Contains the core business logic for determining which notifications to send based on an attendance record update. It decouples the trigger handler from the notification logic.  
**Template:** TypeScript Service  
**Dependency Level:** 1  
**Name:** NotificationService  
**Type:** Service  
**Relative Path:** notifications/application  
**Repository Id:** REPO-005-SVC  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** userRepository  
**Type:** IUserRepository  
**Attributes:** private|readonly  
    - **Name:** fcmService  
**Type:** IFcmService  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** handleAttendanceUpdate  
**Parameters:**
    
    - before: AttendanceDto | undefined
    - after: AttendanceDto | undefined
    - context: { tenantId: string, attendanceId: string }
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Supervisor Notification Logic
    - Subordinate Notification Logic
    
**Requirement Ids:**
    
    - 3.5.4
    
**Purpose:** To orchestrate the process of sending push notifications by identifying the event type, fetching necessary user data, and dispatching the message.  
**Logic Description:** The `handleAttendanceUpdate` method will check the state of the `before` and `after` data. If `before` is undefined and `after` has a 'Pending' status, it's a new request; it will get the `approverHierarchy` from `after`, fetch the direct supervisor's FCM token using the `userRepository`, format a 'new request' message, and send it via the `fcmService`. If the status changes from 'Pending' to 'Approved' or 'Rejected', it will fetch the subordinate's (`userId` from `after`) FCM token, format the appropriate message, and send it.  
**Documentation:**
    
    - **Summary:** This service encapsulates the business rules for sending notifications. It determines the correct recipient and message content for a given attendance record change and uses injected infrastructure services to perform the actions.
    
**Namespace:** functions.notifications.application  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** backend/functions/src/notifications/infrastructure/user.repository.ts  
**Description:** Implements the IUserRepository interface. It handles all data access operations related to user documents in Firestore, specifically for retrieving information needed for notifications.  
**Template:** TypeScript Repository  
**Dependency Level:** 1  
**Name:** UserRepository  
**Type:** Repository  
**Relative Path:** notifications/infrastructure  
**Repository Id:** REPO-005-SVC  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** db  
**Type:** firestore.Firestore  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** findById  
**Parameters:**
    
    - tenantId: string
    - userId: string
    
**Return Type:** Promise<User | null>  
**Attributes:** public  
    
**Implemented Features:**
    
    - User Data Fetching
    
**Requirement Ids:**
    
    - 3.5.4
    - 2.1
    
**Purpose:** To provide a clean, abstracted interface for querying user data from Firestore without scattering Firestore-specific code throughout the application logic.  
**Logic Description:** The `findById` method will construct a Firestore document path using the provided `tenantId` and `userId` (e.g., `/tenants/{tenantId}/users/{userId}`). It will fetch the document snapshot, check if it exists, and if so, map the data to a `User` domain object. This method will be crucial for retrieving the `fcmToken` and `name` of the notification recipient.  
**Documentation:**
    
    - **Summary:** Provides data access methods for the 'users' collection in Firestore. Its primary function is to retrieve user profiles by their ID within a specific tenant context.
    
**Namespace:** functions.notifications.infrastructure  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/functions/src/notifications/infrastructure/fcm.service.ts  
**Description:** An adapter that encapsulates the logic for sending push notifications using the Firebase Admin SDK for Firebase Cloud Messaging (FCM).  
**Template:** TypeScript Service  
**Dependency Level:** 1  
**Name:** FcmService  
**Type:** Service  
**Relative Path:** notifications/infrastructure  
**Repository Id:** REPO-005-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** messaging  
**Type:** admin.messaging.Messaging  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** sendPushNotification  
**Parameters:**
    
    - notification: Notification
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Push Notification Dispatch
    
**Requirement Ids:**
    
    - 3.5.4
    
**Purpose:** To abstract the details of interacting with the FCM service, providing a simple method to send a prepared notification payload.  
**Logic Description:** The `sendPushNotification` method will take a `Notification` domain object as input. It will construct the FCM message payload, setting the `token`, `notification` (with title and body), and any custom `data`. It will then call `admin.messaging().send()` to dispatch the message. The method will include error handling for cases where the FCM token is invalid or the service fails.  
**Documentation:**
    
    - **Summary:** This service is a dedicated adapter for Firebase Cloud Messaging. It receives a structured notification object and is responsible for sending it to the specified device token.
    
**Namespace:** functions.notifications.infrastructure  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/functions/src/notifications/domain/notification.ts  
**Description:** A domain model representing a push notification. It contains all the necessary information to construct and send a message via FCM, keeping the data structured and the logic clean.  
**Template:** TypeScript Interface/Class  
**Dependency Level:** 0  
**Name:** Notification  
**Type:** Model  
**Relative Path:** notifications/domain  
**Repository Id:** REPO-005-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** recipientToken  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** title  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** body  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** data  
**Type:** { [key: string]: string }  
**Attributes:** public|readonly|optional  
    
**Methods:**
    
    
**Implemented Features:**
    
    
**Requirement Ids:**
    
    - 3.5.4
    
**Purpose:** To provide a type-safe, structured representation of a push notification payload, ensuring consistency across the application.  
**Logic Description:** This file will define a TypeScript interface or class named `Notification`. It will have required properties for the recipient's FCM token, the message title, and the message body, along with an optional data payload for deep-linking or other client-side logic.  
**Documentation:**
    
    - **Summary:** Defines the data contract for a push notification entity, used to pass notification details between the application and infrastructure layers.
    
**Namespace:** functions.notifications.domain  
**Metadata:**
    
    - **Category:** Domain
    
- **Path:** backend/functions/src/notifications/domain/user.ts  
**Description:** A lightweight domain model for a User, containing only the properties necessary for the notification context, such as their name and FCM token.  
**Template:** TypeScript Interface/Class  
**Dependency Level:** 0  
**Name:** User  
**Type:** Model  
**Relative Path:** notifications/domain  
**Repository Id:** REPO-005-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** id  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** name  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** fcmToken  
**Type:** string | null  
**Attributes:** public|readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    
**Requirement Ids:**
    
    - 3.5.4
    - 2.1
    
**Purpose:** To provide a type-safe representation of user data retrieved from the repository, ensuring the NotificationService has access to the required fields.  
**Logic Description:** This file will define a TypeScript interface or class for the User entity. It will focus on the data needed for notifications, abstracting away the full user profile which might be defined elsewhere.  
**Documentation:**
    
    - **Summary:** Defines the data contract for a User entity within the notification bounded context.
    
**Namespace:** functions.notifications.domain  
**Metadata:**
    
    - **Category:** Domain
    
- **Path:** backend/functions/src/notifications/interfaces/attendance.dto.ts  
**Description:** A Data Transfer Object (DTO) that defines the data structure and types for an attendance document retrieved from Firestore. This ensures type safety when handling event data.  
**Template:** TypeScript Interface  
**Dependency Level:** 0  
**Name:** AttendanceDto  
**Type:** DTO  
**Relative Path:** notifications/interfaces  
**Repository Id:** REPO-005-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** userId  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** userName  
**Type:** string  
**Attributes:** public|readonly  
    - **Name:** status  
**Type:** 'Pending' | 'Approved' | 'Rejected'  
**Attributes:** public|readonly  
    - **Name:** approverHierarchy  
**Type:** string[]  
**Attributes:** public|readonly  
    - **Name:** approvalDetails  
**Type:** { approverId: string, timestamp: any } | undefined  
**Attributes:** public|readonly|optional  
    
**Methods:**
    
    
**Implemented Features:**
    
    
**Requirement Ids:**
    
    - 3.5.4
    
**Purpose:** To provide a strict type definition for the data coming from the Firestore `onWrite` event, preventing runtime errors and improving code readability.  
**Logic Description:** This file will export a TypeScript interface named `AttendanceDto`. The interface will list all the fields from the attendance document that are relevant to the notification logic, with their corresponding TypeScript types.  
**Documentation:**
    
    - **Summary:** Defines the shape and types of the attendance data payload as it exists in Firestore, ensuring type-safe handling within the Cloud Function.
    
**Namespace:** functions.notifications.interfaces  
**Metadata:**
    
    - **Category:** Interfaces
    
- **Path:** backend/functions/src/notifications/config/notification.templates.ts  
**Description:** A configuration file that stores the string templates for all push notifications sent by the system. Centralizes user-facing text for easy management.  
**Template:** TypeScript Constants  
**Dependency Level:** 0  
**Name:** notificationTemplates  
**Type:** Configuration  
**Relative Path:** notifications/config  
**Repository Id:** REPO-005-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** NEW_REQUEST_TITLE  
**Type:** string  
**Attributes:** public|static|readonly  
    - **Name:** NEW_REQUEST_BODY  
**Type:** (userName: string) => string  
**Attributes:** public|static|readonly  
    - **Name:** REQUEST_APPROVED_TITLE  
**Type:** string  
**Attributes:** public|static|readonly  
    - **Name:** REQUEST_APPROVED_BODY  
**Type:** string  
**Attributes:** public|static|readonly  
    - **Name:** REQUEST_REJECTED_TITLE  
**Type:** string  
**Attributes:** public|static|readonly  
    - **Name:** REQUEST_REJECTED_BODY  
**Type:** string  
**Attributes:** public|static|readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Notification Content Management
    
**Requirement Ids:**
    
    - 3.5.4
    
**Purpose:** To provide a single source of truth for the text content of push notifications, separating content from application logic.  
**Logic Description:** This file will export a constant object or a class with static properties. It will contain strings for notification titles and functions that generate notification bodies, allowing for dynamic content like usernames. For example, `NEW_REQUEST_BODY: (userName) => `You have a new attendance request from ${userName}.``  
**Documentation:**
    
    - **Summary:** Contains all user-facing string templates for push notifications, enabling easy updates and future localization.
    
**Namespace:** functions.notifications.config  
**Metadata:**
    
    - **Category:** Configuration
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  


---


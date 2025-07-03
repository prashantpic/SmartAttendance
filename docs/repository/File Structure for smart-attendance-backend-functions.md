# Specification

# 1. Files

- **Path:** functions/package.json  
**Description:** Defines the Node.js project, its dependencies, and scripts for building, serving, and deploying the Firebase Functions.  
**Template:** Node.js Package  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** ../package.json  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Dependency Management
    - Build and Deployment Scripts
    
**Requirement Ids:**
    
    
**Purpose:** To manage all third-party libraries and define the commands needed to work with the Cloud Functions codebase.  
**Logic Description:** This file will list 'firebase-functions', 'firebase-admin', 'googleapis', 'csv-parse', and other necessary libraries under 'dependencies'. It will also include scripts like 'build' (to run tsc), 'serve' (to run functions locally with the emulator), 'deploy', and 'lint'.  
**Documentation:**
    
    - **Summary:** Standard npm package.json file for the Firebase Functions project. Lists all production and development dependencies, along with essential scripts for the development lifecycle.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** functions/tsconfig.json  
**Description:** TypeScript compiler configuration file. It specifies how TypeScript files (.ts) are compiled into JavaScript files (.js) that can be executed by the Node.js runtime in the Firebase environment.  
**Template:** TypeScript Configuration  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** ../tsconfig.json  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation Settings
    
**Requirement Ids:**
    
    
**Purpose:** To configure the TypeScript compiler, specifying the target JavaScript version, module system, output directory ('lib'), and source directory.  
**Logic Description:** The configuration will set 'module' to 'commonjs', 'target' to 'es2017' or newer, 'outDir' to 'lib', and 'rootDir' to 'src'. It will also enable strict type checking and source map generation for better debugging.  
**Documentation:**
    
    - **Summary:** Specifies the root files and the compiler options required to compile the TypeScript project for Firebase Functions.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** functions/src/index.ts  
**Description:** The main entry point for all Firebase Cloud Functions. This file imports functions from other files and re-exports them, allowing for a clean and organized project structure.  
**Template:** TypeScript Module  
**Dependency Level:** 4  
**Name:** index  
**Type:** Main  
**Relative Path:** index.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    - EventDrivenArchitecture
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Function Aggregation
    
**Requirement Ids:**
    
    
**Purpose:** To act as the root manifest for all deployed functions, making it easy for Firebase to discover and deploy them.  
**Logic Description:** This file will use spread syntax to import and export all functions from 'tenant.functions.ts', 'attendance.functions.ts', 'user.functions.ts', and 'scheduled.functions.ts'. This keeps the file minimal and focused on aggregation.  
**Documentation:**
    
    - **Summary:** Aggregates all Cloud Function definitions from across the project and exports them for deployment to Firebase.
    
**Namespace:** functions.smartattendance  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** functions/src/domain/models.ts  
**Description:** Defines the TypeScript interfaces and types that represent the core domain entities of the system, such as User, Attendance, and Tenant. These types ensure data consistency throughout the backend services.  
**Template:** TypeScript Module  
**Dependency Level:** 0  
**Name:** models  
**Type:** Model  
**Relative Path:** domain/models.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Data Modeling
    
**Requirement Ids:**
    
    
**Purpose:** To provide strongly-typed definitions for all data structures used in Firestore and processed by the Cloud Functions.  
**Logic Description:** Define interfaces for Tenant, User, Attendance, TenantConfig, Event, LinkedSheet, and AuditLog. These interfaces will match the schemas defined in the database design, including all fields and their expected data types (e.g., string, number, admin.firestore.Timestamp, admin.firestore.GeoPoint).  
**Documentation:**
    
    - **Summary:** Contains TypeScript type definitions for all core business entities, ensuring type safety and consistency across the application's backend.
    
**Namespace:** functions.smartattendance.domain  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** functions/src/common/constants.ts  
**Description:** A centralized module for storing application-wide constants, such as Firestore collection names, user roles, and statuses. This avoids magic strings and improves maintainability.  
**Template:** TypeScript Module  
**Dependency Level:** 0  
**Name:** constants  
**Type:** Utility  
**Relative Path:** common/constants.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Constant Management
    
**Requirement Ids:**
    
    
**Purpose:** To provide a single source of truth for constants used across different functions and services.  
**Logic Description:** Export constant objects for FIRESTORE_COLLECTIONS (e.g., TENANTS: 'tenants', USERS: 'users'), USER_ROLES ('Admin', 'Supervisor'), and STATUSES ('Active', 'Pending'). This makes refactoring easier and code more readable.  
**Documentation:**
    
    - **Summary:** Defines and exports application-level constants to ensure consistency and prevent errors from typos.
    
**Namespace:** functions.smartattendance.common  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** functions/src/services/notification.service.ts  
**Description:** A dedicated service responsible for constructing and sending FCM push notifications. It abstracts the complexity of interacting with the Firebase Admin SDK for messaging.  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** NotificationService  
**Type:** Service  
**Relative Path:** services/notification.service.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** sendNotificationToUser  
**Parameters:**
    
    - userId string
    - payload FcmPayload
    
**Return Type:** Promise<void>  
**Attributes:** public static  
    - **Name:** sendNotificationToMultipleUsers  
**Parameters:**
    
    - userIds string[]
    - payload FcmPayload
    
**Return Type:** Promise<void>  
**Attributes:** public static  
    
**Implemented Features:**
    
    - Push Notification Dispatch
    
**Requirement Ids:**
    
    - 5.1
    
**Purpose:** To centralize the logic for sending push notifications, making it reusable by any function that needs to alert users.  
**Logic Description:** The service will have methods that accept a user ID (or multiple IDs) and a payload. It will fetch the user's FCM token from their Firestore document. It will then construct the FCM message with the title, body, and any data payload, and use 'admin.messaging().send()' to dispatch the notification. It will include error handling for invalid or expired tokens.  
**Documentation:**
    
    - **Summary:** This service handles fetching user FCM tokens from Firestore and sending push notifications via Firebase Cloud Messaging.
    
**Namespace:** functions.smartattendance.services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** functions/src/services/tenant.service.ts  
**Description:** Contains the business logic for tenant onboarding and provisioning. This service is called by the tenant creation HTTP function.  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** TenantService  
**Type:** Service  
**Relative Path:** services/tenant.service.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    - Mobile Backend as a Service (MBaaS)
    
**Members:**
    
    
**Methods:**
    
    - **Name:** provisionNewTenant  
**Parameters:**
    
    - orgName string
    - adminName string
    - adminEmail string
    - adminPassword string
    
**Return Type:** Promise<{tenantId: string, userId: string}>  
**Attributes:** public static  
    
**Implemented Features:**
    
    - Tenant Creation
    - Initial Admin User Provisioning
    - Default Configuration Seeding
    
**Requirement Ids:**
    
    - 3.1
    
**Purpose:** To orchestrate the multi-step process of creating a new organization account atomically.  
**Logic Description:** This service will execute a Firestore transaction or batched write to ensure atomicity. The process involves: 1. Creating a tenant document in the 'tenants' collection. 2. Creating a user in Firebase Auth. 3. Setting custom claims on the new user (tenantId, role: 'Admin'). 4. Creating the user's profile document in Firestore under '/tenants/{tenantId}/users/{userId}' with 'Admin' role and 'Active' status. 5. Creating a default configuration document under '/tenants/{tenantId}/config/default'.  
**Documentation:**
    
    - **Summary:** Handles the end-to-end logic for creating a new tenant, including all necessary database records and the initial admin user account.
    
**Namespace:** functions.smartattendance.services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** functions/src/functions/tenant.functions.ts  
**Description:** Defines and exports the HTTP-triggered Cloud Function responsible for new tenant onboarding.  
**Template:** TypeScript Cloud Function  
**Dependency Level:** 3  
**Name:** tenantFunctions  
**Type:** Controller  
**Relative Path:** functions/tenant.functions.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    - Mobile Backend as a Service (MBaaS)
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Tenant Registration Endpoint
    
**Requirement Ids:**
    
    - 3.1
    
**Purpose:** To provide a public-facing API endpoint that the registration web page can call to sign up a new organization.  
**Logic Description:** Exports an 'onCall' or 'onRequest' HTTPS Cloud Function named 'onboardNewTenant'. This function will parse and validate the incoming request body for organization name, user name, email, and password. It will then invoke the 'TenantService.provisionNewTenant' method to perform the core business logic and return a success or error response.  
**Documentation:**
    
    - **Summary:** Exposes the tenant provisioning logic as a callable HTTPS endpoint for the public registration page.
    
**Namespace:** functions.smartattendance.functions  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** functions/src/services/attendance.service.ts  
**Description:** Contains the business logic for processing and enriching new attendance records.  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** AttendanceService  
**Type:** Service  
**Relative Path:** services/attendance.service.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    - EventDrivenArchitecture
    
**Members:**
    
    
**Methods:**
    
    - **Name:** augmentNewRecord  
**Parameters:**
    
    - recordId string
    - tenantId string
    - data Attendance
    
**Return Type:** Promise<void>  
**Attributes:** public static  
    - **Name:** notifyOnStatusChange  
**Parameters:**
    
    - beforeData Attendance
    - afterData Attendance
    
**Return Type:** Promise<void>  
**Attributes:** public static  
    
**Implemented Features:**
    
    - Data Enrichment
    - Reverse Geocoding
    - Approval Hierarchy Population
    - Approval Notification
    
**Requirement Ids:**
    
    - 3.4.4
    - 5.1
    
**Purpose:** To handle all server-side logic that needs to run when an attendance record is created or updated.  
**Logic Description:** The 'augmentNewRecord' method will: 1. Fetch the user's document to get their supervisorId. 2. Recursively traverse the supervisor chain to build the 'approverHierarchy' array. 3. Call a geocoding client to get the address from the 'checkInLocation' GeoPoint. 4. Update the attendance record with the hierarchy, address, and a 'serverSyncTimestamp'. The 'notifyOnStatusChange' method will compare before/after statuses and trigger the NotificationService if a record is approved or rejected.  
**Documentation:**
    
    - **Summary:** Orchestrates the augmentation of new attendance records with server-generated data and handles sending notifications based on status changes.
    
**Namespace:** functions.smartattendance.services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** functions/src/functions/attendance.functions.ts  
**Description:** Defines and exports Firestore-triggered Cloud Functions related to the attendance collection.  
**Template:** TypeScript Cloud Function  
**Dependency Level:** 3  
**Name:** attendanceFunctions  
**Type:** Controller  
**Relative Path:** functions/attendance.functions.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    - EventDrivenArchitecture
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Attendance Creation Trigger
    - Attendance Update Trigger
    
**Requirement Ids:**
    
    - 3.4.4
    - 5.1
    
**Purpose:** To automatically execute backend logic in response to data changes in the attendance collection.  
**Logic Description:** Exports an 'onAttendanceCreated' function triggered by 'functions.firestore.document('/tenants/{tenantId}/attendance/{attendanceId}').onCreate()'. This function will call 'AttendanceService.augmentNewRecord'. It also exports an 'onAttendanceUpdated' function triggered by 'onUpdate()', which will call 'AttendanceService.notifyOnStatusChange' to handle approval/rejection notifications.  
**Documentation:**
    
    - **Summary:** Contains Firestore triggers that react to the creation and modification of attendance records to perform data enrichment and send notifications.
    
**Namespace:** functions.smartattendance.functions  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** functions/src/services/sheets.service.ts  
**Description:** Handles the logic for exporting attendance data to a linked Google Sheet.  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** SheetsService  
**Type:** Service  
**Relative Path:** services/sheets.service.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** syncTenantDataToSheet  
**Parameters:**
    
    - tenantId string
    
**Return Type:** Promise<void>  
**Attributes:** public static  
    
**Implemented Features:**
    
    - Data Export
    - Google Sheets API Integration
    - Idempotent Sync
    
**Requirement Ids:**
    
    - 3.7
    
**Purpose:** To provide a reliable and idempotent mechanism for syncing approved attendance records to a customer's Google Sheet.  
**Logic Description:** The service will first fetch the tenant's 'linkedSheets' configuration to get the fileId and authentication details. It will query Firestore for approved attendance records since the 'lastSyncTimestamp'. To ensure idempotency, it will check if a record ID already exists in the sheet before appending. It will use the googleapis library to interact with the Sheets API, appending new rows. It will handle API errors gracefully, logging failures and updating the 'lastSyncStatus' in Firestore.  
**Documentation:**
    
    - **Summary:** Manages the full workflow of fetching new attendance data from Firestore and appending it to a tenant's designated Google Sheet.
    
**Namespace:** functions.smartattendance.services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** functions/src/services/archival.service.ts  
**Description:** Handles the logic for archiving old attendance records from Firestore to Firebase Storage and then purging them.  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** ArchivalService  
**Type:** Service  
**Relative Path:** services/archival.service.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** archiveAndPurgeOldRecords  
**Parameters:**
    
    - tenantId string
    
**Return Type:** Promise<void>  
**Attributes:** public static  
    
**Implemented Features:**
    
    - Data Archival
    - Data Purging
    - NDJSON Formatting
    
**Requirement Ids:**
    
    - 6.3.2
    
**Purpose:** To enforce data retention policies, manage Firestore costs, and maintain application performance by periodically cleaning up old data.  
**Logic Description:** The service will fetch the tenant's 'dataRetentionDays' from its config. It will then query the 'attendance' collection for records older than this period. The fetched records will be serialized into NDJSON format. The service will write this data to a file in Firebase Storage in a path like '/archives/{tenantId}/{date}.ndjson'. Only upon successful upload will it perform a batched delete to purge the records from Firestore.  
**Documentation:**
    
    - **Summary:** Implements the data retention lifecycle by exporting old records to cold storage and safely removing them from the active database.
    
**Namespace:** functions.smartattendance.services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** functions/src/functions/scheduled.functions.ts  
**Description:** Defines and exports all scheduled (pub/sub) Cloud Functions for recurring background tasks.  
**Template:** TypeScript Cloud Function  
**Dependency Level:** 3  
**Name:** scheduledFunctions  
**Type:** Controller  
**Relative Path:** functions/scheduled.functions.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    - EventDrivenArchitecture
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Scheduled Data Sync
    - Scheduled Data Archival
    
**Requirement Ids:**
    
    - 3.7
    - 6.3.2
    
**Purpose:** To provide time-based triggers for periodic maintenance and data processing tasks.  
**Logic Description:** Exports a 'syncToGoogleSheets' function that runs on a schedule (e.g., 'every 24 hours'). This function will iterate through all tenants with a linked sheet and invoke 'SheetsService.syncTenantDataToSheet'. It also exports an 'archiveOldData' function, running on a similar schedule, which will iterate through all tenants and invoke 'ArchivalService.archiveAndPurgeOldRecords'.  
**Documentation:**
    
    - **Summary:** Contains scheduled functions triggered by Cloud Scheduler to perform regular tasks like Google Sheets export and data archival.
    
**Namespace:** functions.smartattendance.functions  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** functions/src/services/user.service.ts  
**Description:** Contains the business logic for processing bulk user import from a CSV file.  
**Template:** TypeScript Service  
**Dependency Level:** 2  
**Name:** UserService  
**Type:** Service  
**Relative Path:** services/user.service.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** importUsersFromCSV  
**Parameters:**
    
    - fileBuffer Buffer
    - tenantId string
    
**Return Type:** Promise<{successCount: number, errorCount: number, errors: any[]}>  
**Attributes:** public static  
    
**Implemented Features:**
    
    - CSV Parsing
    - User Data Validation
    - Bulk User Creation
    
**Requirement Ids:**
    
    - 4.2
    
**Purpose:** To handle the complex logic of parsing, validating, and creating multiple user accounts from an uploaded file.  
**Logic Description:** This service will use a library like 'csv-parse' to process the file buffer. It will iterate through each row, validating the data (e.g., valid email format, required fields). For each valid row, it will create a new user document in Firestore under the tenant's path with a status of 'Invited' and role of 'Subordinate'. It will handle resolving supervisor emails to supervisor IDs. The service will compile and return a report of successful and failed imports.  
**Documentation:**
    
    - **Summary:** Orchestrates the bulk import of users from a CSV file, including data validation and creation of user records in Firestore.
    
**Namespace:** functions.smartattendance.services  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** functions/src/functions/user.functions.ts  
**Description:** Defines and exports the Cloud Storage-triggered function for processing bulk user import.  
**Template:** TypeScript Cloud Function  
**Dependency Level:** 3  
**Name:** userFunctions  
**Type:** Controller  
**Relative Path:** functions/user.functions.ts  
**Repository Id:** REPO-02-BKN  
**Pattern Ids:**
    
    - EventDrivenArchitecture
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - User Import Trigger
    
**Requirement Ids:**
    
    - 4.2
    
**Purpose:** To automatically trigger the user import process when an Admin uploads a CSV file to a specific Cloud Storage bucket.  
**Logic Description:** Exports an 'onUserCSVUploaded' function triggered by 'functions.storage.object().onFinalize()'. The trigger will be configured to watch a specific path (e.g., '/uploads/{tenantId}/user-imports/{fileName}'). The function will download the file content, extract the tenantId from the path, and pass the file buffer and tenantId to the 'UserService.importUsersFromCSV' method. It might also send a notification or email to the Admin with the result.  
**Documentation:**
    
    - **Summary:** A Cloud Storage trigger that initiates the bulk user import process whenever a new CSV file is uploaded to the designated location.
    
**Namespace:** functions.smartattendance.functions  
**Metadata:**
    
    - **Category:** ApplicationServices
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  


---


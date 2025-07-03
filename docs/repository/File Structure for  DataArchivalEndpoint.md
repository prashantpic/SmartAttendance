# Specification

# 1. Files

- **Path:** backend/functions/src/admin/archival/domain/models.ts  
**Description:** Defines the TypeScript interfaces for the core domain entities involved in the data archival process, such as Tenant, TenantConfig, and AttendanceRecord. This ensures type safety and a clear data contract throughout the function.  
**Template:** TypeScript Model Template  
**Dependency Level:** 0  
**Name:** models  
**Type:** Model  
**Relative Path:** admin/archival/domain/models.ts  
**Repository Id:** REPO-008-SVC  
**Pattern Ids:**
    
    - DomainModel
    
**Members:**
    
    - **Name:** Tenant  
**Type:** interface  
**Attributes:** export  
    - **Name:** TenantConfig  
**Type:** interface  
**Attributes:** export  
    - **Name:** AttendanceRecord  
**Type:** interface  
**Attributes:** export  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Data Contracts for Archival
    
**Requirement Ids:**
    
    - 6.3.2
    
**Purpose:** To provide strongly-typed representations of Firestore documents, ensuring data consistency and developer clarity when handling archival logic.  
**Logic Description:** This file contains exported TypeScript interfaces only. The Tenant interface includes tenantId. The TenantConfig interface includes dataRetentionDays. The AttendanceRecord interface mirrors the structure of a record in the attendance collection.  
**Documentation:**
    
    - **Summary:** This file serves as the single source of truth for the data structures of Tenant, TenantConfig, and AttendanceRecord entities within the context of the archival function.
    
**Namespace:** jobs.scheduled.dataArchival.domain  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** backend/functions/src/admin/archival/config/archival.config.ts  
**Description:** Contains static configuration and environment-specific settings for the data archival function. This externalizes tunable parameters from the core logic.  
**Template:** TypeScript Config Template  
**Dependency Level:** 0  
**Name:** archival.config  
**Type:** Configuration  
**Relative Path:** admin/archival/config/archival.config.ts  
**Repository Id:** REPO-008-SVC  
**Pattern Ids:**
    
    - Configuration
    
**Members:**
    
    - **Name:** SCHEDULE_CRON_EXPRESSION  
**Type:** string  
**Attributes:** export const  
    - **Name:** ARCHIVE_BATCH_SIZE  
**Type:** number  
**Attributes:** export const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Archival Job Configuration
    
**Requirement Ids:**
    
    - 6.3.2
    
**Purpose:** To centralize configuration values like the job's schedule and the batch size for processing records, allowing for easy adjustments without code changes.  
**Logic Description:** Exports constants for the archival job. SCHEDULE_CRON_EXPRESSION defines the daily run schedule (e.g., '0 2 * * *' for 2 AM daily). ARCHIVE_BATCH_SIZE defines how many records to process at once to manage memory usage.  
**Documentation:**
    
    - **Summary:** Provides configuration settings that control the execution schedule and performance parameters of the data archival and purging job.
    
**Namespace:** jobs.scheduled.dataArchival.config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/functions/src/admin/archival/utils/ndjson.formatter.ts  
**Description:** A utility module to format an array of attendance record objects into a Newline Delimited JSON (NDJSON) string, which is the required format for the archive files.  
**Template:** TypeScript Utility Template  
**Dependency Level:** 0  
**Name:** ndjson.formatter  
**Type:** Utility  
**Relative Path:** admin/archival/utils/ndjson.formatter.ts  
**Repository Id:** REPO-008-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** toNdjson  
**Parameters:**
    
    - records: any[]
    
**Return Type:** string  
**Attributes:** export function  
    
**Implemented Features:**
    
    - NDJSON Formatting
    
**Requirement Ids:**
    
    - 6.3.2
    
**Purpose:** To provide a reusable, single-purpose function for converting structured data into the NDJSON format required for storage archival.  
**Logic Description:** The toNdjson function will take an array of objects. It will map over the array, apply JSON.stringify to each object, and then join the resulting array of strings with a newline character ('\n').  
**Documentation:**
    
    - **Summary:** This utility handles the specific data formatting requirement for creating NDJSON archive files from an array of JavaScript objects.
    
**Namespace:** jobs.scheduled.dataArchival.utils  
**Metadata:**
    
    - **Category:** Utility
    
- **Path:** backend/functions/src/admin/archival/infrastructure/firestore.repository.ts  
**Description:** Provides an abstraction layer for all interactions with Firebase Firestore. It handles querying for tenants, configurations, and old attendance records, as well as the batch deletion of purged records.  
**Template:** TypeScript Repository Template  
**Dependency Level:** 1  
**Name:** firestore.repository  
**Type:** Repository  
**Relative Path:** admin/archival/infrastructure/firestore.repository.ts  
**Repository Id:** REPO-008-SVC  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** db  
**Type:** Firestore  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** getActiveTenants  
**Parameters:**
    
    
**Return Type:** Promise<Tenant[]>  
**Attributes:** public async  
    - **Name:** getTenantConfiguration  
**Parameters:**
    
    - tenantId: string
    
**Return Type:** Promise<TenantConfig | null>  
**Attributes:** public async  
    - **Name:** getArchivableAttendance  
**Parameters:**
    
    - tenantId: string
    - cutoffDate: Date
    - limit: number
    - startAfter?: DocumentSnapshot
    
**Return Type:** Promise<QuerySnapshot>  
**Attributes:** public async  
    - **Name:** purgeRecordsInBatch  
**Parameters:**
    
    - recordIds: { tenantId: string, recordId: string }[]
    
**Return Type:** Promise<void>  
**Attributes:** public async  
    
**Implemented Features:**
    
    - Tenant Data Fetching
    - Attendance Record Querying
    - Batch Record Deletion
    
**Requirement Ids:**
    
    - 6.3.2
    
**Purpose:** To encapsulate all Firestore-specific logic, allowing the application service to remain unaware of the underlying database implementation details.  
**Logic Description:** Implements methods using the Firebase Admin SDK for Firestore. getArchivableAttendance will use a where clause on the timestamp and orderBy/limit/startAfter for pagination. purgeRecordsInBatch will use Firestore's Batched Write feature to delete up to 500 documents atomically.  
**Documentation:**
    
    - **Summary:** Handles all database operations for the archival function, including retrieving necessary configuration and data, and performing the final data purge.
    
**Namespace:** jobs.scheduled.dataArchival.infrastructure  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/functions/src/admin/archival/infrastructure/storage.repository.ts  
**Description:** Provides an abstraction layer for all interactions with Firebase Storage. It handles the creation and writing of NDJSON archive files to the appropriate tenant-specific folder.  
**Template:** TypeScript Repository Template  
**Dependency Level:** 1  
**Name:** storage.repository  
**Type:** Repository  
**Relative Path:** admin/archival/infrastructure/storage.repository.ts  
**Repository Id:** REPO-008-SVC  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** storage  
**Type:** Storage  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** saveArchiveFile  
**Parameters:**
    
    - tenantId: string
    - fileName: string
    - fileContent: string
    
**Return Type:** Promise<void>  
**Attributes:** public async  
    
**Implemented Features:**
    
    - Archive File Writing
    
**Requirement Ids:**
    
    - 6.3.2
    
**Purpose:** To encapsulate all Firebase Storage logic, enabling the application service to save an archive file without knowing the implementation details.  
**Logic Description:** Implements methods using the Firebase Admin SDK for Cloud Storage. saveArchiveFile will construct the correct path (e.g., /{tenantId}/archives/{fileName}), get a file reference, and upload the provided NDJSON string content.  
**Documentation:**
    
    - **Summary:** Handles all file storage operations, specifically the writing of NDJSON formatted attendance data to a tenant's archive folder in Firebase Storage.
    
**Namespace:** jobs.scheduled.dataArchival.infrastructure  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/functions/src/admin/archival/application/archival.service.ts  
**Description:** The core application service that contains the business logic for the data archival process. It orchestrates the flow of fetching, formatting, archiving, and purging data by coordinating the infrastructure repositories.  
**Template:** TypeScript Service Template  
**Dependency Level:** 2  
**Name:** archival.service  
**Type:** Service  
**Relative Path:** admin/archival/application/archival.service.ts  
**Repository Id:** REPO-008-SVC  
**Pattern Ids:**
    
    - ApplicationService
    
**Members:**
    
    - **Name:** firestoreRepo  
**Type:** FirestoreRepository  
**Attributes:** private readonly  
    - **Name:** storageRepo  
**Type:** StorageRepository  
**Attributes:** private readonly  
    
**Methods:**
    
    - **Name:** executeArchivalProcess  
**Parameters:**
    
    
**Return Type:** Promise<void>  
**Attributes:** public async  
    - **Name:** processTenant  
**Parameters:**
    
    - tenant: Tenant
    
**Return Type:** Promise<void>  
**Attributes:** private async  
    
**Implemented Features:**
    
    - Data Retention Policy Enforcement
    
**Requirement Ids:**
    
    - 6.3.2
    
**Purpose:** To implement the end-to-end business workflow for archiving and purging old data, ensuring it's done transactionally and respecting each tenant's specific retention policy.  
**Logic Description:** executeArchivalProcess fetches all tenants and calls processTenant for each. processTenant gets the tenant's config, calculates the cutoff date, and paginates through old attendance records. For each batch, it formats data to NDJSON, saves to Storage, and on success, purges the records from Firestore. It includes robust error handling to prevent data loss if archival fails.  
**Documentation:**
    
    - **Summary:** This service orchestrates the entire data archival workflow, acting as the brain of the function. It uses the Firestore and Storage repositories to perform its tasks.
    
**Namespace:** jobs.scheduled.dataArchival.application  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** backend/functions/src/admin/archival/index.ts  
**Description:** The entry point for the DataArchivalEndpoint Cloud Function. This file defines the scheduled trigger and wires up the dependencies needed to run the archival service.  
**Template:** TypeScript Function Handler Template  
**Dependency Level:** 3  
**Name:** index  
**Type:** Handler  
**Relative Path:** admin/archival/index.ts  
**Repository Id:** REPO-008-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** scheduledDataArchival  
**Parameters:**
    
    - context: functions.pubsub.Context
    
**Return Type:** Promise<void>  
**Attributes:** export const  
    
**Implemented Features:**
    
    - Scheduled Function Trigger
    
**Requirement Ids:**
    
    - 6.3.2
    
**Purpose:** To declare the serverless function to the Firebase platform, configure its trigger (a daily schedule), and invoke the core business logic.  
**Logic Description:** This file uses the Firebase Functions SDK to export a scheduled function. The function is configured with a cron expression from the config file. Inside the onRun handler, it instantiates the repositories and the ArchivalService, then calls the service's executeArchivalProcess method. It includes top-level logging for job start/end and catches any unhandled exceptions.  
**Documentation:**
    
    - **Summary:** This is the cloud function handler. It is triggered by Google Cloud Scheduler and initiates the data archival and purging process by calling the ArchivalService.
    
**Namespace:** jobs.scheduled.dataArchival  
**Metadata:**
    
    - **Category:** ApplicationServices
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  - FIRESTORE_PROJECT_ID
  - STORAGE_BUCKET_URL
  


---


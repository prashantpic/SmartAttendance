# Specification

# 1. Files

- **Path:** backend/functions/src/integrations/sheets/package.json  
**Description:** Defines the Node.js project, its dependencies, and scripts for the GoogleSheetsSyncEndpoint function. It lists essential packages like 'firebase-functions', 'firebase-admin' for backend operations, and 'googleapis' for interacting with the Google Sheets API.  
**Template:** Node.js Package Template  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** package.json  
**Repository Id:** REPO-006-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Dependency Management
    
**Requirement Ids:**
    
    - 3.7
    
**Purpose:** Manages all project dependencies and scripts for the serverless function.  
**Logic Description:** Contains a 'dependencies' section for packages like 'firebase-functions', 'firebase-admin', and 'googleapis'. Includes a 'devDependencies' section for 'typescript', '@typescript-eslint/parser', 'eslint', etc. Defines 'scripts' for building, linting, and serving the function locally.  
**Documentation:**
    
    - **Summary:** Standard npm package file for the GoogleSheetsSyncEndpoint Cloud Function, declaring all required third-party libraries and development tools.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/functions/src/integrations/sheets/tsconfig.json  
**Description:** TypeScript compiler configuration for the function. It specifies how TypeScript files are compiled into JavaScript, including compiler options like target ECMAScript version, module system, and source map generation.  
**Template:** TypeScript Configuration Template  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** tsconfig.json  
**Repository Id:** REPO-006-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation
    
**Requirement Ids:**
    
    - 3.7
    
**Purpose:** Configures the TypeScript compiler to ensure code is transpiled correctly for the Node.js runtime environment of Cloud Functions.  
**Logic Description:** The 'compilerOptions' object will set 'module' to 'commonjs', 'target' to a suitable Node.js version (e.g., 'es2020'), 'outDir' to 'lib', and enable 'sourceMap' for easier debugging. The 'include' array will point to the 'src' directory.  
**Documentation:**
    
    - **Summary:** Defines the rules and settings for the TypeScript compiler, ensuring type safety and modern JavaScript output for the function's source code.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/functions/src/integrations/sheets/src/config.ts  
**Description:** Manages all environment-specific configuration and constants for the function. This includes the schedule for the cron job, region, Firestore collection names, and any other externalized settings.  
**Template:** TypeScript Configuration Template  
**Dependency Level:** 1  
**Name:** config  
**Type:** Configuration  
**Relative Path:** src/config.ts  
**Repository Id:** REPO-006-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Environment Configuration
    
**Requirement Ids:**
    
    - 3.7.3
    
**Purpose:** Provides a single, type-safe source for all configuration variables, abstracting them from the core business logic.  
**Logic Description:** Exports a configuration object. This object will read values from `functions.config()` or `process.env`. It will define constants for the function's region, the schedule (e.g., 'every 24 hours'), and names of Firestore collections like 'tenants' and 'attendance'.  
**Documentation:**
    
    - **Summary:** A centralized file for managing environment variables and application constants, promoting clean separation of configuration from code.
    
**Namespace:** jobs.scheduled.sheetsSync.config  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/functions/src/integrations/sheets/src/models/domain.model.ts  
**Description:** Defines the TypeScript interfaces for the core domain entities used in the sync process, such as Tenant, LinkedSheet, and AttendanceRecord. This ensures type safety and a clear data contract throughout the function.  
**Template:** TypeScript Model Template  
**Dependency Level:** 1  
**Name:** domain.model  
**Type:** Model  
**Relative Path:** src/models/domain.model.ts  
**Repository Id:** REPO-006-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Data Modeling
    
**Requirement Ids:**
    
    - 3.7.3
    
**Purpose:** Provides strict type definitions for Firestore documents and other data structures, enabling static analysis and reducing runtime errors.  
**Logic Description:** This file will export several interfaces. `interface LinkedSheet` will model the document in the `linkedSheets` collection, including `fileId`, `lastSyncStatus`, and `lastSyncTimestamp`. `interface AttendanceRecord` will model the relevant fields from an attendance document. `interface Tenant` will model the top-level tenant document.  
**Documentation:**
    
    - **Summary:** Contains TypeScript interfaces representing the shape of data retrieved from Firestore, ensuring type-safe interactions with the database.
    
**Namespace:** jobs.scheduled.sheetsSync.models  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** backend/functions/src/integrations/sheets/src/data/firestore.repository.ts  
**Description:** Encapsulates all interactions with the Firestore database. It provides high-level methods for querying and updating data related to the sync process, abstracting the low-level Firestore SDK calls.  
**Template:** TypeScript Repository Template  
**Dependency Level:** 2  
**Name:** firestore.repository  
**Type:** Repository  
**Relative Path:** src/data/firestore.repository.ts  
**Repository Id:** REPO-006-SVC  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** db  
**Type:** Firestore  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** getTenantsWithLinkedSheets  
**Parameters:**
    
    
**Return Type:** Promise<Tenant[]>  
**Attributes:** public  
    - **Name:** getNewApprovedAttendanceRecords  
**Parameters:**
    
    - tenantId: string
    - lastSyncTimestamp: Date
    
**Return Type:** Promise<AttendanceRecord[]>  
**Attributes:** public  
    - **Name:** updateSyncStatus  
**Parameters:**
    
    - tenantId: string
    - sheetId: string
    - status: 'Success' | 'Failed'
    - error?: string
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Firestore Data Access
    - Sync Status Management
    
**Requirement Ids:**
    
    - 3.7.3
    - 3.7.4
    - 3.7.5
    
**Purpose:** Provides a clean, testable interface for all database operations, separating data access logic from the main business workflow.  
**Logic Description:** Initializes the Firestore admin SDK. The `getTenantsWithLinkedSheets` method queries the `linkedSheets` collection across all tenants. The `getNewApprovedAttendanceRecords` method queries a specific tenant's `attendance` collection for records where `status` is 'Approved' and `serverSyncTimestamp` is after the last successful sync. `updateSyncStatus` updates the specified `LinkedSheet` document with the outcome of the sync operation.  
**Documentation:**
    
    - **Summary:** This repository handles all communication with Firestore, fetching tenants needing a sync, retrieving unsynced data, and updating sync metadata upon completion.
    
**Namespace:** jobs.scheduled.sheetsSync.data  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/functions/src/integrations/sheets/src/integrations/google-sheets.client.ts  
**Description:** A client responsible for all communication with the Google Sheets and Google Drive APIs. It handles authentication, fetching sheet headers, and appending data, including implementing robust error handling and retry logic.  
**Template:** TypeScript Service Template  
**Dependency Level:** 2  
**Name:** google-sheets.client  
**Type:** Service  
**Relative Path:** src/integrations/google-sheets.client.ts  
**Repository Id:** REPO-006-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** sheets  
**Type:** sheets_v4.Sheets  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** initialize  
**Parameters:**
    
    
**Return Type:** Promise<void>  
**Attributes:** private  
    - **Name:** getSheetHeaders  
**Parameters:**
    
    - fileId: string
    
**Return Type:** Promise<string[]>  
**Attributes:** public  
    - **Name:** appendRows  
**Parameters:**
    
    - fileId: string
    - rows: any[][]
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - Google Sheets API Integration
    - API Error Handling
    - Exponential Backoff Retry
    
**Requirement Ids:**
    
    - 3.7.3
    - 3.7.4
    - 3.7.5
    
**Purpose:** Abstracts the complexity of the Google APIs into a simple, reusable client, making it easy to interact with Google Sheets from the core application logic.  
**Logic Description:** This client class will use the 'googleapis' library. The `initialize` method will handle OAuth 2.0 authentication using a service account. The `getSheetHeaders` method reads the first row of the sheet to get the column headers. The `appendRows` method uses the `spreadsheets.values.append` API call to add data. All public methods will be wrapped in an exponential backoff retry mechanism to handle transient API errors.  
**Documentation:**
    
    - **Summary:** Provides a dedicated client for interacting with Google Sheets, handling authentication, data retrieval (headers), and data writing (appending rows).
    
**Namespace:** jobs.scheduled.sheetsSync.integrations  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/functions/src/integrations/sheets/src/utils/data.mapper.ts  
**Description:** A utility responsible for transforming the array of Firestore AttendanceRecord objects into a two-dimensional array of values suitable for the Google Sheets API. It uses the sheet's headers to ensure data is mapped to the correct columns, regardless of their order.  
**Template:** TypeScript Utility Template  
**Dependency Level:** 3  
**Name:** data.mapper  
**Type:** Utility  
**Relative Path:** src/utils/data.mapper.ts  
**Repository Id:** REPO-006-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** mapAttendanceToSheetRows  
**Parameters:**
    
    - records: AttendanceRecord[]
    - headers: string[]
    
**Return Type:** any[][]  
**Attributes:** export  
    
**Implemented Features:**
    
    - Data Transformation
    - Column Reordering Resilience
    
**Requirement Ids:**
    
    - 3.7.3
    
**Purpose:** Decouples the Firestore data model from the Google Sheets data format, providing the resilience to column reordering required by the business rules.  
**Logic Description:** The `mapAttendanceToSheetRows` function will iterate through each `AttendanceRecord`. For each record, it will create an array whose order matches the `headers` array. It will look up each header name (e.g., 'UserID', 'CheckInTimestamp') and find the corresponding value in the `AttendanceRecord` object, placing it in the correct position in the output row array. If a header is not found in the record, it will insert a blank value.  
**Documentation:**
    
    - **Summary:** This mapper utility transforms an array of attendance records into a 2D array format, dynamically ordering the data to match the column headers found in the target Google Sheet.
    
**Namespace:** jobs.scheduled.sheetsSync.utils  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** backend/functions/src/integrations/sheets/src/services/sheets-sync.service.ts  
**Description:** The core application service that orchestrates the entire synchronization workflow. It fetches tenants, retrieves unsynced data, calls the Google Sheets client, maps data, and updates the final status in Firestore.  
**Template:** TypeScript Service Template  
**Dependency Level:** 4  
**Name:** sheets-sync.service  
**Type:** Service  
**Relative Path:** src/services/sheets-sync.service.ts  
**Repository Id:** REPO-006-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** firestoreRepo  
**Type:** FirestoreRepository  
**Attributes:** private|readonly  
    - **Name:** sheetsClient  
**Type:** GoogleSheetsClient  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** runSync  
**Parameters:**
    
    
**Return Type:** Promise<void>  
**Attributes:** public  
    - **Name:** syncTenant  
**Parameters:**
    
    - tenant: Tenant
    
**Return Type:** Promise<void>  
**Attributes:** private  
    
**Implemented Features:**
    
    - Scheduled Job Orchestration
    - Per-Tenant Sync Logic
    - Idempotency Management
    
**Requirement Ids:**
    
    - 3.7.3
    - 3.7.4
    - 3.7.5
    
**Purpose:** Contains the primary business logic for the scheduled job, ensuring a clean separation from the function's entry point and data access layers.  
**Logic Description:** The `runSync` method gets all tenants with linked sheets from `firestore.repository`. It then iterates through each tenant and calls `syncTenant` for each one, wrapping the call in a try/catch to ensure one tenant's failure doesn't stop the whole job. The `syncTenant` method gets unsynced records, gets sheet headers, maps the data using `data.mapper`, appends it using `sheetsClient`, and finally updates the sync status using `firestore.repository`. It handles and logs errors appropriately, distinguishing between transient and terminal failures.  
**Documentation:**
    
    - **Summary:** Orchestrates the entire data synchronization process. It fetches tenants, processes records for each, interacts with Google Sheets, and logs the outcome.
    
**Namespace:** jobs.scheduled.sheetsSync.services  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** backend/functions/src/integrations/sheets/src/index.ts  
**Description:** The main entry point for the Firebase Cloud Function. This file defines the scheduled trigger and invokes the core orchestration service to perform the data sync.  
**Template:** TypeScript Cloud Function Template  
**Dependency Level:** 5  
**Name:** index  
**Type:** Controller  
**Relative Path:** src/index.ts  
**Repository Id:** REPO-006-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Scheduled Function Trigger
    
**Requirement Ids:**
    
    - 3.7.3
    
**Purpose:** Defines the serverless function, its trigger, and connects it to the application's business logic, acting as the composition root.  
**Logic Description:** Initializes the Firebase Admin SDK. Exports a Cloud Function using `functions.pubsub.schedule().onRun()`. The schedule string will be imported from the `config` file. The function handler will instantiate the `SheetsSyncService` and call its `runSync()` method. It will include top-level error handling to catch any unhandled exceptions from the service.  
**Documentation:**
    
    - **Summary:** This file is the entry point for the GoogleSheetsSyncEndpoint. It is triggered on a predefined schedule and initiates the data synchronization process.
    
**Namespace:** jobs.scheduled.sheetsSync  
**Metadata:**
    
    - **Category:** ApplicationServices
    


---

# 2. Configuration

- **Feature Toggles:**
  
  - enableDetailedLogging
  
- **Database Configs:**
  
  


---


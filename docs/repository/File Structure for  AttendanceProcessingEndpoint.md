# Specification

# 1. Files

- **Path:** backend/functions/package.json  
**Description:** Defines the Node.js project, manages dependencies, and lists scripts for running, building, and deploying the Firebase Functions. It includes dependencies for Firebase services, Google Maps API, and TypeScript.  
**Template:** Node.js Package  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** package.json  
**Repository Id:** REPO-004-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - DependencyManagement
    
**Requirement Ids:**
    
    - REQ-ATT-005
    - REQ-MTDM-005
    
**Purpose:** To declare project dependencies like 'firebase-functions', 'firebase-admin', '@googlemaps/google-maps-services-js', and 'typescript', and to define scripts for development and deployment.  
**Logic Description:** This is a configuration file. It will contain a 'dependencies' object for production packages, a 'devDependencies' object for development tools, and a 'scripts' object for commands like 'build', 'serve', and 'deploy'. The 'main' entry will point to the compiled JavaScript output in the 'lib' directory.  
**Documentation:**
    
    - **Summary:** Standard Node.js manifest file for the Firebase Functions backend. It lists all necessary third-party libraries required for the functions to operate and provides command-line shortcuts for common development tasks.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/functions/tsconfig.json  
**Description:** TypeScript compiler configuration file. It specifies the root files and the compiler options required to compile the TypeScript project into JavaScript that can be executed by the Node.js runtime in the Firebase environment.  
**Template:** TypeScript Configuration  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** tsconfig.json  
**Repository Id:** REPO-004-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScriptCompilation
    
**Requirement Ids:**
    
    
**Purpose:** To configure the TypeScript compiler with settings for module system (CommonJS), target ECMAScript version, output directory ('lib'), and source map generation.  
**Logic Description:** This is a configuration file. It will set 'module' to 'commonjs', 'target' to a suitable ECMAScript version (e.g., 'es2020'), enable 'sourceMap', and specify the 'outDir' as 'lib'. The 'include' property will point to the 'src' directory.  
**Documentation:**
    
    - **Summary:** Configuration file that dictates how TypeScript code in the 'src' folder is transpiled into JavaScript. It ensures code compatibility with the Firebase Functions runtime and enables features like source maps for easier debugging.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/functions/src/core/firebase.ts  
**Description:** Initializes the Firebase Admin SDK singleton instance. This centralized initialization prevents multiple initializations and provides a consistent, configured instance for all other modules to use for interacting with Firebase services.  
**Template:** TypeScript Service  
**Dependency Level:** 0  
**Name:** firebase  
**Type:** Configuration  
**Relative Path:** core/firebase.ts  
**Repository Id:** REPO-004-SVC  
**Pattern Ids:**
    
    - Singleton
    
**Members:**
    
    - **Name:** admin  
**Type:** admin.app.App  
**Attributes:** public|const  
    - **Name:** db  
**Type:** admin.firestore.Firestore  
**Attributes:** public|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - FirebaseAdminInitialization
    
**Requirement Ids:**
    
    
**Purpose:** To initialize the Firebase Admin SDK using `admin.initializeApp()` and export the configured `admin` and `db` instances for use across the application.  
**Logic Description:** Import the 'firebase-admin' package. Call `admin.initializeApp()` once at the top level of the module. Export the result and a constant for the Firestore database instance (`admin.firestore()`). This ensures a single connection pool and authenticated instance is used by all functions.  
**Documentation:**
    
    - **Summary:** Provides a single point of entry for Firebase Admin SDK access. It initializes the connection to the project's Firebase backend, allowing server-side code to interact with services like Firestore with administrative privileges.
    
**Namespace:** core  
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/functions/src/core/models.ts  
**Description:** Contains TypeScript interfaces and types for the core data models used across different functions, such as User and Attendance. This promotes type safety and code reusability.  
**Template:** TypeScript Model  
**Dependency Level:** 0  
**Name:** models  
**Type:** Model  
**Relative Path:** core/models.ts  
**Repository Id:** REPO-004-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - DataModeling
    
**Requirement Ids:**
    
    
**Purpose:** To define the data structures for User and Attendance documents as they exist in Firestore, ensuring that all parts of the application agree on the shape of the data.  
**Logic Description:** Define and export a 'User' interface with fields like 'userId', 'supervisorId', 'role'. Define and export an 'Attendance' interface with fields like 'userId', 'checkInLocation', and the fields to be added by the function: 'serverSyncTimestamp', 'approverHierarchy', 'checkInAddress'.  
**Documentation:**
    
    - **Summary:** A central file for all Firestore data model type definitions. Provides strongly-typed objects for user and attendance records, which improves developer experience and reduces runtime errors.
    
**Namespace:** core.models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/functions/src/attendance/hierarchy.service.ts  
**Description:** Encapsulates the business logic for determining a user's supervisory chain. This service is responsible for traversing the user hierarchy in Firestore to build the 'approverHierarchy' array.  
**Template:** TypeScript Service  
**Dependency Level:** 1  
**Name:** HierarchyService  
**Type:** Service  
**Relative Path:** attendance/hierarchy.service.ts  
**Repository Id:** REPO-004-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** db  
**Type:** admin.firestore.Firestore  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** buildApproverHierarchy  
**Parameters:**
    
    - tenantId: string
    - userId: string
    
**Return Type:** Promise<string[]>  
**Attributes:** public|async  
    
**Implemented Features:**
    
    - ApproverHierarchyCalculation
    
**Requirement Ids:**
    
    - REQ-ATT-005
    - REQ-MTDM-005
    
**Purpose:** To provide a reusable and testable service that takes a user ID and returns an ordered array of their supervisors' IDs.  
**Logic Description:** The `buildApproverHierarchy` method will fetch the user document for the given `userId`. It will then recursively fetch the `supervisorId` from each user document until it reaches the top of the hierarchy (a user with no supervisor). It will collect all supervisor IDs in an array, ensuring a depth limit to prevent infinite loops in case of data misconfiguration. The resulting array of supervisor IDs is then returned.  
**Documentation:**
    
    - **Summary:** This service is responsible for the complex task of calculating a user's entire management chain. It queries the 'users' collection to build this hierarchy, which is a critical piece of data for enabling efficient approval workflow queries.
    
**Namespace:** services.attendance  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** backend/functions/src/attendance/geocoding.service.ts  
**Description:** A wrapper service for the Google Maps Geocoding API. It isolates the third-party API interaction, making it easy to manage, mock for testing, and potentially replace in the future.  
**Template:** TypeScript Service  
**Dependency Level:** 1  
**Name:** GeocodingService  
**Type:** Service  
**Relative Path:** attendance/geocoding.service.ts  
**Repository Id:** REPO-004-SVC  
**Pattern Ids:**
    
    - Adapter
    
**Members:**
    
    - **Name:** mapsClient  
**Type:** Client  
**Attributes:** private|readonly  
    
**Methods:**
    
    - **Name:** getAddressFromCoordinates  
**Parameters:**
    
    - location: admin.firestore.GeoPoint
    
**Return Type:** Promise<string | null>  
**Attributes:** public|async  
    
**Implemented Features:**
    
    - ReverseGeocoding
    
**Requirement Ids:**
    
    - REQ-ATT-005
    
**Purpose:** To convert GPS coordinates (GeoPoint) into a human-readable address string by calling the Google Maps API.  
**Logic Description:** The `getAddressFromCoordinates` method will instantiate the Google Maps client with an API key. It will then call the `reverseGeocode` method from the client library, passing in the latitude and longitude from the GeoPoint. It will parse the response to extract the first, most relevant formatted address. It will handle potential API errors and return null if no address is found.  
**Documentation:**
    
    - **Summary:** This service provides a clean interface for performing reverse geocoding lookups. It takes a GeoPoint as input and returns a formatted address string as output, abstracting the details of the Google Maps API call.
    
**Namespace:** services.attendance  
**Metadata:**
    
    - **Category:** Integration
    
- **Path:** backend/functions/src/attendance/on-create.ts  
**Description:** The primary Cloud Function handler. It is triggered when a new attendance document is created in Firestore. It orchestrates the data enrichment process by using the hierarchy and geocoding services.  
**Template:** TypeScript Cloud Function  
**Dependency Level:** 2  
**Name:** onAttendanceCreate  
**Type:** Controller  
**Relative Path:** attendance/on-create.ts  
**Repository Id:** REPO-004-SVC  
**Pattern Ids:**
    
    - EventDriven
    
**Members:**
    
    
**Methods:**
    
    - **Name:** handler  
**Parameters:**
    
    - snap: functions.firestore.DocumentSnapshot
    - context: functions.EventContext
    
**Return Type:** Promise<void>  
**Attributes:** public  
    
**Implemented Features:**
    
    - AttendanceDataAugmentation
    
**Requirement Ids:**
    
    - REQ-ATT-005
    - REQ-MTDM-005
    
**Purpose:** To augment new attendance records with server-generated data, ensuring data consistency and offloading logic from the client.  
**Logic Description:** The handler will first extract the new attendance data and context parameters (tenantId, attendanceId). It will check if the 'serverSyncTimestamp' field already exists to ensure idempotency. If not, it will call the `HierarchyService` and `GeocodingService` concurrently using `Promise.all`. Once both promises resolve, it constructs an update payload containing the server timestamp, the approver hierarchy array, and the geocoded address. Finally, it performs an atomic update on the original document in Firestore.  
**Documentation:**
    
    - **Summary:** This file contains the core logic for the 'AttendanceProcessingEndpoint'. It listens for new attendance records and enriches them with a server timestamp, the user's full approval hierarchy, and a reverse-geocoded address. This process is critical for the functioning of the supervisor approval workflow.
    
**Namespace:** functions.attendance  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** backend/functions/src/index.ts  
**Description:** The main entry point for deploying Firebase Functions. This file imports all function handlers, configures their triggers, and exports them so the Firebase CLI can deploy them to the cloud environment.  
**Template:** TypeScript Cloud Function Index  
**Dependency Level:** 3  
**Name:** index  
**Type:** Entrypoint  
**Relative Path:** index.ts  
**Repository Id:** REPO-004-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - FunctionDeployment
    
**Requirement Ids:**
    
    - REQ-ATT-005
    - REQ-MTDM-005
    
**Purpose:** To define and export the 'onAttendanceCreate' Cloud Function with its specific Firestore trigger.  
**Logic Description:** Import 'firebase-functions' and the handler from './attendance/on-create.ts'. Initialize the Firebase Admin SDK by importing from './core/firebase.ts'. Define and export a new function, e.g., `export const onAttendanceCreate = functions.firestore.document('tenants/{tenantId}/attendance/{attendanceId}').onCreate(handler);`. This line registers the `handler` function to be executed on the specified event.  
**Documentation:**
    
    - **Summary:** The root file that Firebase uses to discover and deploy all the backend Cloud Functions. It wires up the `onAttendanceCreate` logic to the correct Firestore document path and trigger event (`onCreate`).
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  - GOOGLE_MAPS_API_KEY
  


---


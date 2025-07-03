# Specification

# 1. Files

- **Path:** backend/functions/src/user/import/index.ts  
**Description:** Main entry point for the Firebase Functions within this feature directory. This file imports and exports the user import Cloud Function, making it discoverable by the Firebase deployment tooling.  
**Template:** Node.js Module  
**Dependency Level:** 4  
**Name:** index  
**Type:** Index  
**Relative Path:** user/import/  
**Repository Id:** REPO-007-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Function Export
    
**Requirement Ids:**
    
    - 4.2
    
**Purpose:** Aggregates and exports all Cloud Function triggers defined in this module for deployment.  
**Logic Description:** The file will contain a single export statement for the 'onUserCsvUpload' function handler. This follows the standard Firebase Functions pattern for organizing code into separate modules.  
**Documentation:**
    
    - **Summary:** This file acts as the primary export manifest for the user import feature's Cloud Functions.
    
**Namespace:** functions.user.import  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** backend/functions/src/user/import/handler.ts  
**Description:** Defines the Cloud Storage triggered Firebase Function. This is the entry point that reacts to a CSV file being uploaded. It orchestrates the entire user import process by calling the application service.  
**Template:** Node.js Module  
**Dependency Level:** 3  
**Name:** handler  
**Type:** Handler  
**Relative Path:** user/import/  
**Repository Id:** REPO-007-SVC  
**Pattern Ids:**
    
    - EventDriven
    
**Members:**
    
    
**Methods:**
    
    - **Name:** onUserCsvUpload  
**Parameters:**
    
    - object: ObjectMetadata
    
**Return Type:** Promise<void>  
**Attributes:** export const  
    
**Implemented Features:**
    
    - CSV Upload Trigger
    - Orchestration of User Import
    
**Requirement Ids:**
    
    - 4.2.2
    
**Purpose:** This file contains the Cloud Function trigger logic. It parses event metadata to get the file path and tenant context, then invokes the main application service to handle the import.  
**Logic Description:** The function will be an 'onFinalize' trigger for Cloud Storage. It extracts the file path and tenantId from the object metadata. It then instantiates the UserImportService and calls its 'processImport' method, passing the file details. It includes top-level error handling to log any failures during the orchestration.  
**Documentation:**
    
    - **Summary:** Receives a Firebase Storage event upon CSV file upload. It is responsible for initiating the user import workflow and handling its overall success or failure.
    
**Namespace:** functions.user.import  
**Metadata:**
    
    - **Category:** ApplicationServices
    
- **Path:** backend/functions/src/user/import/application/user-import.service.ts  
**Description:** The application service layer that coordinates the user import use case. It orchestrates the flow of data between infrastructure services (parsing, storage) and the core domain logic.  
**Template:** Node.js Module  
**Dependency Level:** 2  
**Name:** user-import.service  
**Type:** Service  
**Relative Path:** user/import/application/  
**Repository Id:** REPO-007-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** storageService  
**Type:** StorageService  
**Attributes:** private readonly  
    - **Name:** csvParserService  
**Type:** CsvParserService  
**Attributes:** private readonly  
    - **Name:** userRepository  
**Type:** UserRepository  
**Attributes:** private readonly  
    
**Methods:**
    
    - **Name:** processImport  
**Parameters:**
    
    - filePath: string
    - tenantId: string
    
**Return Type:** Promise<void>  
**Attributes:** public async  
    
**Implemented Features:**
    
    - User Import Orchestration
    - Validation Report Generation
    
**Requirement Ids:**
    
    - 4.2.2
    - 4.2.3
    
**Purpose:** Orchestrates the entire user import process: retrieving the CSV, parsing it, passing data to the domain for validation, saving valid users, and generating and storing the final report.  
**Logic Description:** The 'processImport' method will use the StorageService to get a stream of the uploaded CSV. It passes this stream to the CsvParserService. The resulting records are then processed by the core domain logic. It fetches existing users via the UserRepository to validate supervisors. Valid new users are batch-created via the UserRepository. Finally, it uses the StorageService again to upload the generated validation report.  
**Documentation:**
    
    - **Summary:** This service acts as the central coordinator for the user import feature, ensuring all steps are executed in the correct order.
    
**Namespace:** functions.user.import.application  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** backend/functions/src/user/import/domain/user-importer.ts  
**Description:** Contains the pure, stateless business logic for validating a batch of user records. It is completely independent of Firebase or other infrastructure concerns, making it highly testable.  
**Template:** Node.js Module  
**Dependency Level:** 1  
**Name:** user-importer  
**Type:** DomainService  
**Relative Path:** user/import/domain/  
**Repository Id:** REPO-007-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** validateAndPrepareUsers  
**Parameters:**
    
    - csvRecords: CsvRecordDto[]
    - existingUsers: User[]
    - tenantId: string
    
**Return Type:** { validUsers: UserPayloadDto[], report: ValidationReport }  
**Attributes:** public  
    
**Implemented Features:**
    
    - User Data Validation
    - Hierarchy Building Logic
    - Report Data Aggregation
    
**Requirement Ids:**
    
    - 4.2.1
    - 4.2.2
    - 4.2.3
    
**Purpose:** Encapsulates the core business rules for user import, such as validating email formats, checking for duplicates, and resolving supervisor relationships. It produces a list of users ready for persistence and a detailed validation report.  
**Logic Description:** This service iterates through each CSV record. It performs validation checks: non-empty name, valid email format, and checks for email uniqueness against the existing user list and other records in the same batch. It resolves the 'supervisorEmail' to a 'supervisorId'. Records that pass validation are added to the 'validUsers' array with status 'Invited'. Failed records are added to the validation report with a clear reason.  
**Documentation:**
    
    - **Summary:** The heart of the import logic. It takes raw records and existing system state and applies business rules to produce a clean set of users to be created and a report of any issues.
    
**Namespace:** functions.user.import.domain  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** backend/functions/src/user/import/infrastructure/firestore.repository.ts  
**Description:** An adapter for interacting with the Firestore database. It abstracts away Firestore-specific API calls for creating and querying user documents.  
**Template:** Node.js Module  
**Dependency Level:** 0  
**Name:** firestore.repository  
**Type:** Repository  
**Relative Path:** user/import/infrastructure/  
**Repository Id:** REPO-007-SVC  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** db  
**Type:** Firestore  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** getAllUsersByTenant  
**Parameters:**
    
    - tenantId: string
    
**Return Type:** Promise<User[]>  
**Attributes:** public async  
    - **Name:** batchCreateUsers  
**Parameters:**
    
    - users: UserPayloadDto[]
    - tenantId: string
    
**Return Type:** Promise<void>  
**Attributes:** public async  
    
**Implemented Features:**
    
    - User Data Retrieval
    - Bulk User Creation
    
**Requirement Ids:**
    
    - 4.2.2
    
**Purpose:** Provides a clean, testable interface for all database operations related to the user import process, specifically fetching existing users for validation and creating new ones in a batch.  
**Logic Description:** The 'getAllUsersByTenant' method queries the '/tenants/{tenantId}/users' collection. The 'batchCreateUsers' method uses Firestore's 'WriteBatch' to atomically create multiple user documents. This ensures that either all valid users from the CSV are created or none are, preventing partial imports.  
**Documentation:**
    
    - **Summary:** Handles all communication with the Firestore database for the user import feature. Its methods provide an abstraction over low-level Firestore queries and commands.
    
**Namespace:** functions.user.import.infrastructure  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/functions/src/user/import/infrastructure/storage.service.ts  
**Description:** An adapter for interacting with Firebase Cloud Storage. It handles downloading the uploaded CSV and uploading the generated validation report.  
**Template:** Node.js Module  
**Dependency Level:** 0  
**Name:** storage.service  
**Type:** Service  
**Relative Path:** user/import/infrastructure/  
**Repository Id:** REPO-007-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** storage  
**Type:** Storage  
**Attributes:** private  
    
**Methods:**
    
    - **Name:** getFileStream  
**Parameters:**
    
    - filePath: string
    
**Return Type:** Readable  
**Attributes:** public  
    - **Name:** uploadReport  
**Parameters:**
    
    - report: ValidationReport
    - originalFilePath: string
    
**Return Type:** Promise<void>  
**Attributes:** public async  
    
**Implemented Features:**
    
    - File Download
    - Report Upload
    
**Requirement Ids:**
    
    - 4.2.2
    - 4.2.3
    
**Purpose:** Abstracts all Cloud Storage operations, providing simple methods to get a file as a readable stream and to upload the JSON validation report.  
**Logic Description:** The 'getFileStream' method gets the appropriate bucket and file reference from the file path and returns 'file.createReadStream()'. The 'uploadReport' method will serialize the report object to a JSON string and upload it to a specific 'reports' subfolder in the same location as the original upload, using a filename convention like 'original-file-report.json'.  
**Documentation:**
    
    - **Summary:** Manages file I/O with Cloud Storage. It retrieves the source CSV for processing and stores the resulting validation report for the Admin.
    
**Namespace:** functions.user.import.infrastructure  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/functions/src/user/import/infrastructure/csv-parser.service.ts  
**Description:** A service that wraps the 'csv-parse' library to provide a simple, promise-based interface for parsing a CSV stream into an array of structured objects.  
**Template:** Node.js Module  
**Dependency Level:** 0  
**Name:** csv-parser.service  
**Type:** Service  
**Relative Path:** user/import/infrastructure/  
**Repository Id:** REPO-007-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** parseCsvStream  
**Parameters:**
    
    - stream: Readable
    
**Return Type:** Promise<CsvRecordDto[]>  
**Attributes:** public  
    
**Implemented Features:**
    
    - CSV Parsing
    
**Requirement Ids:**
    
    - 4.2.1
    - 4.2.2
    
**Purpose:** Decouples the application from the specific CSV parsing library, handling the configuration and stream processing required to convert CSV data into a usable format.  
**Logic Description:** This service takes a readable stream as input. It configures the 'csv-parse' library to use headers, skip empty lines, and trim whitespace. It pipes the input stream to the parser and collects the resulting data records into an array, which is returned via a Promise upon completion.  
**Documentation:**
    
    - **Summary:** Transforms a raw CSV file stream into a structured array of DTOs, ready for business logic processing.
    
**Namespace:** functions.user.import.infrastructure  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/functions/src/user/import/interfaces/csv-record.dto.ts  
**Description:** Defines the data transfer object (DTO) for a single, parsed record from the uploaded CSV file.  
**Template:** Node.js Module  
**Dependency Level:** 0  
**Name:** csv-record.dto  
**Type:** DTO  
**Relative Path:** user/import/interfaces/  
**Repository Id:** REPO-007-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** name  
**Type:** string  
**Attributes:** public  
    - **Name:** email  
**Type:** string  
**Attributes:** public  
    - **Name:** supervisorEmail  
**Type:** string  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - CSV Data Contract
    
**Requirement Ids:**
    
    - 4.2.1
    
**Purpose:** Provides a typed interface for CSV records, ensuring data consistency after parsing and before being passed to the domain logic.  
**Logic Description:** This is a simple interface or class definition that declares the expected properties and their types, corresponding to the required headers in the CSV template.  
**Documentation:**
    
    - **Summary:** Represents the data structure of one row in the user import CSV file.
    
**Namespace:** functions.user.import.interfaces  
**Metadata:**
    
    - **Category:** Model
    
- **Path:** backend/functions/src/user/import/interfaces/user-payload.dto.ts  
**Description:** Defines the data transfer object (DTO) for a new user that is ready to be persisted to Firestore.  
**Template:** Node.js Module  
**Dependency Level:** 0  
**Name:** user-payload.dto  
**Type:** DTO  
**Relative Path:** user/import/interfaces/  
**Repository Id:** REPO-007-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** name  
**Type:** string  
**Attributes:** public  
    - **Name:** email  
**Type:** string  
**Attributes:** public  
    - **Name:** supervisorId  
**Type:** string | null  
**Attributes:** public  
    - **Name:** role  
**Type:** 'Subordinate' | 'Supervisor'  
**Attributes:** public  
    - **Name:** status  
**Type:** 'Invited'  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - User Creation Data Contract
    
**Requirement Ids:**
    
    - 4.2.2
    
**Purpose:** Defines the precise shape and data types for a new user document, ensuring that only validated and correctly structured data is sent to the Firestore repository.  
**Logic Description:** A TypeScript interface or class that specifies the fields required to create a new user document in the database, including the resolved supervisorId and the default 'Invited' status.  
**Documentation:**
    
    - **Summary:** Represents the data payload for creating a new user document in Firestore.
    
**Namespace:** functions.user.import.interfaces  
**Metadata:**
    
    - **Category:** Model
    
- **Path:** backend/functions/src/user/import/interfaces/validation-report.dto.ts  
**Description:** Defines the structure for the validation report that is generated after the import process.  
**Template:** Node.js Module  
**Dependency Level:** 0  
**Name:** validation-report.dto  
**Type:** DTO  
**Relative Path:** user/import/interfaces/  
**Repository Id:** REPO-007-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** summary  
**Type:** { totalRecords: number; successful: number; failed: number; }  
**Attributes:** public  
    - **Name:** errors  
**Type:** { record: CsvRecordDto; reason: string; }[]  
**Attributes:** public  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Report Data Contract
    
**Requirement Ids:**
    
    - 4.2.3
    
**Purpose:** Provides a typed interface for the validation report, ensuring a consistent and predictable structure for the JSON file that will be saved to Cloud Storage for the Admin.  
**Logic Description:** A TypeScript interface defining the report's structure, including a summary section with counts and a detailed errors array, where each entry contains the problematic record and a human-readable failure reason.  
**Documentation:**
    
    - **Summary:** Represents the final output report detailing the successful and failed records from the user import process.
    
**Namespace:** functions.user.import.interfaces  
**Metadata:**
    
    - **Category:** Model
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  


---


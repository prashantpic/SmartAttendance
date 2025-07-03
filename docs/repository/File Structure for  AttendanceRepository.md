# Specification

# 1. Files

- **Path:** mobile/lib/data/models/attendance_model.dart  
**Description:** Data Transfer Object (DTO) for an attendance record. This model includes serialization logic (fromJson, toJson) for interaction with both Firestore and the local Hive database. It represents the data structure for attendance, including timestamps, location, status, and sync information.  
**Template:** Flutter Model Template  
**Dependency Level:** 0  
**Name:** AttendanceModel  
**Type:** Model  
**Relative Path:** data/models  
**Repository Id:** REPO-003-DAT  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** attendanceId  
**Type:** String  
**Attributes:** final  
    - **Name:** userId  
**Type:** String  
**Attributes:** final  
    - **Name:** userName  
**Type:** String  
**Attributes:** final  
    - **Name:** eventId  
**Type:** String?  
**Attributes:** final  
    - **Name:** clientCheckInTimestamp  
**Type:** DateTime  
**Attributes:** final  
    - **Name:** clientCheckOutTimestamp  
**Type:** DateTime?  
**Attributes:** final  
    - **Name:** checkInLocation  
**Type:** GeoPoint  
**Attributes:** final  
    - **Name:** checkOutLocation  
**Type:** GeoPoint?  
**Attributes:** final  
    - **Name:** status  
**Type:** String  
**Attributes:** final  
    - **Name:** syncStatus  
**Type:** String  
**Attributes:** final  
    - **Name:** isOutsideGeofence  
**Type:** bool  
**Attributes:** final  
    - **Name:** deviceInfo  
**Type:** Map<String, dynamic>  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** fromFirestore  
**Parameters:**
    
    - DocumentSnapshot doc
    
**Return Type:** AttendanceModel  
**Attributes:** static  
    - **Name:** fromJson  
**Parameters:**
    
    - Map<String, dynamic> json
    
**Return Type:** AttendanceModel  
**Attributes:** static  
    - **Name:** toJson  
**Parameters:**
    
    
**Return Type:** Map<String, dynamic>  
**Attributes:** public  
    - **Name:** copyWith  
**Parameters:**
    
    - various optional fields
    
**Return Type:** AttendanceModel  
**Attributes:** public  
    
**Implemented Features:**
    
    - Attendance Data Modeling
    - Serialization
    
**Requirement Ids:**
    
    - REQ-ATT-002
    - REQ-ATT-004
    - REQ-ATT-007
    
**Purpose:** Defines the structure and serialization/deserialization logic for attendance records, ensuring data consistency between the application, Firestore, and the local Hive cache.  
**Logic Description:** The model class should extend Equatable for value comparison. It must contain factory constructors `fromJson` and `fromFirestore` to handle data from different sources, and a `toJson` method for writing data. The `copyWith` method is essential for updating instances of the model immutably, which is a best practice in state management.  
**Documentation:**
    
    - **Summary:** This file defines the `AttendanceModel`, which serves as the data structure for all attendance-related information. It includes methods for converting the model to and from JSON/Firestore formats, facilitating data persistence and transfer.
    
**Namespace:** app.data.models  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** mobile/lib/data/datasources/attendance_remote_data_source.dart  
**Description:** Defines the contract for the remote attendance data source, typically Firestore. This abstraction ensures that the repository is decoupled from the specific implementation of the remote data store, improving testability and maintainability.  
**Template:** Flutter Interface Template  
**Dependency Level:** 1  
**Name:** AttendanceRemoteDataSource  
**Type:** Interface  
**Relative Path:** data/datasources  
**Repository Id:** REPO-003-DAT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** createOrUpdateAttendanceRecord  
**Parameters:**
    
    - AttendanceModel record
    
**Return Type:** Future<void>  
**Attributes:** abstract  
    - **Name:** getAttendanceHistoryStream  
**Parameters:**
    
    - String userId
    
**Return Type:** Stream<List<AttendanceModel>>  
**Attributes:** abstract  
    - **Name:** getActiveAttendanceRecordStream  
**Parameters:**
    
    - String userId
    
**Return Type:** Stream<AttendanceModel?>  
**Attributes:** abstract  
    
**Implemented Features:**
    
    - Remote Data Source Abstraction
    
**Requirement Ids:**
    
    
**Purpose:** Specifies the required methods for any remote data source implementation that handles attendance records, primarily focusing on create, update, and read operations.  
**Logic Description:** This abstract class serves as an interface. It defines the public methods that `FirestoreAttendanceDataSourceImpl` will implement. The methods should return `Future` or `Stream` to handle asynchronous data operations from Firestore.  
**Documentation:**
    
    - **Summary:** This file declares the `AttendanceRemoteDataSource` interface, which outlines the contract for interacting with a remote database for attendance data. It ensures a consistent API for the repository to use, regardless of the backend technology.
    
**Namespace:** app.data.datasources  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** mobile/lib/data/datasources/attendance_local_data_source.dart  
**Description:** Defines the contract for the local attendance data source, which is the Hive database. This interface abstracts the logic for queueing offline records, retrieving them for synchronization, and managing their local state.  
**Template:** Flutter Interface Template  
**Dependency Level:** 1  
**Name:** AttendanceLocalDataSource  
**Type:** Interface  
**Relative Path:** data/datasources  
**Repository Id:** REPO-003-DAT  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** queueAttendanceRecord  
**Parameters:**
    
    - AttendanceModel record
    
**Return Type:** Future<void>  
**Attributes:** abstract  
    - **Name:** getQueuedRecords  
**Parameters:**
    
    
**Return Type:** Future<List<AttendanceModel>>  
**Attributes:** abstract  
    - **Name:** deleteQueuedRecord  
**Parameters:**
    
    - String attendanceId
    
**Return Type:** Future<void>  
**Attributes:** abstract  
    - **Name:** clearQueue  
**Parameters:**
    
    
**Return Type:** Future<void>  
**Attributes:** abstract  
    
**Implemented Features:**
    
    - Local Data Source Abstraction
    - Offline Queue Management
    
**Requirement Ids:**
    
    - REQ-ATT-004
    
**Purpose:** Specifies the required methods for any local cache or queue implementation for attendance records. This contract is crucial for the offline-first strategy.  
**Logic Description:** This abstract class serves as an interface. It defines the public methods that `HiveAttendanceDataSourceImpl` will implement. The methods are designed to manage the lifecycle of offline-created attendance records, from queueing to deletion after successful synchronization.  
**Documentation:**
    
    - **Summary:** This file declares the `AttendanceLocalDataSource` interface, which outlines the contract for managing attendance records in a local database (queue). It supports the application's offline capabilities by defining how records are stored and retrieved locally.
    
**Namespace:** app.data.datasources  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** mobile/lib/data/datasources/firestore_attendance_data_source_impl.dart  
**Description:** The concrete implementation of `AttendanceRemoteDataSource` that interacts with the Firebase Firestore service. It handles the logic for writing and reading `AttendanceModel` objects to and from the correct Firestore collection.  
**Template:** Flutter Class Template  
**Dependency Level:** 2  
**Name:** FirestoreAttendanceDataSourceImpl  
**Type:** DataSource  
**Relative Path:** data/datasources  
**Repository Id:** REPO-003-DAT  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** _firestore  
**Type:** FirebaseFirestore  
**Attributes:** final|private  
    
**Methods:**
    
    - **Name:** createOrUpdateAttendanceRecord  
**Parameters:**
    
    - AttendanceModel record
    
**Return Type:** Future<void>  
**Attributes:** public|override  
    - **Name:** getAttendanceHistoryStream  
**Parameters:**
    
    - String userId
    
**Return Type:** Stream<List<AttendanceModel>>  
**Attributes:** public|override  
    - **Name:** getActiveAttendanceRecordStream  
**Parameters:**
    
    - String userId
    
**Return Type:** Stream<AttendanceModel?>  
**Attributes:** public|override  
    - **Name:** _getAttendanceCollectionRef  
**Parameters:**
    
    
**Return Type:** CollectionReference  
**Attributes:** private  
    
**Implemented Features:**
    
    - Firestore CRUD Operations for Attendance
    
**Requirement Ids:**
    
    - REQ-ATT-001
    - REQ-ATT-002
    - REQ-ATT-005
    
**Purpose:** Provides the direct interface to Firebase Firestore for all attendance-related data operations, abstracting the raw Firestore API calls from the repository.  
**Logic Description:** This class implements `AttendanceRemoteDataSource`. It will get an instance of `FirebaseFirestore` via dependency injection. The methods will use the `_getAttendanceCollectionRef` helper to construct the correct multi-tenant path (e.g., `/tenants/{tenantId}/attendance`). The `createOrUpdate` method will use `doc(record.attendanceId).set(record.toJson())` for idempotency. Stream methods will use `.snapshots().map(...)` to convert Firestore data into `AttendanceModel` objects.  
**Documentation:**
    
    - **Summary:** This file implements the remote data source for attendance records using Firebase Firestore. It is responsible for all communication with the Firestore backend, including creating, updating, and streaming attendance data.
    
**Namespace:** app.data.datasources  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** mobile/lib/data/datasources/hive_attendance_data_source_impl.dart  
**Description:** The concrete implementation of `AttendanceLocalDataSource` using the Hive database. It manages the local queue of attendance records created while the application is offline, providing the foundation for the offline-first strategy.  
**Template:** Flutter Class Template  
**Dependency Level:** 2  
**Name:** HiveAttendanceDataSourceImpl  
**Type:** DataSource  
**Relative Path:** data/datasources  
**Repository Id:** REPO-003-DAT  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** _attendanceBox  
**Type:** Box<Map<String, dynamic>>  
**Attributes:** final|private  
    
**Methods:**
    
    - **Name:** queueAttendanceRecord  
**Parameters:**
    
    - AttendanceModel record
    
**Return Type:** Future<void>  
**Attributes:** public|override  
    - **Name:** getQueuedRecords  
**Parameters:**
    
    
**Return Type:** Future<List<AttendanceModel>>  
**Attributes:** public|override  
    - **Name:** deleteQueuedRecord  
**Parameters:**
    
    - String attendanceId
    
**Return Type:** Future<void>  
**Attributes:** public|override  
    - **Name:** clearQueue  
**Parameters:**
    
    
**Return Type:** Future<void>  
**Attributes:** public|override  
    
**Implemented Features:**
    
    - Hive DB Operations
    - Offline Record Queueing
    
**Requirement Ids:**
    
    - REQ-ATT-004
    
**Purpose:** Manages the local persistence of attendance records created offline, acting as a temporary queue before synchronization with Firestore.  
**Logic Description:** This class implements `AttendanceLocalDataSource`. It will get a Hive `Box` instance via dependency injection. The `queueAttendanceRecord` method will add a record to the box using its `attendanceId` as the key. `getQueuedRecords` will read all values from the box and convert them back into `AttendanceModel` objects. `deleteQueuedRecord` will remove an entry from the box after it has been successfully synced.  
**Documentation:**
    
    - **Summary:** This file implements the local data source for the offline attendance queue using the Hive database. It is responsible for storing, retrieving, and deleting attendance records from the local device storage.
    
**Namespace:** app.data.datasources  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** mobile/lib/data/repositories/attendance_repository_impl.dart  
**Description:** The concrete implementation of the `AttendanceRepository` interface (from the domain layer). This class is the core orchestrator, deciding whether to use the remote or local data source based on network connectivity and managing the synchronization process.  
**Template:** Flutter Repository Template  
**Dependency Level:** 3  
**Name:** AttendanceRepositoryImpl  
**Type:** Repository  
**Relative Path:** data/repositories  
**Repository Id:** REPO-003-DAT  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** _remoteDataSource  
**Type:** AttendanceRemoteDataSource  
**Attributes:** final|private  
    - **Name:** _localDataSource  
**Type:** AttendanceLocalDataSource  
**Attributes:** final|private  
    - **Name:** _networkInfo  
**Type:** NetworkInfo  
**Attributes:** final|private  
    
**Methods:**
    
    - **Name:** markAttendance  
**Parameters:**
    
    - AttendanceModel record
    
**Return Type:** Future<void>  
**Attributes:** public|override  
    - **Name:** watchAttendanceHistory  
**Parameters:**
    
    - String userId
    
**Return Type:** Stream<List<AttendanceModel>>  
**Attributes:** public|override  
    - **Name:** watchActiveAttendanceRecord  
**Parameters:**
    
    - String userId
    
**Return Type:** Stream<AttendanceModel?>  
**Attributes:** public|override  
    - **Name:** _syncQueuedRecords  
**Parameters:**
    
    
**Return Type:** Future<void>  
**Attributes:** private  
    - **Name:** _listenForConnectivityChanges  
**Parameters:**
    
    
**Return Type:** void  
**Attributes:** private  
    
**Implemented Features:**
    
    - Offline-First Attendance Logic
    - Automatic Data Synchronization
    - Network-Aware Data Routing
    
**Requirement Ids:**
    
    - REQ-ATT-004
    - REQ-6-004
    
**Purpose:** Orchestrates data operations for attendance, providing a single source of truth to the application logic layer while handling the complexities of offline storage and synchronization.  
**Logic Description:** This class implements the domain's `AttendanceRepository`. The constructor will take the two data sources and network info as dependencies. It will also call `_listenForConnectivityChanges` to subscribe to network status updates from `_networkInfo`. When a connection is established, it will call `_syncQueuedRecords`. The `markAttendance` method will check `_networkInfo.isConnected`. If true, it calls `_remoteDataSource.createOrUpdateAttendanceRecord`. If false, it updates the record's `syncStatus` to 'Queued' and calls `_localDataSource.queueAttendanceRecord`. The sync method will fetch records from local, push them to remote, and then delete them from local upon success.  
**Documentation:**
    
    - **Summary:** This file provides the concrete implementation for the attendance repository. It orchestrates between remote (Firestore) and local (Hive) data sources to provide a seamless offline-first experience for creating and viewing attendance records.
    
**Namespace:** app.data.repositories  
**Metadata:**
    
    - **Category:** DataAccess
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  - hive_attendance_box_name
  


---


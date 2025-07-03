# Software Design Specification (SDS) for AttendanceRepository

## 1. Introduction

This document provides the detailed software design for the `AttendanceRepository` module. This module is a client-side data layer component responsible for managing all aspects of attendance data, with a primary focus on providing a robust offline-first capability.

The repository abstracts the data sources from the application's business logic, orchestrating between a remote Firestore database (for real-time data) and a local Hive database (for queuing records created offline). It automatically detects network connectivity changes to synchronize the local queue with the remote server, ensuring data integrity and a seamless user experience regardless of network conditions.

## 2. System Architecture & Design

The `AttendanceRepository` follows the **Repository Pattern**. It acts as a single source of truth for all attendance-related data, mediating between the application's use cases (domain layer) and the various data sources.

**Key Components:**

*   **Repository Implementation:** The central orchestrator that contains the core offline/online logic.
*   **Data Source Interfaces:** Abstract contracts defining how to interact with local and remote data stores.
*   **Data Source Implementations:** Concrete classes that implement the data source interfaces using specific technologies (Firestore, Hive).
*   **Data Model:** A Data Transfer Object (DTO) representing an attendance record, with serialization logic for both data stores.
*   **Network Info Abstraction:** A utility to determine network connectivity status, decoupling the repository from the `connectivity_plus` package.

## 3. Configuration

### 3.1. Database Configuration

*   **`hive_attendance_box_name`**: A constant string used as the unique name for the Hive box that stores queued attendance records.
    *   **Value**: `'attendance_queue_box'`

## 4. Detailed Component Specification

This section details the design of each file within the `AttendanceRepository` module.

---

### 4.1. Data Model (`mobile/lib/data/models/attendance_model.dart`)

**Class: `AttendanceModel`**

A class representing a single attendance record. It extends `Equatable` for easy value-based comparison. This model is designed to be compatible with both Firestore and Hive.

**Attributes:**

| Name | Type | Description |
| :--- | :--- | :--- |
| `attendanceId` | `final String` | Client-generated UUID. Primary key for the record. |
| `tenantId` | `final String` | ID of the tenant the user belongs to. Required for Firestore path. |
| `userId` | `final String` | ID of the user who created the record. |
| `userName` | `final String` | Denormalized name of the user for display purposes. |
| `eventId` | `final String?` | Optional ID of a linked event. |
| `clientCheckInTimestamp` | `final DateTime` | Client-side timestamp of the check-in. |
| `clientCheckOutTimestamp`| `final DateTime?`| Client-side timestamp of the check-out. |
| `checkInLocation` | `final GeoPoint` | Firestore GeoPoint for check-in location. |
| `checkOutLocation` | `final GeoPoint?`| Firestore GeoPoint for check-out location. |
| `checkInAccuracy`| `final double` | GPS accuracy in meters for check-in. |
| `checkOutAccuracy`| `final double?` | GPS accuracy in meters for check-out. |
| `status` | `final String` | Approval status (`Pending`, `Approved`, `Rejected`). |
| `syncStatus` | `final String` | Offline sync status (`Queued`, `Synced`, `Failed`). |
| `isOutsideGeofence`| `final bool` | Flag indicating if check-in was outside the geofence. |
| `deviceInfo` | `final Map<String, dynamic>`| Map containing device info (appVersion, os, model). |

**Methods:**

*   **`AttendanceModel.fromFirestore(DocumentSnapshot doc)`**
    *   **Logic:** Factory constructor to create an `AttendanceModel` from a Firestore `DocumentSnapshot`. It will correctly parse Firestore-specific types like `Timestamp` into `DateTime` and `GeoPoint`.
*   **`AttendanceModel.fromJson(Map<String, dynamic> json)`**
    *   **Logic:** Factory constructor to create an `AttendanceModel` from a JSON map (used by Hive and for general serialization). It must handle parsing ISO 8601 date strings back to `DateTime` and a map representation of a `GeoPoint` back to a `GeoPoint` object.
*   **`Map<String, dynamic> toJson()`**
    *   **Logic:** Converts the `AttendanceModel` instance into a JSON map. `DateTime` objects will be converted to `Timestamp` objects for Firestore compatibility, and `GeoPoint` objects will be stored as-is.
*   **`AttendanceModel copyWith({...})`**
    *   **Logic:** Returns a new `AttendanceModel` instance, allowing for the update of specific fields immutably. This is crucial for changing the `syncStatus` or adding a `clientCheckOutTimestamp`.

---

### 4.2. Data Source Interfaces

#### 4.2.1. `mobile/lib/data/datasources/attendance_remote_data_source.dart`

**Abstract Class: `AttendanceRemoteDataSource`**

Defines the contract for interacting with the remote data store (Firestore).

**Methods:**

*   **`Future<void> createOrUpdateAttendanceRecord(AttendanceModel record)`**: Creates a new record or updates an existing one in Firestore.
*   **`Stream<List<AttendanceModel>> getAttendanceHistoryStream(String userId)`**: Streams a list of a user's historical attendance records, ordered by date.
*   **`Stream<AttendanceModel?> getActiveAttendanceRecordStream(String userId)`**: Streams the user's current active attendance record (one that has a check-in but no check-out).

#### 4.2.2. `mobile/lib/data/datasources/attendance_local_data_source.dart`

**Abstract Class: `AttendanceLocalDataSource`**

Defines the contract for managing the offline queue in the local data store (Hive).

**Methods:**

*   **`Future<void> queueAttendanceRecord(AttendanceModel record)`**: Adds an attendance record to the local queue.
*   **`Future<List<AttendanceModel>> getQueuedRecords()`**: Retrieves all records currently in the queue.
*   **`Future<void> deleteQueuedRecord(String attendanceId)`**: Removes a record from the queue, typically after a successful sync.
*   **`Future<void> clearQueue()`**: Removes all records from the queue.

---

### 4.3. Data Source Implementations

#### 4.3.1. `mobile/lib/data/datasources/firestore_attendance_data_source_impl.dart`

**Class: `FirestoreAttendanceDataSourceImpl` implements `AttendanceRemoteDataSource`**

**Dependencies:**
*   `FirebaseFirestore _firestore`: Injected via constructor.
*   `AuthService _authService`: Injected via constructor to retrieve the current user's `tenantId`.

**Private Methods:**
*   **`CollectionReference<Map<String, dynamic>> _getAttendanceCollectionRef()`**:
    *   **Logic:** Retrieves the current `tenantId` from the `_authService`. Throws an `UnauthenticatedException` if the `tenantId` is not available. Returns `_firestore.collection('tenants').doc(tenantId).collection('attendance')`. This enforces the multi-tenant architecture.

**Public Method Logic:**

*   **`createOrUpdateAttendanceRecord(AttendanceModel record)`**:
    *   Uses `_getAttendanceCollectionRef()` to get the correct collection.
    *   Calls `collection.doc(record.attendanceId).set(record.toJson())`. Using `set` with a specific ID makes the operation idempotent.
    *   Wraps the call in a try-catch block, throwing a `ServerException` on failure.
*   **`getAttendanceHistoryStream(String userId)`**:
    *   Uses `_getAttendanceCollectionRef()`.
    *   Returns a stream from `collection.where('userId', isEqualTo: userId).orderBy('clientCheckInTimestamp', descending: true).snapshots()`.
    *   Maps the stream of `QuerySnapshot` to `List<AttendanceModel>` using the `AttendanceModel.fromFirestore` constructor.
*   **`getActiveAttendanceRecordStream(String userId)`**:
    *   Uses `_getAttendanceCollectionRef()`.
    *   Returns a stream from `collection.where('userId', isEqualTo: userId).where('clientCheckOutTimestamp', isEqualTo: null).limit(1).snapshots()`.
    *   Maps the snapshot. If documents exist, return the first one as an `AttendanceModel`. If not, return `null`.

#### 4.3.2. `mobile/lib/data/datasources/hive_attendance_data_source_impl.dart`

**Class: `HiveAttendanceDataSourceImpl` implements `AttendanceLocalDataSource`**

**Dependencies:**
*   `Box<Map<String, dynamic>> _attendanceBox`: A Hive box instance, opened and injected via a dependency injection framework. The box name will be the constant `hive_attendance_box_name`.

**Public Method Logic:**

*   **`queueAttendanceRecord(AttendanceModel record)`**:
    *   Calls `_attendanceBox.put(record.attendanceId, record.toJson())`.
    *   Wraps in a try-catch block, throwing a `CacheException` on failure.
*   **`getQueuedRecords()`**:
    *   Retrieves all values using `_attendanceBox.values`.
    *   Maps the list of JSON maps to a `List<AttendanceModel>` using `AttendanceModel.fromJson`.
*   **`deleteQueuedRecord(String attendanceId)`**:
    *   Calls `_attendanceBox.delete(attendanceId)`.
*   **`clearQueue()`**:
    *   Calls `_attendanceBox.clear()`.

---

### 4.4. Repository Implementation (`mobile/lib/data/repositories/attendance_repository_impl.dart`)

**Class: `AttendanceRepositoryImpl` implements `AttendanceRepository` (from Domain Layer)**

This class is the central orchestrator.

**Dependencies (injected via constructor):**

*   `final AttendanceRemoteDataSource _remoteDataSource`
*   `final AttendanceLocalDataSource _localDataSource`
*   `final NetworkInfo _networkInfo` (Abstraction over `connectivity_plus`)

**Constructor:**
*   Initializes the dependencies.
*   Immediately calls `_listenForConnectivityChanges()` to set up the automatic sync trigger.

**Private Methods:**

*   **`void _listenForConnectivityChanges()`**:
    *   **Logic:** Subscribes to the `_networkInfo.onConnectivityChanged` stream.
    *   Inside the listener, it checks if the new connectivity status is `online`.
    *   If it is online, it calls `_syncQueuedRecords()`.
*   **`Future<void> _syncQueuedRecords()`**:
    *   **Logic:**
        1.  Fetches all queued records using `await _localDataSource.getQueuedRecords()`.
        2.  If the list is empty, it returns immediately.
        3.  Iterates over the list of queued records.
        4.  For each `record`:
            *   In a `try` block, call `await _remoteDataSource.createOrUpdateAttendanceRecord(record)`.
            *   If successful, call `await _localDataSource.deleteQueuedRecord(record.attendanceId)`.
            *   In a `catch` block, log the synchronization error for the specific record. **Do not delete the local record if the sync fails.**

**Public Method Logic:**

*   **`Future<void> markAttendance(AttendanceModel record)`**:
    *   **Logic:**
        1.  Checks network status: `final isConnected = await _networkInfo.isConnected;`
        2.  If `isConnected` is `true`:
            *   Creates a new model with `syncStatus: 'Synced'` using `record.copyWith()`.
            *   Calls `await _remoteDataSource.createOrUpdateAttendanceRecord(syncedRecord)`.
        3.  If `isConnected` is `false`:
            *   Creates a new model with `syncStatus: 'Queued'` using `record.copyWith()`.
            *   Calls `await _localDataSource.queueAttendanceRecord(queuedRecord)`.
*   **`Stream<List<AttendanceModel>> watchAttendanceHistory(String userId)`**:
    *   **Logic:** This method directly delegates to the remote data source. It returns `_remoteDataSource.getAttendanceHistoryStream(userId)`. Client-side caching mechanisms (handled by state management) will provide offline access to previously fetched data.
*   **`Stream<AttendanceModel?> watchActiveAttendanceRecord(String userId)`**:
    *   **Logic:** Directly delegates to the remote data source. It returns `_remoteDataSource.getActiveAttendanceRecordStream(userId)`.
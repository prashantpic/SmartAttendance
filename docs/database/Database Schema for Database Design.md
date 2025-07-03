# Specification

# 1. Entities

## 1.1. Tenant
Represents a single organization or company, serving as the top-level container for all its data in the multi-tenant architecture.

### 1.1.3. Attributes

### 1.1.3.1. tenantId
Globally unique identifier for the tenant.

#### 1.1.3.1.2. Type
Guid

#### 1.1.3.1.3. Is Required
True

#### 1.1.3.1.4. Is Primary Key
True

#### 1.1.3.1.5. Is Unique
True

### 1.1.3.2. organizationName
The legal or display name of the organization.

#### 1.1.3.2.2. Type
VARCHAR

#### 1.1.3.2.3. Is Required
True

#### 1.1.3.2.4. Size
255

### 1.1.3.3. createdAt
Timestamp of when the tenant was created.

#### 1.1.3.3.2. Type
DateTime

#### 1.1.3.3.3. Is Required
True

### 1.1.3.4. updatedAt
Timestamp of the last update to the tenant's record.

#### 1.1.3.4.2. Type
DateTime

#### 1.1.3.4.3. Is Required
True


### 1.1.4. Primary Keys

- tenantId

### 1.1.5. Unique Constraints


### 1.1.6. Indexes


## 1.2. User
Represents an individual user account within a specific tenant.

### 1.2.3. Attributes

### 1.2.3.1. userId
Unique identifier for the user, typically the UID from Firebase Authentication.

#### 1.2.3.1.2. Type
Guid

#### 1.2.3.1.3. Is Required
True

#### 1.2.3.1.4. Is Primary Key
True

#### 1.2.3.1.5. Is Unique
True

### 1.2.3.2. tenantId
Foreign key linking the user to their Tenant. Cached in Firebase Auth Custom Claims for fast, secure access.

#### 1.2.3.2.2. Type
Guid

#### 1.2.3.2.3. Is Required
True

#### 1.2.3.2.4. Is Foreign Key
True

### 1.2.3.3. name
Full name of the user.

#### 1.2.3.3.2. Type
VARCHAR

#### 1.2.3.3.3. Is Required
True

#### 1.2.3.3.4. Size
255

### 1.2.3.4. email
User's email address. Uniqueness is enforced at the tenant level via uq_user_tenant_email.

#### 1.2.3.4.2. Type
VARCHAR

#### 1.2.3.4.3. Is Required
True

#### 1.2.3.4.4. Is Unique
False

#### 1.2.3.4.5. Size
255

#### 1.2.3.4.6. Constraints

- EMAIL_FORMAT

### 1.2.3.5. phoneNumber
User's phone number, used for phone-based authentication.

#### 1.2.3.5.2. Type
VARCHAR

#### 1.2.3.5.3. Is Required
False

#### 1.2.3.5.4. Size
50

### 1.2.3.6. role
The user's role within the organization. Cached in Firebase Auth Custom Claims for fast access control.

#### 1.2.3.6.2. Type
VARCHAR

#### 1.2.3.6.3. Is Required
True

#### 1.2.3.6.4. Size
50

#### 1.2.3.6.5. Constraints

- ENUM('Admin', 'Supervisor', 'Subordinate')

### 1.2.3.7. status
The current status of the user account. Cached in Firebase Auth Custom Claims for fast access control.

#### 1.2.3.7.2. Type
VARCHAR

#### 1.2.3.7.3. Is Required
True

#### 1.2.3.7.4. Size
50

#### 1.2.3.7.5. Constraints

- ENUM('Active', 'Invited', 'Deactivated')

#### 1.2.3.7.6. Default Value
Invited

### 1.2.3.8. supervisorId
Foreign key linking to another User who is the supervisor. Self-referencing.

#### 1.2.3.8.2. Type
Guid

#### 1.2.3.8.3. Is Required
False

#### 1.2.3.8.4. Is Foreign Key
True

### 1.2.3.9. subordinateIds
Denormalized array of direct subordinate user IDs. Maintained by a Cloud Function. Only applicable for 'Supervisor' or 'Admin' roles. Null for 'Subordinate' roles.

#### 1.2.3.9.2. Type
JSON

#### 1.2.3.9.3. Is Required
False

### 1.2.3.10. fcmToken
Firebase Cloud Messaging token for push notifications.

#### 1.2.3.10.2. Type
TEXT

#### 1.2.3.10.3. Is Required
False

### 1.2.3.11. lastLoginTimestamp
Timestamp of the user's last successful login.

#### 1.2.3.11.2. Type
DateTime

#### 1.2.3.11.3. Is Required
False

### 1.2.3.12. createdAt
Timestamp of when the user was created.

#### 1.2.3.12.2. Type
DateTime

#### 1.2.3.12.3. Is Required
True

### 1.2.3.13. updatedAt
Timestamp of the last update to the user's record.

#### 1.2.3.13.2. Type
DateTime

#### 1.2.3.13.3. Is Required
True


### 1.2.4. Primary Keys

- userId

### 1.2.5. Unique Constraints

### 1.2.5.1. uq_user_tenant_email
#### 1.2.5.1.2. Columns

- tenantId
- email


### 1.2.6. Indexes


## 1.3. Attendance
Stores a single attendance event, including check-in and check-out data.

### 1.3.3. Retention Policy

- **Based On:** TenantConfig.dataRetentionDays
- **Action:** Archive to Cold Storage and Purge
- **Mechanism:** Scheduled Cloud Function

### 1.3.4. Attributes

### 1.3.4.1. attendanceId
Client-generated UUID used as the Firestore document ID. New records should be written using a `create()` operation to ensure idempotency during offline sync retries.

#### 1.3.4.1.2. Type
Guid

#### 1.3.4.1.3. Is Required
True

#### 1.3.4.1.4. Is Primary Key
True

#### 1.3.4.1.5. Is Unique
True

### 1.3.4.2. tenantId
Foreign key linking the record to its Tenant.

#### 1.3.4.2.2. Type
Guid

#### 1.3.4.2.3. Is Required
True

#### 1.3.4.2.4. Is Foreign Key
True

### 1.3.4.3. userId
Foreign key linking the record to the User who created it.

#### 1.3.4.3.2. Type
Guid

#### 1.3.4.3.3. Is Required
True

#### 1.3.4.3.4. Is Foreign Key
True

### 1.3.4.4. userName
Denormalized name of the user for performance, avoiding lookups in supervisor list views.

#### 1.3.4.4.2. Type
VARCHAR

#### 1.3.4.4.3. Size
255

#### 1.3.4.4.4. Is Required
False

### 1.3.4.5. eventId
Optional foreign key linking the attendance to a specific Event.

#### 1.3.4.5.2. Type
Guid

#### 1.3.4.5.3. Is Required
False

#### 1.3.4.5.4. Is Foreign Key
True

### 1.3.4.6. clientCheckInTimestamp
Timestamp from the client device at the moment of check-in.

#### 1.3.4.6.2. Type
DateTime

#### 1.3.4.6.3. Is Required
True

### 1.3.4.7. clientCheckOutTimestamp
Timestamp from the client device at the moment of check-out.

#### 1.3.4.7.2. Type
DateTime

#### 1.3.4.7.3. Is Required
False

### 1.3.4.8. serverSyncTimestamp
Timestamp from the server when the record was first synced.

#### 1.3.4.8.2. Type
DateTime

#### 1.3.4.8.3. Is Required
True

### 1.3.4.9. checkInLocation
GeoPoint data for the check-in location. e.g., {"latitude": 40.7128, "longitude": -74.0060}

#### 1.3.4.9.2. Type
JSON

#### 1.3.4.9.3. Is Required
True

### 1.3.4.10. checkOutLocation
GeoPoint data for the check-out location.

#### 1.3.4.10.2. Type
JSON

#### 1.3.4.10.3. Is Required
False

### 1.3.4.11. checkInAccuracy
GPS location accuracy in meters for the check-in.

#### 1.3.4.11.2. Type
DECIMAL

#### 1.3.4.11.3. Precision
10

#### 1.3.4.11.4. Scale
2

#### 1.3.4.11.5. Is Required
True

### 1.3.4.12. checkOutAccuracy
GPS location accuracy in meters for the check-out.

#### 1.3.4.12.2. Type
DECIMAL

#### 1.3.4.12.3. Precision
10

#### 1.3.4.12.4. Scale
2

#### 1.3.4.12.5. Is Required
False

### 1.3.4.13. checkInAddress
Reverse-geocoded address string for the check-in location.

#### 1.3.4.13.2. Type
TEXT

#### 1.3.4.13.3. Is Required
False

### 1.3.4.14. checkOutAddress
Reverse-geocoded address string for the check-out location.

#### 1.3.4.14.2. Type
TEXT

#### 1.3.4.14.3. Is Required
False

### 1.3.4.15. status
The approval status of the attendance record.

#### 1.3.4.15.2. Type
VARCHAR

#### 1.3.4.15.3. Is Required
True

#### 1.3.4.15.4. Size
50

#### 1.3.4.15.5. Constraints

- ENUM('Pending', 'Approved', 'Rejected')

#### 1.3.4.15.6. Default Value
Pending

### 1.3.4.16. syncStatus
The synchronization status for offline-created records.

#### 1.3.4.16.2. Type
VARCHAR

#### 1.3.4.16.3. Is Required
True

#### 1.3.4.16.4. Size
50

#### 1.3.4.16.5. Constraints

- ENUM('Queued', 'Synced', 'Failed')

### 1.3.4.17. isOutsideGeofence
Flag indicating if the check-in occurred outside the tenant's configured geofence.

#### 1.3.4.17.2. Type
BOOLEAN

#### 1.3.4.17.3. Is Required
True

#### 1.3.4.17.4. Default Value
false

### 1.3.4.18. deviceInfo
JSON object containing client device details (app version, OS, model).

#### 1.3.4.18.2. Type
JSON

#### 1.3.4.18.3. Is Required
True

### 1.3.4.19. approvalDetails
JSON object storing details of the approval action (approverId, timestamp, comments).

#### 1.3.4.19.2. Type
JSON

#### 1.3.4.19.3. Is Required
False

### 1.3.4.20. approverHierarchy
JSON array of user IDs representing the supervisory chain for this record.

#### 1.3.4.20.2. Type
JSON

#### 1.3.4.20.3. Is Required
True


### 1.3.5. Primary Keys

- attendanceId

### 1.3.6. Unique Constraints


### 1.3.7. Indexes

### 1.3.7.1. idx_attendance_approval_query
#### 1.3.7.1.2. Columns

- approverHierarchy
- status
- clientCheckInTimestamp

#### 1.3.7.1.3. Sort Order

- ASC
- ASC
- DESC

#### 1.3.7.1.4. Type
Composite

#### 1.3.7.1.5. Notes
Optimizes supervisor dashboard queries for pending approvals.


## 1.4. Event
Represents a scheduled event or task that can be assigned to users.

### 1.4.3. Attributes

### 1.4.3.1. eventId
Unique identifier for the event.

#### 1.4.3.1.2. Type
Guid

#### 1.4.3.1.3. Is Required
True

#### 1.4.3.1.4. Is Primary Key
True

#### 1.4.3.1.5. Is Unique
True

### 1.4.3.2. tenantId
Foreign key linking the event to its Tenant.

#### 1.4.3.2.2. Type
Guid

#### 1.4.3.2.3. Is Required
True

#### 1.4.3.2.4. Is Foreign Key
True

### 1.4.3.3. title
The title or name of the event.

#### 1.4.3.3.2. Type
VARCHAR

#### 1.4.3.3.3. Is Required
True

#### 1.4.3.3.4. Size
255

### 1.4.3.4. description
A detailed description of the event.

#### 1.4.3.4.2. Type
TEXT

#### 1.4.3.4.3. Is Required
False

### 1.4.3.5. eventDate
The date and time the event is scheduled for.

#### 1.4.3.5.2. Type
DateTime

#### 1.4.3.5.3. Is Required
True

### 1.4.3.6. assignedTo
JSON array of user IDs to whom this event is assigned.

#### 1.4.3.6.2. Type
JSON

#### 1.4.3.6.3. Is Required
True

### 1.4.3.7. createdBy
Foreign key linking to the User who created the event.

#### 1.4.3.7.2. Type
Guid

#### 1.4.3.7.3. Is Required
True

#### 1.4.3.7.4. Is Foreign Key
True

### 1.4.3.8. createdAt
Timestamp of when the event was created.

#### 1.4.3.8.2. Type
DateTime

#### 1.4.3.8.3. Is Required
True

### 1.4.3.9. updatedAt
Timestamp of the last update to the event.

#### 1.4.3.9.2. Type
DateTime

#### 1.4.3.9.3. Is Required
True


### 1.4.4. Primary Keys

- eventId

### 1.4.5. Unique Constraints


### 1.4.6. Indexes

### 1.4.6.1. idx_event_assignment_date
#### 1.4.6.1.2. Columns

- assignedTo
- eventDate

#### 1.4.6.1.3. Sort Order

- ASC
- DESC

#### 1.4.6.1.4. Type
Composite

#### 1.4.6.1.5. Notes
Supports array-contains queries on 'assignedTo' for efficient calendar views.


## 1.5. TenantConfig
Stores tenant-specific configuration settings. One-to-one relationship with Tenant. This configuration data should be fetched on client login, cached for the session, and subscribed to for real-time updates to reduce database reads.

### 1.5.3. Attributes

### 1.5.3.1. configId
Unique identifier for the configuration record.

#### 1.5.3.1.2. Type
Guid

#### 1.5.3.1.3. Is Required
True

#### 1.5.3.1.4. Is Primary Key
True

#### 1.5.3.1.5. Is Unique
True

### 1.5.3.2. tenantId
Foreign key linking the config to its Tenant.

#### 1.5.3.2.2. Type
Guid

#### 1.5.3.2.3. Is Required
True

#### 1.5.3.2.4. Is Foreign Key
True

#### 1.5.3.2.5. Is Unique
True

### 1.5.3.3. dataRetentionDays
Number of days to retain active attendance records before archival.

#### 1.5.3.3.2. Type
INT

#### 1.5.3.3.3. Is Required
True

#### 1.5.3.3.4. Default Value
365

#### 1.5.3.3.5. Constraints

- RANGE(90, 730)

### 1.5.3.4. approvalLevels
Number of supervisory approval levels required for an attendance record.

#### 1.5.3.4.2. Type
INT

#### 1.5.3.4.3. Is Required
True

#### 1.5.3.4.4. Default Value
1

#### 1.5.3.4.5. Constraints

- RANGE(1, 3)

### 1.5.3.5. timezone
The tenant's primary timezone in IANA format (e.g., 'America/New_York').

#### 1.5.3.5.2. Type
VARCHAR

#### 1.5.3.5.3. Is Required
True

#### 1.5.3.5.4. Size
100

### 1.5.3.6. geofence
JSON object defining the geofence. e.g., {"center": {"latitude": 40.7, "longitude": -74.0}, "radius": 500}

#### 1.5.3.6.2. Type
JSON

#### 1.5.3.6.3. Is Required
False

### 1.5.3.7. workingHours
JSON object defining the standard working hours for the tenant.

#### 1.5.3.7.2. Type
JSON

#### 1.5.3.7.3. Is Required
False

### 1.5.3.8. createdAt
Timestamp of when the config was created.

#### 1.5.3.8.2. Type
DateTime

#### 1.5.3.8.3. Is Required
True

### 1.5.3.9. updatedAt
Timestamp of the last update to the config.

#### 1.5.3.9.2. Type
DateTime

#### 1.5.3.9.3. Is Required
True


### 1.5.4. Primary Keys

- configId

### 1.5.5. Unique Constraints

### 1.5.5.1. uq_tenantconfig_tenant
#### 1.5.5.1.2. Columns

- tenantId


### 1.5.6. Indexes


## 1.6. LinkedSheet
Stores metadata for a Google Sheet linked by a tenant for data export.

### 1.6.3. Attributes

### 1.6.3.1. linkedSheetId
Unique identifier for the linked sheet record.

#### 1.6.3.1.2. Type
Guid

#### 1.6.3.1.3. Is Required
True

#### 1.6.3.1.4. Is Primary Key
True

#### 1.6.3.1.5. Is Unique
True

### 1.6.3.2. tenantId
Foreign key linking the sheet to its Tenant.

#### 1.6.3.2.2. Type
Guid

#### 1.6.3.2.3. Is Required
True

#### 1.6.3.2.4. Is Foreign Key
True

### 1.6.3.3. fileId
The file ID of the linked Google Sheet.

#### 1.6.3.3.2. Type
VARCHAR

#### 1.6.3.3.3. Is Required
True

#### 1.6.3.3.4. Size
255

### 1.6.3.4. ownerEmail
Email of the user who authorized the Google Sheet integration.

#### 1.6.3.4.2. Type
VARCHAR

#### 1.6.3.4.3. Is Required
True

#### 1.6.3.4.4. Size
255

### 1.6.3.5. lastSyncStatus
The status of the last synchronization attempt.

#### 1.6.3.5.2. Type
VARCHAR

#### 1.6.3.5.3. Is Required
True

#### 1.6.3.5.4. Size
50

#### 1.6.3.5.5. Constraints

- ENUM('Success', 'Failed', 'In Progress', 'Not Started')

#### 1.6.3.5.6. Default Value
Not Started

### 1.6.3.6. lastSyncTimestamp
Timestamp of the last successful synchronization.

#### 1.6.3.6.2. Type
DateTime

#### 1.6.3.6.3. Is Required
False

### 1.6.3.7. lastSyncError
Detailed error message from the last failed synchronization attempt.

#### 1.6.3.7.2. Type
TEXT

#### 1.6.3.7.3. Is Required
False

### 1.6.3.8. createdAt
Timestamp of when the sheet was linked.

#### 1.6.3.8.2. Type
DateTime

#### 1.6.3.8.3. Is Required
True

### 1.6.3.9. updatedAt
Timestamp of the last update to this record.

#### 1.6.3.9.2. Type
DateTime

#### 1.6.3.9.3. Is Required
True


### 1.6.4. Primary Keys

- linkedSheetId

### 1.6.5. Unique Constraints


### 1.6.6. Indexes

### 1.6.6.1. idx_linkedsheet_tenant_status
#### 1.6.6.1.2. Columns

- tenantId
- lastSyncStatus

#### 1.6.6.1.3. Type
Composite


## 1.7. AuditLog
An immutable log of critical, security-sensitive actions performed within a tenant. This entity is partitioned into monthly collections (e.g., 'auditLogs_YYYY_MM') to manage data growth and simplify archival.

### 1.7.3. Partitioning

- **Strategy:** Time-based
- **Period:** Monthly
- **Pattern:** auditLogs_YYYY_MM

### 1.7.4. Attributes

### 1.7.4.1. logId
Unique identifier for the audit log entry.

#### 1.7.4.1.2. Type
Guid

#### 1.7.4.1.3. Is Required
True

#### 1.7.4.1.4. Is Primary Key
True

#### 1.7.4.1.5. Is Unique
True

### 1.7.4.2. tenantId
Foreign key linking the log entry to its Tenant.

#### 1.7.4.2.2. Type
Guid

#### 1.7.4.2.3. Is Required
True

#### 1.7.4.2.4. Is Foreign Key
True

### 1.7.4.3. timestamp
The server timestamp when the action occurred.

#### 1.7.4.3.2. Type
DateTime

#### 1.7.4.3.3. Is Required
True

### 1.7.4.4. actorId
Foreign key linking to the User who performed the action.

#### 1.7.4.4.2. Type
Guid

#### 1.7.4.4.3. Is Required
True

#### 1.7.4.4.4. Is Foreign Key
True

### 1.7.4.5. action
A string identifying the type of action (e.g., 'USER_DEACTIVATED', 'ROLE_CHANGED').

#### 1.7.4.5.2. Type
VARCHAR

#### 1.7.4.5.3. Is Required
True

#### 1.7.4.5.4. Size
100

### 1.7.4.6. targetId
The ID of the entity that was affected by the action (e.g., a userId, sheetId).

#### 1.7.4.6.2. Type
VARCHAR

#### 1.7.4.6.3. Is Required
False

#### 1.7.4.6.4. Size
255

### 1.7.4.7. details
JSON object containing relevant data about the event, such as old and new values.

#### 1.7.4.7.2. Type
JSON

#### 1.7.4.7.3. Is Required
False


### 1.7.5. Primary Keys

- logId

### 1.7.6. Unique Constraints


### 1.7.7. Indexes

### 1.7.7.1. idx_auditlog_tenant_timestamp
#### 1.7.7.1.2. Columns

- tenantId
- timestamp

#### 1.7.7.1.3. Sort Order

- ASC
- DESC

#### 1.7.7.1.4. Type
Composite


## 1.8. UserLegalAcceptance
Tracks a user's acceptance of legal documents like Terms of Service and Privacy Policy.

### 1.8.3. Attributes

### 1.8.3.1. acceptanceId
Unique identifier for the acceptance record.

#### 1.8.3.1.2. Type
Guid

#### 1.8.3.1.3. Is Required
True

#### 1.8.3.1.4. Is Primary Key
True

#### 1.8.3.1.5. Is Unique
True

### 1.8.3.2. userId
Foreign key linking to the User. One-to-one relationship.

#### 1.8.3.2.2. Type
Guid

#### 1.8.3.2.3. Is Required
True

#### 1.8.3.2.4. Is Foreign Key
True

#### 1.8.3.2.5. Is Unique
True

### 1.8.3.3. tenantId
Foreign key for data partitioning and security rules.

#### 1.8.3.3.2. Type
Guid

#### 1.8.3.3.3. Is Required
True

#### 1.8.3.3.4. Is Foreign Key
True

### 1.8.3.4. tosAcceptedAt
Timestamp when the user accepted the Terms of Service.

#### 1.8.3.4.2. Type
DateTime

#### 1.8.3.4.3. Is Required
False

### 1.8.3.5. privacyPolicyAcceptedAt
Timestamp when the user accepted the Privacy Policy.

#### 1.8.3.5.2. Type
DateTime

#### 1.8.3.5.3. Is Required
False


### 1.8.4. Primary Keys

- acceptanceId

### 1.8.5. Unique Constraints

### 1.8.5.1. uq_userlegal_user
#### 1.8.5.1.2. Columns

- userId


### 1.8.6. Indexes




---

# 2. Relations

## 2.1. TenantUsers
A one-to-many relationship where a Tenant contains multiple User accounts. User data like role and status can be cached in Firebase Auth Custom Claims for optimized access control.

### 2.1.4. Source Entity
Tenant

### 2.1.5. Target Entity
User

### 2.1.6. Type
OneToMany

### 2.1.7. Source Multiplicity
1

### 2.1.8. Target Multiplicity
0..*

### 2.1.9. Cascade Delete
True

### 2.1.10. Is Identifying
True

### 2.1.11. On Delete
Cascade

### 2.1.12. On Update
Cascade

## 2.2. TenantAttendances
A one-to-many relationship where a Tenant contains all attendance records for its users. The collection is kept performant via a time-based archival process defined by `dataRetentionDays`.

### 2.2.4. Source Entity
Tenant

### 2.2.5. Target Entity
Attendance

### 2.2.6. Type
OneToMany

### 2.2.7. Source Multiplicity
1

### 2.2.8. Target Multiplicity
0..*

### 2.2.9. Cascade Delete
True

### 2.2.10. Is Identifying
True

### 2.2.11. On Delete
Cascade

### 2.2.12. On Update
Cascade

## 2.3. UserAttendances
A one-to-many relationship where a User has multiple Attendance records. This is optimized for display by denormalizing the User's name into each Attendance record upon creation.

### 2.3.4. Source Entity
User

### 2.3.5. Target Entity
Attendance

### 2.3.6. Type
OneToMany

### 2.3.7. Source Multiplicity
1

### 2.3.8. Target Multiplicity
0..*

### 2.3.9. Cascade Delete
False

### 2.3.10. Is Identifying
False

### 2.3.11. On Delete
SetNull

### 2.3.12. On Update
Cascade

## 2.4. EventAttendances
### 2.4.3. Source Entity
Event

### 2.4.4. Target Entity
Attendance

### 2.4.5. Type
OneToMany

### 2.4.6. Source Multiplicity
1

### 2.4.7. Target Multiplicity
0..*

### 2.4.8. Cascade Delete
False

### 2.4.9. Is Identifying
False

### 2.4.10. On Delete
SetNull

### 2.4.11. On Update
Cascade

## 2.5. TenantEvents
### 2.5.3. Source Entity
Tenant

### 2.5.4. Target Entity
Event

### 2.5.5. Type
OneToMany

### 2.5.6. Source Multiplicity
1

### 2.5.7. Target Multiplicity
0..*

### 2.5.8. Cascade Delete
True

### 2.5.9. Is Identifying
True

### 2.5.10. On Delete
Cascade

### 2.5.11. On Update
Cascade

## 2.6. UserCreatedEvents
### 2.6.3. Source Entity
User

### 2.6.4. Target Entity
Event

### 2.6.5. Type
OneToMany

### 2.6.6. Source Multiplicity
1

### 2.6.7. Target Multiplicity
0..*

### 2.6.8. Cascade Delete
False

### 2.6.9. Is Identifying
False

### 2.6.10. On Delete
SetNull

### 2.6.11. On Update
Cascade

## 2.7. TenantConfiguration
A one-to-one relationship where a Tenant has a single configuration document. This document is cached on the client during a user session to reduce database reads.

### 2.7.4. Source Entity
Tenant

### 2.7.5. Target Entity
TenantConfig

### 2.7.6. Type
OneToOne

### 2.7.7. Source Multiplicity
1

### 2.7.8. Target Multiplicity
1

### 2.7.9. Cascade Delete
True

### 2.7.10. Is Identifying
True

### 2.7.11. On Delete
Cascade

### 2.7.12. On Update
Cascade

## 2.8. TenantLinkedSheets
A one-to-many relationship for a Tenant's Google Sheet integrations. Queries for failed integrations are optimized by an index on `(tenantId, lastSyncStatus)`.

### 2.8.4. Source Entity
Tenant

### 2.8.5. Target Entity
LinkedSheet

### 2.8.6. Type
OneToMany

### 2.8.7. Source Multiplicity
1

### 2.8.8. Target Multiplicity
0..*

### 2.8.9. Cascade Delete
True

### 2.8.10. Is Identifying
True

### 2.8.11. On Delete
Cascade

### 2.8.12. On Update
Cascade

## 2.9. TenantAuditLogs
A one-to-many relationship for a Tenant's audit logs. This is optimized for performance and archival by partitioning logs into time-based collections (e.g., monthly) and using a composite index on `(tenantId, timestamp)` for fast retrieval.

### 2.9.4. Source Entity
Tenant

### 2.9.5. Target Entity
AuditLog

### 2.9.6. Type
OneToMany

### 2.9.7. Source Multiplicity
1

### 2.9.8. Target Multiplicity
0..*

### 2.9.9. Cascade Delete
True

### 2.9.10. Is Identifying
True

### 2.9.11. On Delete
Cascade

### 2.9.12. On Update
Cascade

## 2.10. UserAuditActions
### 2.10.3. Source Entity
User

### 2.10.4. Target Entity
AuditLog

### 2.10.5. Type
OneToMany

### 2.10.6. Source Multiplicity
1

### 2.10.7. Target Multiplicity
0..*

### 2.10.8. Cascade Delete
False

### 2.10.9. Is Identifying
False

### 2.10.10. On Delete
SetNull

### 2.10.11. On Update
Cascade

## 2.11. UserLegalAcceptance
### 2.11.3. Source Entity
User

### 2.11.4. Target Entity
UserLegalAcceptance

### 2.11.5. Type
OneToOne

### 2.11.6. Source Multiplicity
1

### 2.11.7. Target Multiplicity
1

### 2.11.8. Cascade Delete
True

### 2.11.9. Is Identifying
True

### 2.11.10. On Delete
Cascade

### 2.11.11. On Update
Cascade

## 2.12. UserSupervisionHierarchy
A self-referencing relationship where a User (subordinate) is linked to one supervisor User. This is optimized by denormalizing the full `approverHierarchy` into Attendance records and potentially a `subordinateIds` array onto the supervisor's User record.

### 2.12.4. Source Entity
User

### 2.12.5. Target Entity
User

### 2.12.6. Type
ManyToOne

### 2.12.7. Source Multiplicity
0..*

### 2.12.8. Target Multiplicity
0..1

### 2.12.9. Cascade Delete
False

### 2.12.10. Is Identifying
False

### 2.12.11. On Delete
SetNull

### 2.12.12. On Update
Cascade

## 2.13. UserEventAssignments
A ManyToMany relationship linking Users to the Events they are assigned to. This is implemented via the `assignedTo` array in the Event document and optimized with a composite index `(assignedTo, eventDate)` for efficient calendar queries.

### 2.13.4. Source Entity
User

### 2.13.5. Target Entity
Event

### 2.13.6. Type
ManyToMany

### 2.13.7. Source Multiplicity
0..*

### 2.13.8. Target Multiplicity
0..*

### 2.13.9. Cascade Delete
True

### 2.13.10. Is Identifying
False

### 2.13.11. Join Table
### 2.13.11. EventAssignment
#### 2.13.11.2. Columns

- **Name:** userId  
**Type:** Guid  
**References:** User.userId  
- **Name:** eventId  
**Type:** Guid  
**References:** Event.eventId  

### 2.13.12. On Delete
Cascade

### 2.13.13. On Update
Cascade

## 2.14. AttendanceApprovalHierarchy
A derived ManyToMany relationship between an Attendance record and the Users in its `approverHierarchy`. This is optimized by denormalizing the hierarchy into the `approverHierarchy` array and a composite index `(approverHierarchy, status, clientCheckInTimestamp)` to enable fast queries for supervisor dashboards.

### 2.14.4. Source Entity
Attendance

### 2.14.5. Target Entity
User

### 2.14.6. Type
ManyToMany

### 2.14.7. Source Multiplicity
1

### 2.14.8. Target Multiplicity
0..*

### 2.14.9. Cascade Delete
True

### 2.14.10. Is Identifying
False

### 2.14.11. Join Table
### 2.14.11. AttendanceApprover
#### 2.14.11.2. Columns

- **Name:** attendanceId  
**Type:** Guid  
**References:** Attendance.attendanceId  
- **Name:** approverId  
**Type:** Guid  
**References:** User.userId  
- **Name:** approvalLevel  
**Type:** INT  

### 2.14.12. On Delete
Cascade

### 2.14.13. On Update
Cascade



---


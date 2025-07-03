# Specification

# 1. Data Transformation Analysis

- **System Overview:**
  
  - **Analysis Date:** 2025-06-13
  - **Technology Stack:**
    
    - Flutter
    - Dart
    - Firebase Firestore
    - Firebase Authentication
    - Firebase Cloud Functions (TypeScript)
    - Firebase Hosting
    - Hive (local storage)
    - Google Sheets API
    
  - **Service Interfaces:**
    
    - Mobile Client <-> Firebase Services (Firestore, Auth)
    - Cloud Function <-> Firestore
    - Cloud Function <-> Google Geocoding API
    - Cloud Function <-> Google Sheets API
    - Web Client <-> HTTP Cloud Function
    
  - **Data Models:**
    
    - Tenant
    - User
    - Attendance
    - Event
    - TenantConfig
    - LinkedSheet
    - AuditLog
    - UserLegalAcceptance
    
  
- **Data Mapping Strategy:**
  
  - **Essential Mappings:**
    
    - **Mapping Id:** MAPPING-001  
**Source:** Public Registration Web Form  
**Target:** Firestore Tenant and User Documents  
**Transformation:** splitting  
**Configuration:**
    
    
**Mapping Technique:** HTTP Request Payload to multiple Firestore documents.  
**Justification:** Required by REQ-TOP-001 and REQ-TOP-002 to create a new organization and its initial admin user from a single registration submission.  
**Complexity:** medium  
    - **Mapping Id:** MAPPING-002  
**Source:** Client-Side Attendance Data  
**Target:** Initial Firestore Attendance Document  
**Transformation:** direct  
**Configuration:**
    
    
**Mapping Technique:** Mobile app data model is serialized and written to Firestore.  
**Justification:** Core functionality for attendance marking (REQ-ATT-002). The client provides the initial data payload.  
**Complexity:** simple  
    - **Mapping Id:** MAPPING-003  
**Source:** Initial Firestore Attendance Document  
**Target:** Enriched Firestore Attendance Document  
**Transformation:** aggregation  
**Configuration:**
    
    
**Mapping Technique:** Cloud Function triggered on document creation enriches the document with server-generated data (geocoded address, approver hierarchy, server timestamp).  
**Justification:** Required by REQ-ATT-005 to add server-validated and generated data to every attendance record for reporting and approval workflows.  
**Complexity:** medium  
    - **Mapping Id:** MAPPING-004  
**Source:** CSV User Data File  
**Target:** Firestore User Documents  
**Transformation:** merging  
**Configuration:**
    
    
**Mapping Technique:** Batch processing via Cloud Function, parsing each CSV row and resolving supervisorEmail to a supervisorId before creating user documents.  
**Justification:** Required by REQ-8-003 for the bulk user import feature.  
**Complexity:** complex  
    - **Mapping Id:** MAPPING-005  
**Source:** Firestore Attendance Collection  
**Target:** Google Sheet Rows  
**Transformation:** flattened  
**Configuration:**
    
    
**Mapping Technique:** Scheduled Cloud Function queries Firestore, denormalizes related data (e.g., user name), and appends flattened records to a Google Sheet.  
**Justification:** Required by REQ-7-003 for the automated reporting and data export feature.  
**Complexity:** medium  
    
  - **Object To Object Mappings:**
    
    - **Source Object:** Firestore Document (Map<String, dynamic>)  
**Target Object:** Dart Data Class (e.g., UserModel, AttendanceModel)  
**Field Mappings:**
    
    - **Source Field:** firestore_field_name  
**Target Field:** dartObjectPropertyName  
**Transformation:** Direct assignment via fromJson/toJson methods.  
**Data Type Conversion:** Firestore Timestamp to Dart DateTime  
    
    
  - **Data Type Conversions:**
    
    - **From:** String (ISO 8601)  
**To:** Firestore Timestamp  
**Conversion Method:** Server-side parsing in Cloud Function or client-side SDK conversion.  
**Validation Required:** True  
    - **From:** Client Geo-coordinates (Latitude/Longitude)  
**To:** Firestore GeoPoint  
**Conversion Method:** Native Firebase SDK object creation.  
**Validation Required:** True  
    
  - **Bidirectional Mappings:**
    
    - **Entity:** Attendance  
**Forward Mapping:** Firestore Document to Dart AttendanceModel (fromJson)  
**Reverse Mapping:** Dart AttendanceModel to Firestore Document (toJson)  
**Consistency Strategy:** Client is the source of truth for user-inputted data; server is source of truth for augmented data. Client reads enriched data but only writes initial data.  
    
  
- **Schema Validation Requirements:**
  
  - **Field Level Validations:**
    
    - **Field:** User.email  
**Rules:**
    
    - required
    - valid_email_format
    - unique_per_tenant
    
**Priority:** critical  
**Error Message:** A valid, unique email address is required.  
    - **Field:** User.role  
**Rules:**
    
    - required
    - enum('Admin', 'Supervisor', 'Subordinate')
    
**Priority:** critical  
**Error Message:** Role must be one of: Admin, Supervisor, Subordinate.  
    - **Field:** TenantConfig.dataRetentionDays  
**Rules:**
    
    - required
    - integer
    - range(90, 730)
    
**Priority:** high  
**Error Message:** Data Retention must be a number between 90 and 730.  
    
  - **Cross Field Validations:**
    
    - **Validation Id:** VALIDATE-CHECKOUT-TIME  
**Fields:**
    
    - Attendance.clientCheckInTimestamp
    - Attendance.clientCheckOutTimestamp
    
**Rule:** clientCheckOutTimestamp must be chronologically after clientCheckInTimestamp.  
**Condition:** Only if clientCheckOutTimestamp is present.  
**Error Handling:** Reject write operation with Firestore Security Rule.  
    - **Validation Id:** VALIDATE-SELF-SUPERVISION  
**Fields:**
    
    - User.userId
    - User.supervisorId
    
**Rule:** userId must not be equal to supervisorId.  
**Condition:** Always on User document write.  
**Error Handling:** Reject write operation with Firestore Security Rule.  
    
  - **Business Rule Validations:**
    
    - **Rule Id:** RULE-SUPERVISOR-ROLE  
**Description:** The user assigned as a supervisor must have the 'Supervisor' or 'Admin' role.  
**Fields:**
    
    - User.supervisorId
    
**Logic:** During a write to a User document, the referenced supervisorId must point to a User document where the 'role' field is 'Supervisor' or 'Admin'.  
**Priority:** critical  
    - **Rule Id:** RULE-CSV-SUPERVISOR-EXISTS  
**Description:** During bulk import, the 'supervisorEmail' in a CSV row must correspond to an existing user or a user being created in the same batch.  
**Fields:**
    
    - CSV.supervisorEmail
    
**Logic:** Cloud function must pre-process the CSV or maintain a map of emails to userIds to validate the hierarchy before committing records.  
**Priority:** high  
    
  - **Conditional Validations:**
    
    - **Condition:** Attendance.status is 'Approved' or 'Rejected'  
**Applicable Fields:**
    
    - Attendance.approvalDetails
    
**Validation Rules:**
    
    - required
    - must contain 'approverId' and 'timestamp'
    
    
  - **Validation Groups:**
    
    - **Group Name:** TenantOnboarding  
**Validations:**
    
    - organizationName.required
    - userName.required
    - userEmail.required
    - userEmail.valid_format
    
**Execution Order:** 1  
**Stop On First Failure:** True  
    
  
- **Transformation Pattern Evaluation:**
  
  - **Selected Patterns:**
    
    - **Pattern:** adapter  
**Use Case:** The mobile data layer's Repository classes act as adapters.  
**Implementation:** A UserRepository class provides methods like `getUser(id)` and `updateUser(user)`, hiding the details of whether the data comes from Firestore or is written to Hive for offline queuing.  
**Justification:** Decouples application logic from the specifics of Firebase SDKs and local database implementations, as per the Repository Pattern.  
    - **Pattern:** pipeline  
**Use Case:** Processing a new attendance record.  
**Implementation:** An onCreate trigger starts a pipeline: 1. A Cloud Function augments the record with geocoding and hierarchy. 2. A second Cloud Function, triggered by the same event, sends a notification to the supervisor.  
**Justification:** Allows for loosely coupled, parallel processing of different concerns related to a single event, as described in the Event-Driven Architecture.  
    
  - **Pipeline Processing:**
    
    - **Required:** True
    - **Stages:**
      
      - **Stage:** Record Augmentation  
**Transformation:** MAPPING-003  
**Dependencies:**
    
    - Geocoding API
    - User Hierarchy Data
    
      - **Stage:** Supervisor Notification  
**Transformation:** Generate FCM payload from Attendance data  
**Dependencies:**
    
    - Supervisor's FCM Token
    
      
    - **Parallelization:** True
    
  - **Processing Mode:**
    
    - **Real Time:**
      
      - **Required:** True
      - **Scenarios:**
        
        - Attendance record augmentation (geocoding, hierarchy population).
        - Push notification delivery on record creation or status change.
        
      - **Latency Requirements:** Sub-second for function execution to feel responsive.
      
    - **Batch:**
      
      - **Required:** True
      - **Batch Size:** 500
      - **Frequency:** Daily for GSheets, On-demand for CSV import
      
    - **Streaming:**
      
      - **Required:** False
      - **Streaming Framework:** N/A
      - **Windowing Strategy:** N/A
      
    
  - **Canonical Data Model:**
    
    - **Applicable:** True
    - **Scope:**
      
      - User
      - Attendance
      - Tenant
      
    - **Benefits:**
      
      - Provides a single source of truth for data structures across the entire system (client, functions, database).
      - Simplifies validation and transformation logic by having a well-defined target schema.
      
    
  
- **Version Handling Strategy:**
  
  - **Schema Evolution:**
    
    - **Strategy:** Additive Schema Changes
    - **Versioning Scheme:** Implicit (no version number in documents)
    - **Compatibility:**
      
      - **Backward:** True
      - **Forward:** False
      - **Reasoning:** New consumers (functions/app) must be able to process old data. This is achieved by only adding new, optional fields. Forward compatibility is not guaranteed as old consumers will not understand new fields.
      
    
  - **Transformation Versioning:**
    
    - **Mechanism:** Source Control (Git)
    - **Version Identification:** Cloud Function deployments are tagged with Git commit hash.
    - **Migration Strategy:** Deploy updated functions before deploying client changes that depend on them.
    
  - **Data Model Changes:**
    
    - **Migration Path:** For breaking changes, a data migration script (one-off Cloud Function) will be written to transform existing Firestore documents to the new schema.
    - **Rollback Strategy:** Restore from Firestore PITR backup.
    - **Validation Strategy:** Run migration script on staging environment first and validate data integrity.
    
  - **Schema Registry:**
    
    - **Required:** False
    - **Technology:** N/A
    - **Governance:** Schemas are defined in Dart model classes and TypeScript interfaces, versioned in Git, and described in technical documentation.
    
  
- **Performance Optimization:**
  
  - **Critical Requirements:**
    
    - **Operation:** Attendance Check-in/out  
**Max Latency:** 3 seconds  
**Throughput Target:** N/A  
**Justification:** User-facing action requiring immediate feedback (REQ-PSCM-001).  
    - **Operation:** Supervisor Dashboard Load  
**Max Latency:** 5 seconds  
**Throughput Target:** N/A  
**Justification:** Core supervisor workflow, needs to be responsive for up to 50 subordinates (REQ-PSCM-002).  
    
  - **Parallelization Opportunities:**
    
    - **Transformation:** CSV User Import  
**Parallelization Strategy:** Process chunks of CSV rows in parallel using multiple Cloud Function invocations.  
**Expected Gain:** Significant reduction in total import time for large files.  
    
  - **Caching Strategies:**
    
    - **Cache Type:** Client-Side/In-Memory  
**Cache Scope:** Per user session  
**Eviction Policy:** On logout  
**Applicable Transformations:**
    
    - Fetching and parsing of TenantConfig data, which is read frequently but changes rarely.
    
    
  - **Memory Optimization:**
    
    - **Techniques:**
      
      - Process batch files (CSV, GSheets) in streams rather than loading the entire file into memory.
      
    - **Thresholds:** Default Cloud Function memory limits.
    - **Monitoring Required:** True
    
  - **Lazy Evaluation:**
    
    - **Applicable:** False
    - **Scenarios:**
      
      
    - **Implementation:** N/A
    
  - **Bulk Processing:**
    
    - **Required:** True
    - **Batch Sizes:**
      
      - **Optimal:** 500
      - **Maximum:** 5000
      
    - **Parallelism:** 0
    
  
- **Error Handling And Recovery:**
  
  - **Error Handling Strategies:**
    
    - **Error Type:** CSV Row Validation Failure  
**Strategy:** Skip invalid row, log error, and continue processing.  
**Fallback Action:** N/A  
**Escalation Path:**
    
    - Aggregate failures into a final validation report for the Admin user (REQ-8-004).
    
    - **Error Type:** External API Failure (Geocoding)  
**Strategy:** Retry with exponential backoff.  
**Fallback Action:** Log error and leave the 'checkInAddress' field empty. Do not fail the entire transformation.  
**Escalation Path:**
    
    - CloudWatch Alert on high API error rate.
    
    
  - **Logging Requirements:**
    
    - **Log Level:** warn
    - **Included Data:**
      
      - tenantId
      - sourceDocumentId
      - errorMessage
      
    - **Retention Period:** 30 days
    - **Alerting:** True
    
  - **Partial Success Handling:**
    
    - **Strategy:** For bulk imports, track and report successful vs. failed records.
    - **Reporting Mechanism:** A summary document is created in Firestore for the Admin to view.
    - **Recovery Actions:**
      
      - Admin can correct the failed rows in the CSV and re-upload only the failed records.
      
    
  - **Circuit Breaking:**
    
    - **Dependency:** Google Sheets API  
**Threshold:** 5 consecutive failures  
**Timeout:** 10 seconds  
**Fallback Strategy:** Log the failure, update LinkedSheet status to 'Failed', and send a notification to the Admin (REQ-7-004).  
    
  - **Retry Strategies:**
    
    - **Operation:** Cloud Function execution on Firestore trigger  
**Max Retries:** 5  
**Backoff Strategy:** exponential  
**Retry Conditions:**
    
    - Internal Firebase errors
    - Transient network issues
    
    
  - **Error Notifications:**
    
    - **Condition:** Google Sheets sync fails with a terminal error (e.g., permissions revoked).  
**Recipients:**
    
    - Tenant Admin
    
**Severity:** high  
**Channel:** FCM Push Notification  
    
  
- **Project Specific Transformations:**
  
  
- **Implementation Priority:**
  
  
- **Risk Assessment:**
  
  
- **Recommendations:**
  
  


---


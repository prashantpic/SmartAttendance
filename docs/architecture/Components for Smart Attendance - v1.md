# Architecture Design Specification

# 1. Components

- **Components:**
  
  ### .1. TenantProvisioningFunction
  Idempotent Firebase Cloud Function triggered via an HTTP call from the public registration page. Provisions the entire new tenant environment, including creating the Firestore document structure, the initial admin user in Firebase Auth, and the default tenant configuration.

  #### .1.4. Type
  Function

  #### .1.5. Dependencies
  
  - firestore-database-901
  - firebase-authentication-902
  
  #### .1.6. Properties
  
  - **Trigger:** onCall (HTTPS)
  - **Idempotent:** true
  - **Runtime:** nodejs18
  
  #### .1.7. Interfaces
  
  
  #### .1.8. Technology
  TypeScript

  #### .1.9. Resources
  
  - **Memory:** 256MB
  - **Timeout:** 60s
  
  #### .1.10. Configuration
  
  - **Region:** us-central1
  
  #### .1.11. Health Check
  
  - **Path:** Monitored via Google Cloud Monitoring
  - **Interval:** 0
  - **Timeout:** 0
  
  #### .1.12. Responsible Features
  
  - REQ-TOP-002
  - REQ-TOP-003
  - REQ-TOP-004
  
  #### .1.13. Security
  
  - **Requires Authentication:** False
  - **Requires Authorization:** False
  - **Notes:** Publicly callable HTTP endpoint. Must be protected by Firebase App Check and rate-limiting to prevent abuse.
  
  ### .2. SessionManagerService
  Client-side service in the Flutter app that manages the user's authentication state, session persistence, and role-based access control. It handles login, logout, routing based on role/status, and enforces ToS acceptance.

  #### .2.4. Type
  Service

  #### .2.5. Dependencies
  
  - auth-repository-201
  - user-repository-202
  
  #### .2.6. Properties
  
  - **State Management:** BLoC/Provider
  
  #### .2.7. Interfaces
  
  - ISessionManager
  
  #### .2.8. Technology
  Dart

  #### .2.9. Resources
  
  
  #### .2.10. Configuration
  
  
  #### .2.11. Health Check
  None

  #### .2.12. Responsible Features
  
  - REQ-2-002
  - REQ-2-003
  - REQ-2-005
  - REQ-2-006
  - REQ-LRC-002
  
  #### .2.13. Security
  
  - **Requires Authentication:** False
  - **Requires Authorization:** False
  - **Notes:** Core of client-side security, manages the authenticated user's state and determines access to different app sections.
  
  ### .3. AuthRepository
  Data layer component that provides a clean abstraction over the Firebase Authentication SDK. It handles all authentication methods (Email/Password, Phone OTP), password reset flows, and token management.

  #### .3.4. Type
  Repository

  #### .3.5. Dependencies
  
  - firebase-authentication-902
  
  #### .3.6. Properties
  
  
  #### .3.7. Interfaces
  
  - IAuthRepository
  
  #### .3.8. Technology
  Dart (firebase_auth)

  #### .3.9. Resources
  
  
  #### .3.10. Configuration
  
  
  #### .3.11. Health Check
  None

  #### .3.12. Responsible Features
  
  - REQ-2-001
  - REQ-2-004
  
  #### .3.13. Security
  
  - **Requires Authentication:** False
  - **Requires Authorization:** False
  - **Notes:** Acts as the client interface to the secure Firebase Authentication service.
  
  ### .4. AttendanceTrackingService
  Client-side service in the Flutter app that encapsulates all business logic for marking attendance. It coordinates location capture, data payload creation, offline queueing, and UI state updates.

  #### .4.4. Type
  Service

  #### .4.5. Dependencies
  
  - attendance-repository-203
  - location-adapter-206
  - offline-sync-service-004
  
  #### .4.6. Properties
  
  
  #### .4.7. Interfaces
  
  - IAttendanceService
  
  #### .4.8. Technology
  Dart

  #### .4.9. Resources
  
  
  #### .4.10. Configuration
  
  
  #### .4.11. Health Check
  None

  #### .4.12. Responsible Features
  
  - REQ-ATT-001
  - REQ-ATT-002
  - REQ-ATT-003
  - REQ-ATT-006
  - REQ-ATT-010
  
  #### .4.13. Security
  
  - **Requires Authentication:** True
  - **Requires Authorization:** True
  - **Allowed Roles:**
    
    - Subordinate
    
  - **Notes:** Operates within the context of an authenticated user.
  
  ### .5. AttendanceRepository
  Data layer component managing data operations for attendance records. It abstracts the dual-source logic, writing to the local Hive database for the offline queue and syncing to the remote Firestore database.

  #### .5.4. Type
  Repository

  #### .5.5. Dependencies
  
  - firestore-database-901
  - local-offline-database-908
  
  #### .5.6. Properties
  
  
  #### .5.7. Interfaces
  
  - IAttendanceRepository
  
  #### .5.8. Technology
  Dart (cloud_firestore, hive)

  #### .5.9. Resources
  
  
  #### .5.10. Configuration
  
  
  #### .5.11. Health Check
  None

  #### .5.12. Responsible Features
  
  - REQ-ATT-004
  - REQ-BRS-004
  
  #### .5.13. Security
  
  - **Requires Authentication:** True
  - **Requires Authorization:** True
  - **Notes:** All remote operations are governed by Firestore Security Rules, ensuring users can only write their own attendance records.
  
  ### .6. AttendanceProcessorFunction
  Firestore-triggered Cloud Function that executes when a new attendance record is created. It atomically augments the record with server-side data: server timestamp, reverse-geocoded address, and the user's full approval hierarchy.

  #### .6.4. Type
  Function

  #### .6.5. Dependencies
  
  - firestore-database-901
  
  #### .6.6. Properties
  
  - **Trigger:** onCreate (Firestore)
  - **Target Path:** /tenants/{tenantId}/attendance/{attendanceId}
  - **Idempotent:** true
  
  #### .6.7. Interfaces
  
  
  #### .6.8. Technology
  TypeScript

  #### .6.9. Resources
  
  - **Memory:** 512MB
  - **Timeout:** 60s
  
  #### .6.10. Configuration
  
  - **Region:** us-central1
  
  #### .6.11. Health Check
  
  - **Path:** Monitored via Google Cloud Monitoring
  - **Interval:** 0
  - **Timeout:** 0
  
  #### .6.12. Responsible Features
  
  - REQ-ATT-005
  - REQ-ATT-007
  - REQ-AWF-001
  - REQ-MTDM-005
  
  #### .6.13. Security
  
  - **Requires Authentication:** False
  - **Requires Authorization:** False
  - **Notes:** Execution is triggered by a backend event. Runs with service account privileges but logic must strictly enforce tenant data boundaries.
  
  ### .7. NotificationDispatchFunction
  Firestore-triggered Cloud Function that sends FCM push notifications based on data changes. It handles notifications for new pending approvals, approval/rejection outcomes, and critical system alerts like sync failures.

  #### .7.4. Type
  Function

  #### .7.5. Dependencies
  
  - firestore-database-901
  - firebase-cloud-messaging-904
  
  #### .7.6. Properties
  
  - **Trigger:** onWrite/onCreate (Firestore)
  - **Target Path:** /tenants/{tenantId}/attendance/{attendanceId}
  - **Idempotent:** true
  
  #### .7.7. Interfaces
  
  
  #### .7.8. Technology
  TypeScript

  #### .7.9. Resources
  
  - **Memory:** 256MB
  - **Timeout:** 60s
  
  #### .7.10. Configuration
  
  
  #### .7.11. Health Check
  
  - **Path:** Monitored via Google Cloud Monitoring
  - **Interval:** 0
  - **Timeout:** 0
  
  #### .7.12. Responsible Features
  
  - REQ-AWF-007
  - REQ-9-002
  - REQ-9-003
  - REQ-9-004
  - REQ-9-005
  
  #### .7.13. Security
  
  - **Requires Authentication:** False
  - **Requires Authorization:** False
  - **Notes:** Must correctly identify target users' FCM tokens from the database based on the event context (e.g., approverHierarchy).
  
  ### .8. GoogleSheetsSyncFunction
  Scheduled, idempotent Cloud Function that exports approved attendance records to a tenant's linked Google Sheet. It handles failures with exponential backoff, prevents duplicates, and updates sync status in Firestore.

  #### .8.4. Type
  Function

  #### .8.5. Dependencies
  
  - firestore-database-901
  - google-sheets-api-adapter-909
  
  #### .8.6. Properties
  
  - **Trigger:** pubsub.schedule
  - **Schedule:** Configurable (e.g., daily)
  - **Idempotent:** true
  
  #### .8.7. Interfaces
  
  
  #### .8.8. Technology
  TypeScript

  #### .8.9. Resources
  
  - **Memory:** 1GB
  - **Timeout:** 540s
  
  #### .8.10. Configuration
  
  
  #### .8.11. Health Check
  
  - **Path:** Monitored via Google Cloud Monitoring
  - **Interval:** 0
  - **Timeout:** 0
  
  #### .8.12. Responsible Features
  
  - REQ-7-003
  - REQ-7-004
  - REQ-7-005
  - REQ-7-006
  
  #### .8.13. Security
  
  - **Requires Authentication:** False
  - **Requires Authorization:** False
  - **Notes:** Uses tenant-specific stored OAuth credentials to access a specific Google Sheet file, adhering to the 'drive.file' scope.
  
  ### .9. DataArchivalFunction
  Scheduled, idempotent Cloud Function that archives old attendance records from Firestore to Firebase Storage, and then purges them from Firestore. The retention period is read from the tenant's configuration.

  #### .9.4. Type
  Function

  #### .9.5. Dependencies
  
  - firestore-database-901
  - firebase-cloud-storage-903
  
  #### .9.6. Properties
  
  - **Trigger:** pubsub.schedule
  - **Schedule:** Daily
  - **Idempotent:** true
  
  #### .9.7. Interfaces
  
  
  #### .9.8. Technology
  TypeScript

  #### .9.9. Resources
  
  - **Memory:** 1GB
  - **Timeout:** 540s
  
  #### .9.10. Configuration
  
  
  #### .9.11. Health Check
  
  - **Path:** Monitored via Google Cloud Monitoring
  - **Interval:** 0
  - **Timeout:** 0
  
  #### .9.12. Responsible Features
  
  - REQ-12-003
  - REQ-12-004
  
  #### .9.13. Security
  
  - **Requires Authentication:** False
  - **Requires Authorization:** False
  - **Notes:** Runs with elevated service account privileges; must strictly adhere to tenant boundaries during read, write, and delete operations.
  
  ### .10. BulkUserImportFunction
  Cloud Storage-triggered function that processes a user-uploaded CSV file. It validates each row, creates user documents in Firestore with an 'Invited' status, establishes the reporting hierarchy, and generates a validation report.

  #### .10.4. Type
  Function

  #### .10.5. Dependencies
  
  - firestore-database-901
  - firebase-cloud-storage-903
  
  #### .10.6. Properties
  
  - **Trigger:** onFinalize (Storage)
  - **Idempotent:** false
  - **Notes:** Idempotency is complex; requires tracking processed files to avoid re-importing.
  
  #### .10.7. Interfaces
  
  
  #### .10.8. Technology
  TypeScript

  #### .10.9. Resources
  
  - **Memory:** 1GB
  - **Timeout:** 540s
  
  #### .10.10. Configuration
  
  
  #### .10.11. Health Check
  
  - **Path:** Monitored via Google Cloud Monitoring
  - **Interval:** 0
  - **Timeout:** 0
  
  #### .10.12. Responsible Features
  
  - REQ-8-001
  - REQ-8-002
  - REQ-8-003
  - REQ-8-004
  - REQ-8-005
  
  #### .10.13. Security
  
  - **Requires Authentication:** False
  - **Requires Authorization:** False
  - **Notes:** Triggered by an upload to a specific, secured path in Cloud Storage. Access to upload is controlled by Firestore Security Rules.
  
  ### .11. FirestoreSecurityRules
  The declarative rule set deployed to Firestore that enforces data security. It ensures strict tenant isolation and fine-grained, role-based access control (RBAC) for all data operations at the database level.

  #### .11.4. Type
  Configuration

  #### .11.5. Dependencies
  
  - firestore-database-901
  - firebase-authentication-902
  
  #### .11.6. Properties
  
  
  #### .11.7. Interfaces
  
  
  #### .11.8. Technology
  Firestore Security Rules Language

  #### .11.9. Resources
  
  
  #### .11.10. Configuration
  
  
  #### .11.11. Health Check
  None

  #### .11.12. Responsible Features
  
  - REQ-MTDM-001
  - REQ-AWF-009
  - REQ-11-001
  - REQ-11-002
  - REQ-LRC-005
  
  #### .11.13. Security
  
  - **Requires Authentication:** True
  - **Requires Authorization:** True
  - **Notes:** This component IS the core data security enforcement mechanism for the entire application backend.
  
  ### .12. FirebaseAppCheck
  A managed Firebase service configured to protect backend resources (Firestore, Functions, Storage) by verifying that incoming requests originate from authentic, unmodified app instances.

  #### .12.4. Type
  Infrastructure

  #### .12.5. Dependencies
  
  - firestore-database-901
  - tenant-provisioning-function-101
  
  #### .12.6. Properties
  
  - **Providers:**
    
    - AppAttest
    - PlayIntegrity
    
  
  #### .12.7. Interfaces
  
  
  #### .12.8. Technology
  Firebase

  #### .12.9. Resources
  
  
  #### .12.10. Configuration
  
  - **Enforcement:** true
  
  #### .12.11. Health Check
  None

  #### .12.12. Responsible Features
  
  - REQ-2-007
  - REQ-11-003
  
  #### .12.13. Security
  
  - **Requires Authentication:** False
  - **Requires Authorization:** False
  - **Notes:** Acts as a security gateway or firewall for the backend, blocking unauthorized clients before they can access resources.
  
  ### .13. CI/CD Pipeline
  The automated pipeline using GitHub Actions that orchestrates the building, static analysis (linting), unit/widget/integration testing, and deployment of the Flutter app and Cloud Functions.

  #### .13.4. Type
  Pipeline

  #### .13.5. Dependencies
  
  - dependency-scanner-802
  - local-development-environment-803
  
  #### .13.6. Properties
  
  
  #### .13.7. Interfaces
  
  
  #### .13.8. Technology
  GitHub Actions (YAML)

  #### .13.9. Resources
  
  
  #### .13.10. Configuration
  
  - **Environments:**
    
    - development
    - staging
    - production
    
  
  #### .13.11. Health Check
  None

  #### .13.12. Responsible Features
  
  - REQ-DX-001
  - REQ-DX-002
  - REQ-DX-007
  - REQ-PUB-003
  
  #### .13.13. Security
  
  - **Requires Authentication:** False
  - **Requires Authorization:** False
  - **Notes:** Manages environment secrets (e.g., API keys, signing certificates) required for building and deploying to different targets.
  
  ### .14. LocalDevelopmentEnvironment
  A collection of scripts and configurations to run the Firebase Local Emulator Suite. It enables developers to test the entire backend stack (Auth, Firestore, Functions, Storage) on their local machine without incurring cloud costs.

  #### .14.4. Type
  Tooling

  #### .14.5. Dependencies
  
  
  #### .14.6. Properties
  
  - **Emulated Services:**
    
    - Authentication
    - Firestore
    - Functions
    - Storage
    
  
  #### .14.7. Interfaces
  
  
  #### .14.8. Technology
  Firebase Local Emulator Suite

  #### .14.9. Resources
  
  
  #### .14.10. Configuration
  
  
  #### .14.11. Health Check
  None

  #### .14.12. Responsible Features
  
  - REQ-DX-006
  - REQ-BRS-007
  - REQ-PSCM-004
  
  #### .14.13. Security
  
  - **Requires Authentication:** False
  - **Requires Authorization:** False
  - **Notes:** A critical tool for rapid, secure, and cost-effective development and testing of backend logic and security rules.
  
  ### .15. SupervisorDashboardUI
  The primary UI component for users with the 'Supervisor' role. It displays a real-time list of pending attendance approvals, with visual indicators for out-of-geofence submissions, and provides interfaces for approval/rejection.

  #### .15.4. Type
  UI Component

  #### .15.5. Dependencies
  
  - approval-workflow-service-005
  
  #### .15.6. Properties
  
  - **Framework:** Flutter
  
  #### .15.7. Interfaces
  
  
  #### .15.8. Technology
  Dart

  #### .15.9. Resources
  
  
  #### .15.10. Configuration
  
  
  #### .15.11. Health Check
  None

  #### .15.12. Responsible Features
  
  - REQ-AWF-002
  - REQ-AWF-003
  - REQ-AWF-004
  - REQ-PSCM-002
  
  #### .15.13. Security
  
  - **Requires Authentication:** True
  - **Requires Authorization:** True
  - **Allowed Roles:**
    
    - Supervisor
    - Admin
    
  - **Notes:** UI is conditionally rendered based on the user's role obtained after login.
  
  
- **Configuration:**
  
  - **Environment:** production
  - **Logging Level:** INFO
  - **Multi Tenancy Model:** Siloed Data Model (/tenants/{tenantId})
  - **Primary Data Store:** Firebase Firestore
  - **Authentication Provider:** Firebase Authentication
  


---

# 2. Component_Relations

- **Architecture:**
  
  - **Components:**
    
    - **Id:** flutter-ui-presentation-001  
**Name:** MobileUIPresentationLayer  
**Description:** Composite component representing the entire Flutter UI layer. It renders all screens and widgets, captures user input, and reflects state changes managed by the Application Logic Layer. It is built to be accessible (WCAG 2.1 AA) and internationalized.  
**Type:** UIComponent  
**Dependencies:**
    
    - flutter-app-logic-002
    
**Properties:**
    
    - **Framework:** Flutter
    - **State Management:** BLoC/Provider
    
**Interfaces:**
    
    - IAuthView
    - IDashboardView
    
**Technology:** Flutter, Dart, flutter_localizations, material_design  
**Resources:**
    
    
**Configuration:**
    
    - **Theme:** Material
    - **Localization Files:** .arb
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-TOP-001
    - REQ-2-002
    - REQ-2-005
    - REQ-ATT-001
    - REQ-AWF-002
    - REQ-6-003
    - REQ-7-001
    - REQ-8-001
    - REQ-15-001
    - REQ-15-002
    - REQ-15-003
    
**Security:**
    
    - **Requires Authentication:** False
    - **Requires Authorization:** False
    
    - **Id:** flutter-app-logic-002  
**Name:** MobileApplicationLogicLayer  
**Description:** Composite component representing the Flutter application's core business logic. It uses BLoCs/Cubits to manage state, orchestrate data flow from repositories to the UI, and implement all client-side business rules and workflows.  
**Type:** Service  
**Dependencies:**
    
    - flutter-data-layer-003
    
**Properties:**
    
    - **State Management Pattern:** BLoC
    
**Interfaces:**
    
    
**Technology:** Flutter, Dart, BLoC/Provider  
**Resources:**
    
    
**Configuration:**
    
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-2-002
    - REQ-2-003
    - REQ-ATT-003
    - REQ-ATT-004
    - REQ-AWF-005
    - REQ-AWF-006
    
**Security:**
    
    - **Requires Authentication:** False
    - **Requires Authorization:** False
    
    - **Id:** flutter-data-layer-003  
**Name:** MobileDataLayer  
**Description:** Composite component abstracting all data sources. It implements the Repository Pattern to provide a clean API for the Application Logic Layer, handling communication with both remote Firebase services and the local offline database.  
**Type:** Repository  
**Dependencies:**
    
    - firebase-backend-004
    
**Properties:**
    
    - **Local Db:** Hive
    - **Remote Db:** Firestore
    
**Interfaces:**
    
    - IAuthRepository
    - IUserRepository
    - IAttendanceRepository
    - IEventRepository
    
**Technology:** Dart, cloud_firestore, firebase_auth, firebase_storage, hive, http, google_maps_flutter, mockito  
**Resources:**
    
    
**Configuration:**
    
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-2-006
    - REQ-ATT-004
    - REQ-ATT-010
    - REQ-9-001
    
**Security:**
    
    - **Requires Authentication:** False
    - **Requires Authorization:** False
    
    - **Id:** firebase-backend-004  
**Name:** FirebaseBackendPlatform  
**Description:** Represents the managed Firebase/Google Cloud platform, providing the core infrastructure for the backend. This includes the database, authentication, serverless functions environment, storage, and security services.  
**Type:** Platform  
**Dependencies:**
    
    
**Properties:**
    
    - **Provider:** Google Cloud Platform
    - **Uptime Slo:** 99.9%
    
**Interfaces:**
    
    - Firestore API
    - Firebase Auth API
    - FCM API
    - Cloud Functions Triggers
    
**Technology:** Firestore, Firebase Authentication, FCM, Cloud Storage, Firebase Hosting, App Check, Cloud Monitoring  
**Resources:**
    
    
**Configuration:**
    
    - **Encryption At Rest:** Enabled (Default)
    - **Encryption In Transit:** TLS 1.2+
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-11-004
    - REQ-BRS-002
    - REQ-BRS-003
    - REQ-MAA-003
    
**Security:**
    
    - **Requires Authentication:** True
    - **Requires Authorization:** True
    
    - **Id:** tenant-provisioning-fn-005  
**Name:** TenantProvisioningFunction  
**Description:** An idempotent, HTTP-triggered Cloud Function that handles new organization registration. It creates the tenant structure, the initial admin user in Auth and Firestore, and default configuration documents.  
**Type:** Service  
**Dependencies:**
    
    - firebase-backend-004
    
**Properties:**
    
    - **Trigger:** HTTP Request
    - **Idempotent:** true
    
**Interfaces:**
    
    
**Technology:** Node.js, TypeScript, Firebase Functions SDK  
**Resources:**
    
    - **Memory:** 256MB
    - **Timeout:** 60s
    
**Configuration:**
    
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-TOP-002
    - REQ-TOP-003
    - REQ-TOP-004
    
**Security:**
    
    - **Requires Authentication:** False
    - **Requires Authorization:** False
    
    - **Id:** attendance-processor-fn-006  
**Name:** AttendanceProcessorFunction  
**Description:** A Firestore-triggered Cloud Function that runs on the creation of a new attendance document. It augments the record with server-side data: sync timestamp, geocoded address, and the user's full approver hierarchy.  
**Type:** Service  
**Dependencies:**
    
    - firebase-backend-004
    
**Properties:**
    
    - **Trigger:** Firestore onCreate (/tenants/{tenantId}/attendance/{attendanceId})
    - **Idempotent:** true
    
**Interfaces:**
    
    
**Technology:** Node.js, TypeScript, Firebase Functions SDK  
**Resources:**
    
    - **Memory:** 512MB
    - **Timeout:** 60s
    
**Configuration:**
    
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-ATT-005
    - REQ-MTDM-005
    
**Security:**
    
    - **Requires Authentication:** True
    - **Requires Authorization:** True
    
    - **Id:** notification-dispatcher-fn-007  
**Name:** NotificationDispatcherFunction  
**Description:** A set of event-triggered Cloud Functions that handle sending push notifications via FCM. Triggers on new pending attendance records, status changes, and critical system alerts like sync failures.  
**Type:** Service  
**Dependencies:**
    
    - firebase-backend-004
    
**Properties:**
    
    - **Trigger:** Firestore onCreate/onUpdate
    - **Idempotent:** true
    
**Interfaces:**
    
    
**Technology:** Node.js, TypeScript, Firebase Functions SDK, FCM  
**Resources:**
    
    - **Memory:** 256MB
    - **Timeout:** 60s
    
**Configuration:**
    
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-AWF-007
    - REQ-7-004
    - REQ-9-002
    - REQ-9-003
    - REQ-9-004
    - REQ-9-005
    
**Security:**
    
    - **Requires Authentication:** True
    - **Requires Authorization:** True
    
    - **Id:** sheets-export-fn-008  
**Name:** ScheduledSheetsExportFunction  
**Description:** A scheduled, idempotent Cloud Function that exports attendance records to a tenant's linked Google Sheet. It handles state tracking, error handling (transient and terminal), and ensures no duplicate records are written.  
**Type:** Service  
**Dependencies:**
    
    - firebase-backend-004
    
**Properties:**
    
    - **Trigger:** Cloud Scheduler (Pub/Sub)
    - **Idempotent:** true
    - **Retry Strategy:** Exponential Backoff
    
**Interfaces:**
    
    
**Technology:** Node.js, TypeScript, Firebase Functions SDK, Google Sheets API  
**Resources:**
    
    - **Memory:** 1GB
    - **Timeout:** 540s
    
**Configuration:**
    
    - **Schedule:** Configurable (daily/weekly)
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-7-003
    - REQ-7-004
    - REQ-7-005
    - REQ-7-006
    
**Security:**
    
    - **Requires Authentication:** True
    - **Requires Authorization:** True
    
    - **Id:** user-import-fn-009  
**Name:** BulkUserImportFunction  
**Description:** A Cloud Storage-triggered function that processes a user-uploaded CSV file. It validates each row, creates 'Invited' user documents in Firestore, establishes the reporting hierarchy, and generates a validation report.  
**Type:** Service  
**Dependencies:**
    
    - firebase-backend-004
    
**Properties:**
    
    - **Trigger:** Cloud Storage onFinalize
    - **Asynchronous:** true
    
**Interfaces:**
    
    
**Technology:** Node.js, TypeScript, Firebase Functions SDK  
**Resources:**
    
    - **Memory:** 1GB
    - **Timeout:** 540s
    
**Configuration:**
    
    - **Template Path:** /templates/user_import_template.csv
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-8-002
    - REQ-8-003
    - REQ-8-004
    
**Security:**
    
    - **Requires Authentication:** True
    - **Requires Authorization:** True
    
    - **Id:** data-archival-fn-010  
**Name:** ScheduledArchivalFunction  
**Description:** A scheduled, idempotent Cloud Function that enforces data retention policies. It queries attendance records older than the tenant's configured 'dataRetentionDays', exports them to Cloud Storage, and then purges them from Firestore.  
**Type:** Service  
**Dependencies:**
    
    - firebase-backend-004
    
**Properties:**
    
    - **Trigger:** Cloud Scheduler (Pub/Sub)
    - **Idempotent:** true
    
**Interfaces:**
    
    
**Technology:** Node.js, TypeScript, Firebase Functions SDK  
**Resources:**
    
    - **Memory:** 1GB
    - **Timeout:** 540s
    
**Configuration:**
    
    - **Schedule:** Daily
    - **Archive Format:** NDJSON
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-12-003
    - REQ-12-004
    
**Security:**
    
    - **Requires Authentication:** True
    - **Requires Authorization:** True
    
    - **Id:** audit-logger-svc-011  
**Name:** AuditLoggerService  
**Description:** A utility service and set of triggers responsible for creating immutable records in the 'auditLogs' collection for all security-sensitive events, such as role changes, user deactivation, and configuration updates.  
**Type:** Service  
**Dependencies:**
    
    - firebase-backend-004
    
**Properties:**
    
    - **Trigger:** Firestore onUpdate or direct call from other functions
    
**Interfaces:**
    
    
**Technology:** Node.js, TypeScript, Firebase Functions SDK  
**Resources:**
    
    - **Memory:** 128MB
    
**Configuration:**
    
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-7-007
    - REQ-11-007
    - REQ-MAA-001
    
**Security:**
    
    - **Requires Authentication:** True
    - **Requires Authorization:** True
    
    - **Id:** security-rules-012  
**Name:** FirestoreSecurityRules  
**Description:** A declarative configuration component that enforces all data access control logic directly within Firestore. It ensures strict tenant isolation, role-based access control (RBAC), and hierarchical permissions.  
**Type:** Configuration  
**Dependencies:**
    
    - firebase-backend-004
    
**Properties:**
    
    
**Interfaces:**
    
    
**Technology:** Firebase Security Rules Language  
**Resources:**
    
    
**Configuration:**
    
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-AWF-009
    - REQ-MTDM-001
    - REQ-11-001
    - REQ-11-002
    - REQ-LRC-005
    
**Security:**
    
    - **Requires Authentication:** True
    - **Requires Authorization:** True
    
    - **Id:** ci-cd-pipeline-013  
**Name:** CI-CD-Pipeline  
**Description:** The automated pipeline for building, testing, and deploying the application. It enforces code quality, runs security scans, and manages deployments to different environments (TestFlight, Google Play Internal Testing).  
**Type:** Automation  
**Dependencies:**
    
    
**Properties:**
    
    - **Provider:** GitHub Actions
    
**Interfaces:**
    
    
**Technology:** GitHub Actions, YAML, Fastlane, flutter_lints, Dependabot  
**Resources:**
    
    
**Configuration:**
    
    - **Triggers:** on: [push, pull_request]
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-11-005
    - REQ-DX-001
    - REQ-DX-002
    - REQ-DX-005
    - REQ-PUB-003
    
**Security:**
    
    - **Requires Authentication:** False
    - **Requires Authorization:** False
    
    - **Id:** local-dev-env-014  
**Name:** LocalDevelopmentEnvironment  
**Description:** A configuration and set of scripts that utilize the Firebase Local Emulator Suite to allow for offline, rapid, and cost-effective development and testing of the entire backend, including functions and security rules.  
**Type:** Tooling  
**Dependencies:**
    
    
**Properties:**
    
    
**Interfaces:**
    
    
**Technology:** Firebase Local Emulator Suite, Shell Scripts  
**Resources:**
    
    
**Configuration:**
    
    - **Emulated Services:** Auth, Firestore, Functions, Storage
    
**Health Check:**
    
    
**Responsible Features:**
    
    - REQ-DX-006
    - REQ-BRS-007
    - REQ-PSCM-004
    
**Security:**
    
    - **Requires Authentication:** False
    - **Requires Authorization:** False
    
    
  - **Configuration:**
    
    - **Environment:** production
    - **Logging Level:** INFO
    - **Environments:**
      
      - development
      - staging
      - production
      
    - **Code Coverage Minimum:** 80%
    
  


---


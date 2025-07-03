**Software Requirements Specification: Smart Attendance App**

**1. Introduction**

**1.1. Objective**
To develop a cross-platform mobile attendance application with a core free service for organizations with a hierarchical structure, such as non-profits, startups, and small businesses. The app will support GPS-based attendance marking, supervisor approval workflows, calendar-based events, and optional export to Google Sheets. Designed for multi-tenant use, this app will be made available for organizations that cannot afford commercial attendance solutions.

**1.2. Scope**
The system will provide a complete solution for employee attendance tracking, including user registration, multi-level approval, event management, and reporting. The scope includes native mobile applications for Android and iOS, and a backend infrastructure built on Firebase. The system will be designed for multi-tenancy, ensuring data isolation between different organizations.

**1.3. User Characteristics**
The system will support three primary user roles:
*   **Administrator (Admin):** Manages the organization's settings, users, hierarchy, and has access to all reports, audit logs, and system integrations.
*   **Supervisor:** Manages a team of subordinates, approves their attendance records, and creates events for them.
*   **Subordinate:** Marks their attendance, views their attendance history, and sees assigned events.

---

**2. System Architecture**

**2.1. Technology Stack**
*   **Mobile Framework:** Flutter for cross-platform Android and iOS development.
*   **Backend Services & Cloud Functions:** Firebase with Cloud Functions written in **TypeScript** for type-safe, maintainable backend logic.
*   **Authentication:** Firebase Authentication for email/password and phone OTP support.
*   **Database:** Firebase Firestore for real-time, NoSQL data storage with role-based access rules and optimized indexes.
*   **Offline Storage:** **Hive**, a lightweight and fast pure-Dart database, for local queueing of offline attendance records.
*   **File Storage:** Firebase Storage for optional file attachments and long-term data archival.
*   **Reporting & Export:** Google Sheets API (v4) and Google Drive API for admin-specific reporting.
*   **Notifications:** Firebase Cloud Messaging for push notifications regarding reminders and approval updates.
*   **Maps Integration:** Google Maps API for displaying GPS location previews during check-in.
*   **Web Hosting:** Firebase Hosting for a tenant registration page and hosting privacy policy documents.

**2.1.1. Developer Experience & Tooling**
*   **CI/CD Pipeline:** **GitHub Actions** for automated building, testing, and deployment of the Flutter app and Firebase assets.
*   **Static Code Analysis:** **flutter_lints** package to enforce consistent code style and catch potential errors.
*   **Testing Frameworks:**
    *   **Unit/Widget Testing:** `flutter_test` framework.
    *   **Integration/E2E Testing:** `integration_test` framework.
    *   **Mocking:** `mockito` library for mocking dependencies.
*   **Crash & Error Reporting:** **Firebase Crashlytics** for real-time crash reporting and error analysis.
*   **Dependency Security:** **GitHub Dependabot** for automated vulnerability scanning of project dependencies.

**2.2. Multi-Tenant Structure**
*   Each organization is treated as an isolated tenant within the system.
*   All tenant-specific data in Firestore will be stored under a unique path: `/tenants/{tenantId}`.
*   Firebase Security Rules will strictly enforce that users can only access data within their own `{tenantId}` path.
*   The **Firebase Local Emulator Suite** will be used during development to test security rules, cloud functions, and Firestore logic without incurring cloud costs and to validate data access logic.

**2.3. Deployment Environment Strategy**
*   A multi-project strategy will be adopted to ensure system stability and data integrity.
*   Separate Firebase projects will be maintained for `development`, `staging`, and `production` environments.
*   This approach isolates testing from the live environment, allows for safe deployment of security rules and cloud functions, and supports a robust CI/CD pipeline for automated promotions between environments.

**2.4. Data Model**
The primary Firestore collections will be structured under each tenant.

*   `/tenants/{tenantId}/`
    *   `users/{userId}`
    *   `attendance/{recordId}`
    *   `events/{eventId}`
    *   `config/{configId}`
    *   `linkedSheets/{sheetInfoId}`
    *   `auditLogs/{logId}`

**2.4.1. Collection Schemas**
*   **users:** Stores user profiles, roles, and the reporting hierarchy.
    *   `userId`: (String) Unique identifier from Firebase Auth.
    *   `tenantId`: (String) The ID of the tenant this user belongs to.
    *   `name`: (String) Full name of the user.
    *   `email`: (String) User's email address.
    *   `role`: (String) User's role ('Admin', 'Supervisor', 'Subordinate').
    *   `status`: (String) User's status ('Active', 'Invited', 'Deactivated').
    *   `supervisorId`: (String) The `userId` of the user's direct supervisor. Null for top-level users or Admins.
    *   `fcmToken`: (String) Firebase Cloud Messaging token for push notifications.
    *   `createdAt`: (Timestamp) User creation timestamp.
    *   `updatedAt`: (Timestamp) Timestamp of the last profile update.
    *   `lastLoginTimestamp`: (Timestamp) Timestamp of the user's last successful login.
*   **attendance:** Stores individual attendance records.
    *   `recordId`: (String) Unique ID for the record.
    *   `userId`: (String) The user who created the record.
    *   `clientCheckInTimestamp`: (Timestamp) The device-captured timestamp at the moment of check-in.
    *   `clientCheckOutTimestamp`: (Timestamp, optional) The device-captured timestamp at the moment of check-out.
    *   `serverSyncTimestamp`: (Timestamp) The server-generated timestamp when the record is synced to Firestore.
    *   `checkInLocation`: (GeoPoint) GPS coordinates at check-in.
    *   `checkInAccuracy`: (Number) GPS accuracy in meters at check-in.
    *   `checkInAddress`: (String, optional) Reverse-geocoded address string for check-in location.
    *   `checkOutLocation`: (GeoPoint, optional) GPS coordinates at check-out.
    *   `checkOutAccuracy`: (Number, optional) GPS accuracy in meters at check-out.
    *   `checkOutAddress`: (String, optional) Reverse-geocoded address string for check-out location.
    *   `status`: (String) Approval status ('Pending', 'Approved', 'Rejected').
    *   `syncStatus`: (String) Status of offline records ('Queued', 'Synced', 'Failed').
    *   `eventId`: (String, optional) Reference to a linked event.
    *   `approvalDetails`: (Object, optional) Contains approval/rejection information.
        *   `approverId`: (String) The `userId` of the supervisor who took action.
        *   `timestamp`: (Timestamp) The time of the approval/rejection.
        *   `comments`: (String) Comments from the supervisor.
    *   `approverHierarchy`: (Array of Strings) An array of `userIds` representing the full supervisory chain for the user. This is populated by a Cloud Function on record creation to enable efficient queries.
    *   `deviceInfo`: (Object) Information about the client device for debugging purposes (e.g., `appVersion`, `os`, `model`).
*   **events:** Stores supervisor-assigned events or tasks.
    *   `eventId`: (String) Unique ID for the event.
    *   `title`: (String) Name of the event.
    *   `description`: (String) Details about the event.
    *   `assignedTo`: (Array of Strings) List of `userIds` this event is assigned to.
    *   `createdBy`: (String) `userId` of the supervisor who created the event.
    *   `eventDate`: (Timestamp) The date of the event.
*   **config:** Stores organization-specific policies.
    *   `workingHours`: (Object) Defines start and end times.
    *   `timezone`: (String) IANA time zone name (e.g., 'America/New_York').
    *   `geofence`: (Object, optional) Defines allowed geographical boundaries, containing `center` (GeoPoint) and `radius` (Number, in meters).
    *   `approvalLevels`: (Number) Defines the number of approval levels required. Must be an integer between 1 and 3.
    *   `dataRetentionDays`: (Number) Number of days to retain active attendance records in Firestore before archival. Must be an integer between 90 and 730. Default: 365.
*   **linkedSheets:** Stores metadata for the Google Sheet export integration.
    *   `fileId`: (String) The Google Sheet file ID.
    *   `ownerEmail`: (String) The email of the Admin who linked the sheet.
    *   `lastSyncStatus`: (String) Status of the last sync ('Success', 'Failed', 'In Progress').
    *   `lastSyncTimestamp`: (Timestamp) Timestamp of the last successful sync.
*   **auditLogs:** Stores a trail of critical system events for security and compliance.
    *   `logId`: (String) Unique ID for the log entry.
    *   `timestamp`: (Timestamp) Time the event occurred.
    *   `actorId`: (String) The `userId` of the user who performed the action.
    *   `action`: (String) The type of action performed (e.g., 'USER_DEACTIVATED', 'ROLE_CHANGED', 'CONFIG_UPDATED').
    *   `targetId`: (String) The ID of the entity that was affected (e.g., a `userId`).
    *   `details`: (Object) A map containing relevant details about the event (e.g., old and new values).

**2.4.2. Data Quality and Validation**
*   **Input Validation:** All user inputs will be validated on both the client-side (for immediate feedback) and server-side via Cloud Functions and Firestore Security Rules (for security and integrity).
*   **Field Constraints:**
    *   `email`: Must be a valid email format.
    *   `role`: Must be one of the predefined values: 'Admin', 'Supervisor', 'Subordinate'.
    *   `status`: Must be one of the predefined values: 'Active', 'Invited', 'Deactivated'.
    *   `supervisorId`: Must correspond to an existing `userId` with the 'Supervisor' or 'Admin' role within the same tenant and must not be equal to the user's own `userId`.
    *   `clientCheckOutTimestamp`: If present, must be later than `clientCheckInTimestamp`.
*   **Data Integrity:** Firestore transactions will be used for operations that modify multiple documents simultaneously (e.g., changing a user's supervisor and updating their subordinates' `approverHierarchy`) to ensure atomicity.

---

**3. Functional Requirements**

**3.1. Tenant & User Onboarding**
*   **Tenant Registration:** A public registration page, hosted on Firebase Hosting, will allow a new user to sign up their organization.
*   **Tenant Provisioning:** Upon registration, an idempotent Firebase Cloud Function will trigger to:
    *   Create a new tenant document in Firestore and generate a unique `tenantId`.
    *   Create the first user account for the registrant.
    *   Assign the 'Admin' role and 'Active' status to this initial user.
    *   Populate default configuration settings for the new tenant.

**3.2. Authentication**
*   **Role-Based Login:** The system will support login for Admin, Supervisor, and Subordinate roles.
*   **Authentication Methods:** Users can authenticate using Email/Password and/or Phone OTP, managed by Firebase Authentication.
*   **Forgot Password:** A standard 'Forgot Password' workflow will be available for users with email-based accounts.
*   **Role-Based Routing:** After successful login, the application will route the user to the appropriate dashboard based on their assigned role.

**3.3. User and Hierarchy Management**
*   **Admin Interface:** A 'User Management' module will be accessible only to Admins.
*   **User Invitation/Creation:** Admins can invite or create new users within their organization. Invited users will have an 'Invited' status until they complete registration.
*   **User Status Management:** Admins can 'Deactivate' and 'Reactivate' users. Deactivated users cannot log in but their historical data is preserved. All such actions will be logged in the `auditLogs` collection.
*   **Hierarchy Assignment:** The Admin interface will allow the assignment or modification of the `supervisorId` for any user, thereby defining the reporting structure. This structure will be used by security rules and approval workflows.

**3.4. Attendance Capture**
*   **Check-in/Check-out:** Users can mark their attendance via a simple button press or by selecting a pre-assigned event.
*   **Data Capture:** Each attendance record will capture:
    *   A `clientTimestamp` from the device's clock at the time of the event.
    *   The user's current GPS coordinates and accuracy.
    *   An optional reference to a linked `eventId`.
    *   Device information (`deviceInfo`) such as app version and OS.
*   **Geofence Validation:** If a geofence is configured, the app will check the user's location against it. Check-ins outside the geofence will be flagged for supervisor review but will not be blocked.
*   **Data Storage:** The captured data will be stored as a new document in the `attendance` collection in Firestore. Upon sync, a `serverSyncTimestamp` will be added. A Cloud Function will perform reverse geocoding to populate the `checkInAddress`/`checkOutAddress` fields.
*   **Offline Support:** The app will support offline attendance marking. Records created offline will be queued locally using **Hive** with a `syncStatus` of 'Queued'. They will be synced to Firestore once a network connection is re-established, and the `syncStatus` will be updated to 'Synced' or 'Failed'.

**3.5. Supervisor Approval Workflow**
*   **Pending Status:** All attendance records submitted by a Subordinate are initially marked with a 'Pending' status.
*   **Supervisor Dashboard:** Supervisors will have a dashboard view listing all pending attendance requests from their subordinates. This view will be populated by a single, efficient query using the `approverHierarchy` array in the attendance records.
*   **Approval/Rejection:** Supervisors can approve or reject each request. The action, timestamp, and optional comments will be stored in the `approvalDetails` object.
*   **Notifications:** A push notification will be sent to the relevant supervisor when a new attendance record requires approval. The subordinate will receive a push notification when their record is approved or rejected.
*   **Multi-Level Approval:** The system will support multi-level approval workflows if configured in the tenant's settings.

**3.6. Calendar & Events**
*   **Event Creation:** Supervisors can create events (e.g., Training, Field Visit, Meeting) through a calendar interface.
*   **Event Assignment:** Events can be assigned to specific individuals or entire teams under the supervisor's management.
*   **Calendar View:** The user's calendar will display assigned events, visually distinguishing between past, present, and future events.
*   **Attendance Linkage:** Subordinates can link their attendance check-in to a specific, assigned event for better context and reporting.

**3.7. Reporting & Export to Google Sheets**
*   **Admin Dashboard:** Admins can view attendance summaries and reports within the app.
*   **Google Sheets Integration:** Admins can link a Google Sheet for data export. This requires a one-time OAuth 2.0 authentication to grant the application access to their Google Drive, specifically requesting the `https://www.googleapis.com/auth/drive.file` scope.
*   **Data Sync:** The system will append attendance records to the linked sheet on a daily or weekly basis via a scheduled, idempotent Cloud Function.
*   **Sheet Schema:** The export will use a fixed schema with defined column headers (e.g., `RecordID`, `UserID`, `UserName`, `CheckInTimestamp`, `CheckInLocation`, `Status`, `SupervisorComments`). The sync logic will write data by matching these headers to be resilient against column reordering.
*   **Error Handling & Recovery:**
    *   The system will store the Google Sheet `fileId` in the `linkedSheets` collection.
    *   It will detect API errors (e.g., file deleted, permission revoked) and log them, updating the `lastSyncStatus`.
    *   In case of failure, the app will display a prompt and send a notification to the Admin to re-link or create a new sheet.
    *   New attendance records will be queued and sync will be retried once the integration is restored. The sync function will use an **exponential backoff** strategy for transient API errors.
    *   Robust error logging will be implemented for all sync failures.

---

**4. Transition Requirements**

**4.1. Implementation Approach**
*   **Phased Rollout:** The system will be deployed using a phased rollout strategy. An initial pilot phase will involve a select group of beta-testing organizations to gather feedback and ensure stability before a general public launch.
*   **Onboarding Support:** New tenants will be onboarded individually through the self-service registration portal.

**4.2. Data Migration Strategy**
*   **Data Import Capability:** The system must provide a feature for Admins to perform a one-time bulk import of user data from a previous system.
*   **Extraction and Transformation:** Data must be provided in a predefined CSV template. The template will specify the required columns and data formats for `name`, `email`, and `supervisorEmail`.
*   **Loading and Validation:** A Cloud Function will process the uploaded CSV file, validate each row against the business rules (e.g., valid email format, supervisor exists), create user accounts with 'Invited' status, and build the initial hierarchy. A validation report detailing successful and failed records will be generated for the Admin.
*   **Historical Data:** Migration of historical attendance records is not supported in the initial release.

**4.3. Training Plan**
*   **Role-Based Materials:** Training materials will be developed for each user role (Admin, Supervisor, Subordinate).
*   **Delivery Method:** Materials will consist of in-app guided tours for first-time users, short video tutorials, and a searchable online help center hosted on Firebase Hosting.
*   **Content:**
    *   **Admin Training:** Covers tenant setup, user and hierarchy management, configuration, and Google Sheets integration.
    *   **Supervisor Training:** Covers dashboard navigation, the approval workflow, and event creation.
    *   **Subordinate Training:** Covers attendance marking, viewing history, and interacting with events.

**4.4. System Cutover Plan**
*   **Pre-Launch Checklist:** A checklist will be provided to Admins to ensure all prerequisite steps are completed before going live. This includes user data import, hierarchy verification, and system configuration.
*   **Go-Live:** The "go-live" for a tenant is defined as the moment the Admin instructs all users to begin using the Smart Attendance App for official attendance tracking.
*   **Post-Launch Support:** A dedicated support channel (e.g., email support) will be available for Admins during the initial weeks post-launch.
*   **Fallback Procedure:** In case of critical system failure during the initial rollout, the organization's fallback plan is to revert to their previous attendance tracking method. The system preserves all data for later analysis.

**4.5. Legacy System Decommissioning**
*   **Transition Period:** Organizations are advised to run the Smart Attendance App in parallel with their legacy system for at least one full pay cycle to ensure data accuracy and user adoption.
*   **Decommissioning:** After a successful transition period, the organization is responsible for the formal decommissioning of their legacy attendance system.

---

**5. Business Rules and Constraints**

**5.1. Core Business Logic**
*   **Hierarchy Rules:**
    *   A user cannot be assigned as their own supervisor (`supervisorId` != `userId`).
    *   A user assigned as a supervisor must have the 'Supervisor' or 'Admin' role.
    *   A user's `approverHierarchy` must be automatically updated via a Cloud Function whenever their `supervisorId` changes.
*   **Attendance Validation:**
    *   A `clientCheckOutTimestamp` must be chronologically after the `clientCheckInTimestamp` for the same record.
    *   Duplicate check-ins (a new check-in before checking out from a previous one) are not permitted. The user must check out first.
*   **Geofence Logic:** A check-in occurring outside a defined geofence is permissible but will be flagged on the supervisor's approval dashboard for explicit review.

**5.2. Regulatory and Legal Compliance**
*   **Data Protection:** The system will be designed to comply with the principles of major data protection regulations, including the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). This includes honoring data subject rights for access, rectification, and erasure of personal data, accessible via a request to the tenant Admin.
*   **Terms of Service (ToS):** All users must accept a mandatory ToS during their first login. The ToS will outline user responsibilities, acceptable use, and a Limitation of Liability clause for the service provider.
*   **Privacy Policy:** A clear and accessible Privacy Policy, hosted on Firebase Hosting, must be presented to users during onboarding. It will detail the data being collected (including PII and location data), the purpose of collection, data retention periods, and user rights.

**5.3. Industry and Organizational Constraints**
*   **Accessibility Standard:** The application must comply with Web Content Accessibility Guidelines (WCAG) 2.1 Level AA as a mandatory requirement.
*   **Default Configuration:** Upon tenant creation, the system will populate a set of default policies in the `config` collection, including a 365-day data retention policy and a single level of approval.
*   **Fair Use Policy:** A Fair Use Policy must be implemented and enforced to prevent abuse of the free service. This includes system monitoring of resource consumption per tenant and automated throttling mechanisms for tenants who consistently exceed defined usage limits.

---

**6. Non-Functional Requirements**

**6.1. Performance and Scalability**
*   **Response Time:**
    *   Attendance check-in/out action must complete in under 3 seconds on a stable 3G connection.
    *   The Supervisor's approval dashboard must load in under 5 seconds for a list of up to 50 subordinates with pending requests.
*   **Scalability:**
    *   The system must be designed to support up to 500 active users per tenant.
    *   Firestore queries and data structures will be indexed and optimized to meet these performance targets.

**6.2. Security and Access Control**
*   **Data Isolation:** Firebase Security Rules will ensure that users can only read/write data belonging to their assigned `tenantId`.
*   **Hierarchical Access:** Security rules will enforce the reporting hierarchy:
    *   Supervisors can only read the data of their subordinates (queried efficiently via the `approverHierarchy` field).
    *   Subordinates can only read/write their own data.
    *   Admins have read/write access to all data within their tenant.
*   **Request Verification:** **Firebase App Check** will be implemented and enforced to ensure that traffic originates from the legitimate application, protecting backend resources from abuse.
*   **Data Encryption:** All data will be encrypted in transit via HTTPS. Data at rest within Firebase services is encrypted by default by Google Cloud Platform.
*   **Google API Access:** Access to Google Sheets is granted on a per-admin basis via OAuth and can be revoked by the user at any time from their Google account settings.
*   **Dependency Management:** Automated dependency scanning via **GitHub Dependabot** will be used to identify and alert on vulnerabilities in third-party packages.

**6.2.1. Data Privacy and Compliance**
*   **PII Handling:** Personally Identifiable Information (PII) such as name, email, and location data will be treated as sensitive. Access will be strictly controlled by Firebase Security Rules based on user roles, adhering to the principle of least privilege.
*   **Data Minimization:** The system will only collect data that is essential for its core functionality as defined in this specification.
*   **User Consent:** Users will be informed about data collection practices in the Privacy Policy, which they must accept during onboarding.

**6.3. Data Management and Retention**
*   **Data Storage Strategy:**
    *   **Firebase Firestore:** Primary store for all master data (users, hierarchy), configurations, events, and active attendance records.
    *   **Google Sheets:** Used only as an optional export destination for reporting and archival, not as a primary data source.
*   **Data Retention Policy:**
    *   A clear data retention policy will be defined and communicated to tenant Admins.
    *   Active attendance records will be retained in Firestore for a period defined in the tenant's `config` (default 365 days).
    *   After this period, a scheduled, idempotent Cloud Function will automatically archive records to a tenant-specific folder in Firebase Storage in **Newline Delimited JSON (NDJSON)** format and then purge them from Firestore. The in-app history view will not have access to this archived data.

**6.4. Backup and Recovery**
*   **Recovery Point Objective (RPO):** 24 hours. The system must be recoverable to a state within 24 hours of a disaster event.
*   **Recovery Time Objective (RTO):** 4 hours. Core services must be restored within 4 hours of a disaster event.
*   **Backup Strategy:** Firestore's built-in Point-in-Time Recovery (PITR) feature will be enabled on the production project to allow for recovery from accidental data deletion or corruption. Regular exports of Firestore data will be configured as a secondary backup mechanism.

**6.5. Cost Management and Fair Use**
*   **Resource Monitoring:** Firebase Cloud Functions will be used to periodically aggregate usage metrics (e.g., document writes, reads, storage consumption) on a per-tenant basis.
*   **Budget Alerts:** Budget alerts will be configured in the Google Cloud project to notify developers of unusual cost spikes.
*   **Development Cost Reduction:** The **Firebase Local Emulator Suite** will be the primary tool for development and testing to minimize cloud service reads/writes and accelerate development cycles.
*   **Fair Use Policy:** A "Fair Use Policy" must be implemented and enforced. The system will include mechanisms to notify Admins of excessive usage and temporarily throttle tenants who consistently abuse the service to ensure its availability for all users.

**6.6. Availability and Reliability**
*   **Service Level Objective (SLO):** Core backend services will have a 99.9% uptime target, excluding scheduled maintenance windows.
*   **Offline Functionality:** Key functions, such as attendance marking and viewing personal history, will be designed to work offline. Data will be synchronized automatically when connectivity is restored using the **Hive** local database as a queue.
*   **Data Consistency:** Firestore transactions or batched writes will be used for operations that involve multiple document updates (e.g., user creation, approval updates) to ensure data consistency.
*   **Graceful Degradation:** The application will handle failures of non-critical services gracefully. If the Google Maps API is unavailable, attendance marking will still function without the map preview.

**6.7. Usability and Accessibility**
*   **Accessibility (a11y):** The application must adhere to accessibility best practices, including support for screen readers (TalkBack/VoiceOver), sufficient color contrast ratios (WCAG 2.1 AA), and scalable fonts. Testing will be performed with actual accessibility tools.
*   **Internationalization (i18n):** The application must be architected for full internationalization support. All user-facing strings will be externalized into resource files (ARB files) to facilitate translation into other languages.

**6.8. Auditability**
*   **Audit Trail:** A comprehensive audit trail of critical actions will be maintained in the `auditLogs` collection.
*   **Logged Actions:** Actions to be logged include, but are not limited to: user creation/deactivation, role changes, updates to organization configuration, and linking/unlinking of Google Sheets.
*   **Log Access:** Audit logs will be accessible for viewing by tenant Admins through a dedicated interface to support compliance and security investigations.

**6.9. Monitoring and Alerting**
*   **System Health:** Key metrics for Firebase services (Firestore latency, Function execution counts and errors, Crashlytics error rates) will be monitored via Google Cloud Monitoring dashboards.
*   **Alerting:** Automated alerts will be configured to notify the development team of critical events, such as:
    *   Spikes in Cloud Function error rates or execution times.
    *   High Firestore read/write latencies.
    *   Application crash rates exceeding a defined threshold.
    *   Budget alerts from Google Cloud Billing.

**6.10. Testability**
*   **Test Coverage:** A minimum test coverage target of 80% will be enforced for all backend Cloud Functions and critical business logic in the mobile app.
*   **Test Data:** Scripts will be created to generate realistic test data within the development and staging environments to facilitate thorough testing of features like reporting and supervisor dashboards.

---

**7. Publishing and Maintenance**

**7.1. Publishing Strategy**
*   **Android (Google Play Store):**
    *   An Android App Bundle (AAB) will be generated for release.
    *   The app manifest will declare necessary permissions for location (`ACCESS_FINE_LOCATION`) and internet access.
    *   A Privacy Policy and Terms of Service will be created and hosted on Firebase Hosting and linked in the store listing.
*   **iOS (App Store):**
    *   The app will be signed with a valid Apple Developer Account.
    *   The `Info.plist` file will contain purpose strings (usage descriptions) for location services and network access.
    *   The app will be submitted for review via TestFlight for QA before a public App Store release.

**7.2. Support and Maintenance**
*   **Incident Management:** A process will be defined for classifying and responding to production incidents (e.g., P1 for system outage, P2 for major feature failure).
*   **Maintenance Windows:** Planned maintenance windows will be communicated to users in advance for deploying major updates or performing infrastructure maintenance.
*   **Update Process:** Minor updates and hotfixes will be deployed via the CI/CD pipeline with minimal disruption. Major version updates will be rolled out progressively.

**7.3. Documentation**
*   **User Documentation:** In-app guides or a hosted help center will be provided for all user roles (Subordinate, Supervisor, Admin).
*   **Administrator Guide:** A detailed guide for Admins covering tenant setup, user management, configuration, and Google Sheets integration.
*   **Technical Documentation:** Internal documentation will be maintained for developers, covering architecture, data models, and CI/CD processes.

**7.4. Developer Notes**
*   **State Management:** **Riverpod** is the mandated state management solution for its compile-time safety, testability, and scalability. It provides a clear separation of concerns between UI and business logic.
*   **Permission Handling:** The app will gracefully handle permission requests for location services, providing clear explanations to the user and fallback logic if permissions are denied.
*   **CI/CD Automation:** The **GitHub Actions** pipeline will be configured to run tests on every commit and automate releases to TestFlight/Google Play Internal Testing upon merges to the main branch.

---

**8. Optional Enhancements (Future Scope)**

*   **Web Dashboard:** A web-based dashboard for Admins and Supervisors. **Flutter Web** is the required technology for this feature to maximize code reuse from the mobile application.
*   **Advanced Analytics:** In-app analytics showing attendance trends, punctuality reports, and GPS map heatmaps.
*   **Third-Party Notifications:** Integration with email or WhatsApp for notifications.
*   **Sustainability Model:** A sponsor or donation system to support the ongoing costs of providing the free service. A freemium model will be considered where costly features (e.g., advanced reporting) are part of an optional, paid subscription tier.
# Architecture Design Specification

# 1. Style
Serverless


---

# 2. Patterns

## 2.1. Mobile Backend as a Service (MBaaS)
Utilizes a cloud backend service (Firebase) to provide core functionality like authentication, database, storage, and push notifications, allowing the frontend mobile application to focus on the user experience and business logic.

### 2.1.3. Benefits

- Accelerated development by leveraging pre-built backend components.
- Reduced operational overhead as infrastructure is managed by the cloud provider.
- Built-in scalability and reliability provided by the Firebase platform.
- Seamless integration of services like Auth, Firestore, and FCM.

### 2.1.4. Tradeoffs

- Vendor lock-in with the Firebase ecosystem.
- Less control over backend infrastructure compared to self-hosted solutions.
- Cost can scale unpredictably with usage if not monitored closely.

### 2.1.5. Applicability

- **Scenarios:**
  
  - Mobile applications requiring rapid development cycles.
  - Systems with fluctuating user loads that benefit from automatic scaling.
  - Projects with a primary focus on frontend development, offloading backend complexity.
  

## 2.2. Event-Driven Architecture
System components communicate asynchronously via events. Cloud Functions are triggered by events in Firestore (e.g., document creation/update) or other sources (e.g., scheduled tasks, HTTP requests), promoting loose coupling and reactive workflows.

### 2.2.3. Benefits

- Loose coupling between services (e.g., attendance creation and notification sending).
- Improved scalability and resilience, as components can operate independently.
- Enables complex, asynchronous workflows like data augmentation and background processing.

### 2.2.4. Tradeoffs

- Increased complexity in debugging and tracing event flows.
- Potential for issues with event ordering and idempotency if not handled carefully.
- Requires robust monitoring to track the health of event-driven processes.

### 2.2.5. Applicability

- **Scenarios:**
  
  - Processing data upon creation, such as augmenting attendance records.
  - Triggering notifications based on state changes in the database.
  - Running scheduled batch jobs like data export and archival.
  

## 2.3. Multi-Tenancy (Siloed Data Model)
Each tenant's data is stored in a dedicated document hierarchy within Firestore (e.g., /tenants/{tenantId}/...). Access is strictly enforced by Firestore Security Rules, ensuring complete data isolation between organizations.

### 2.3.3. Benefits

- Strong data security and privacy between tenants.
- Simplified security rules based on the tenantId.
- Scalability per tenant is managed by Firestore's underlying architecture.

### 2.3.4. Tradeoffs

- Noisy neighbor effect is still possible at the infrastructure level, though Firestore mitigates this.
- Cross-tenant operations or analytics are more complex to implement.

### 2.3.5. Applicability

- **Scenarios:**
  
  - SaaS applications serving multiple distinct organizations.
  - Systems where data privacy and isolation are a primary security requirement.
  

## 2.4. Repository Pattern
Mediates between the application/business logic layer and the data mapping layers on the client-side. It provides a collection-like interface for accessing domain objects, abstracting away the specifics of data sources like Firestore and the local Hive database.

### 2.4.3. Benefits

- Decouples business logic from data access concerns.
- Centralizes data access logic, making it easier to manage and test.
- Allows for easier swapping of data sources without affecting the business logic.

### 2.4.4. Tradeoffs

- Can add an extra layer of abstraction for very simple applications.
- May lead to generic repositories that don't fully leverage the power of the underlying data source (e.g., Firestore-specific features).

### 2.4.5. Applicability

- **Scenarios:**
  
  - Applications with multiple data sources (e.g., remote Firestore, local Hive).
  - Complex applications where a clear separation of concerns improves maintainability and testability.
  



---

# 3. Layers

## 3.1. Mobile Presentation Layer
The user-facing layer of the mobile application, built with Flutter. It is responsible for rendering the UI, capturing user input, and managing UI state. It is designed to be accessible (WCAG 2.1 AA) and internationalized.

### 3.1.4. Technologystack
Flutter (latest stable), Material Design, flutter_localizations

### 3.1.5. Language
Dart

### 3.1.6. Type
Presentation

### 3.1.7. Responsibilities

- Render all user interfaces for Admin, Supervisor, and Subordinate roles.
- Handle user interactions (taps, forms, gestures).
- Manage UI state using a pattern like BLoC or Provider.
- Display data provided by the Application layer.
- Implement in-app guided tours and display help documentation.
- Enforce accessibility standards including screen reader support and color contrast.
- Present localized strings from .arb files based on device locale.

### 3.1.8. Components

- AuthScreens (Login, Register, Forgot Password)
- OnboardingWidgets (ToS/Privacy Policy Modal)
- SubordinateDashboard (Check-in/out, Calendar View)
- SupervisorDashboard (Approval List, Event Management UI)
- AdminDashboard (Reporting, User Import UI, Config Management)
- SharedWidgets (Map Preview, Custom Buttons, Loaders)

### 3.1.9. Dependencies

- **Layer Id:** mobile-application  
**Type:** Required  

## 3.2. Mobile Application Logic Layer
The core of the Flutter application. It contains the business logic, orchestrates data flow between the UI and data layers, and manages the application's overall state. It ensures that business rules are enforced on the client side before interacting with the backend.

### 3.2.4. Technologystack
Flutter (latest stable), BLoC/Provider (State Management)

### 3.2.5. Language
Dart

### 3.2.6. Type
BusinessLogic

### 3.2.7. Responsibilities

- Implement all client-side business logic and workflows.
- Orchestrate calls to data repositories (e.g., fetch user profile, then fetch their attendance).
- Handle user session management (login, logout, persistent sessions).
- Process user inputs and validate data (e.g., form validation).
- Manage the offline queue logic, deciding when to push data from Hive to Firestore.
- Handle navigation and routing based on user role and authentication state.
- Process logic for FCM notifications (e.g., navigate to a specific screen on tap).

### 3.2.8. Components

- AuthBloc/Cubit
- AttendanceBloc/Cubit
- EventBloc/Cubit
- ApprovalBloc/Cubit
- AdminBloc/Cubit
- SessionManager

### 3.2.9. Dependencies

- **Layer Id:** mobile-presentation  
**Type:** Required  
- **Layer Id:** mobile-data  
**Type:** Required  

## 3.3. Mobile Data Layer
Abstracts all data sources for the mobile application. It includes repositories for interacting with remote Firebase services and a local data source for offline caching and queueing.

### 3.3.4. Technologystack
cloud_firestore, firebase_auth, firebase_storage, hive, http, google_maps_flutter, mockito

### 3.3.5. Language
Dart

### 3.3.6. Type
DataAccess

### 3.3.7. Responsibilities

- Implement Repository pattern for all data entities (User, Attendance, Event, etc.).
- Communicate with Firebase services (Firestore, Auth, Storage, Functions).
- Manage the local Hive database for queueing offline attendance records (REQ-ATT-004).
- Define and manage data models (e.g., User, Attendance classes with fromJson/toJson).
- Handle data serialization and deserialization.
- Abstract API calls to third-party services like Google Maps.
- Acquire and manage device-specific data like GPS location and FCM token.

### 3.3.8. Components

- AuthRepository
- FirestoreRepository (for User, Attendance, Event, etc.)
- OfflineQueueRepository (Hive-based)
- LocationService
- FCMService
- DataModels

### 3.3.9. Dependencies

- **Layer Id:** mobile-application  
**Type:** Required  

## 3.4. Backend Cloud Functions Layer
A set of stateless, serverless functions running in the Firebase environment. This layer contains all server-side logic, triggered by database events, HTTP requests, or schedules. All functions are idempotent and operate within a strict multi-tenant context.

### 3.4.4. Technologystack
Node.js (latest LTS), Firebase Functions SDK

### 3.4.5. Language
TypeScript

### 3.4.6. Type
ApplicationServices

### 3.4.7. Responsibilities

- Provision new tenants, including creating Firestore structures and the initial admin user (REQ-TOP-002).
- Augment newly created attendance records with server-side data (timestamps, geocoded addresses, approver hierarchy) (REQ-ATT-005).
- Process bulk user import from uploaded CSV files (REQ-8-003).
- Execute scheduled tasks for Google Sheets data export (REQ-7-003) and data archival/purging (REQ-12-003).
- Send FCM push notifications for various system events (pending approvals, status changes, sync failures) (REQ-AWF-007).
- Enforce complex server-side data validation and integrity rules (REQ-MTDM-006).
- Aggregate tenant resource consumption metrics for Fair Use Policy enforcement (REQ-MAA-006).

### 3.4.8. Components

- tenantProvisioningFunction
- attendanceAugmentationFunction
- notificationTriggerFunctions
- googleSheetsSyncFunction
- bulkUserImportFunction
- dataArchivalFunction
- resourceMonitoringFunction

### 3.4.9. Dependencies

- **Layer Id:** backend-infrastructure  
**Type:** Required  

## 3.5. Backend Infrastructure Layer
The managed services from Google Cloud and Firebase that form the foundation of the system's backend. This layer is configured and consumed by the other layers but not implemented directly by the development team.

### 3.5.4. Technologystack
Firestore, Firebase Authentication, Firebase Cloud Messaging (FCM), Firebase Storage, Firebase Hosting, Firebase App Check, Google Cloud Monitoring, Google Sheets API

### 3.5.5. Language
N/A

### 3.5.6. Type
Infrastructure

### 3.5.7. Responsibilities

- Provide a scalable, multi-tenant NoSQL database (Firestore).
- Manage user identity, authentication providers (Email/Pass, Phone OTP), and sessions (Firebase Auth).
- Deliver push notifications to mobile devices (FCM).
- Store files like CSV uploads and data archives (Firebase Storage).
- Host the public-facing registration web page and help documentation (Firebase Hosting).
- Protect backend resources from abuse by verifying client integrity (App Check).
- Provide core services for monitoring, logging, and alerting (Cloud Monitoring, Crashlytics).
- Encrypt all data in transit (TLS) and at rest.

### 3.5.8. Components

- Firestore Database
- Authentication Service
- Cloud Storage Buckets
- FCM Service
- App Check Service
- Cloud Monitoring & Logging

## 3.6. CI/CD & DevOps Pipeline
An automated pipeline and set of practices to ensure code quality, security, and efficient deployment across different environments (dev, staging, prod).

### 3.6.4. Technologystack
GitHub Actions, GitHub Dependabot, Firebase Local Emulator Suite, Fastlane (implied for App Store deployment automation)

### 3.6.5. Language
YAML

### 3.6.6. Type
CrossCutting

### 3.6.7. Responsibilities

- Automate building, static analysis (linting), and testing for every commit.
- Automatically deploy builds to Google Play Internal Testing and Apple TestFlight (REQ-DX-001).
- Scan for and alert on vulnerable third-party dependencies (REQ-DX-005).
- Manage environment isolation using separate Firebase projects.
- Provide a local development environment using the Firebase Local Emulator Suite (REQ-DX-006).
- Manage application signing keys and release certificates.

### 3.6.8. Components

- Build & Test Workflow (.github/workflows/main.yml)
- Deploy Workflow (.github/workflows/deploy.yml)
- Dependabot Configuration (dependabot.yml)
- Local Emulator Scripts (e.g., start-emulators.sh)



---

# 4. Quality Attributes

## 4.1. Security
Ensuring data confidentiality, integrity, and availability.

### 4.1.3. Tactics

- Data Isolation: Strict multi-tenancy in Firestore via /tenants/{tenantId} path.
- Access Control: Role-Based Access Control (RBAC) and hierarchical permissions enforced by Firestore Security Rules.
- Client Verification: Firebase App Check to block unauthorized clients.
- Encryption: Data encrypted in transit (HTTPS/TLS) and at rest (default GCP encryption).
- Principle of Least Privilege: OAuth 2.0 scope for Google Sheets limited to `drive.file`.
- Auditing: Immutable audit logs for all security-sensitive events.
- Vulnerability Management: Automated dependency scanning with Dependabot.

## 4.2. Reliability
The system's ability to perform its required functions under stated conditions for a specified period.

### 4.2.3. Tactics

- Offline First: Queuing attendance records in a local Hive database during network outages.
- Atomic Operations: Using Firestore transactions and batched writes for multi-document updates.
- Redundancy & Recovery: Firestore Point-in-Time Recovery (PITR) and automated daily backups. RPO: 24h, RTO: 4h.
- Graceful Degradation: Core functionality (attendance marking) remains operational if non-critical services (Google Maps) fail.
- High Availability: Leveraging Firebase's 99.9% uptime SLO for core backend services.
- Idempotency: Cloud Functions are designed to be idempotent to handle retries safely.

## 4.3. Performance
The responsiveness and efficiency of the system under load.

### 4.3.3. Tactics

- Efficient Queries: Utilizing composite indexes in Firestore for fast data retrieval (e.g., supervisor's approval dashboard).
- Latency SLOs: Check-in/out < 3s, Supervisor dashboard < 5s.
- Client-Side Caching: Storing tenant configuration and session data on the client to reduce reads.
- Asynchronous Processing: Offloading long-running tasks like data export and user import to background Cloud Functions.
- Data Denormalization: Storing user names in attendance records to avoid lookups in list views.

## 4.4. Maintainability
The ease with which the system can be modified, corrected, or adapted.

### 4.4.3. Tactics

- Modular Design: Separation of concerns into Presentation, Application, and Data layers in the mobile app.
- Code Quality: Enforced through static analysis (`flutter_lints`) and mandatory CI checks.
- Testability: High code coverage (80%) requirement for critical logic, use of `mockito` for mocking.
- Developer Tooling: Use of Firebase Local Emulator Suite for rapid, cost-effective local development and testing.
- Clear Documentation: Requirement for internal technical documentation of data models and architecture.

## 4.5. Scalability
The system's ability to handle growing amounts of work.

### 4.5.3. Tactics

- Serverless Backend: Cloud Functions and Firestore scale automatically with load.
- Stateless Functions: Backend functions are stateless, allowing for horizontal scaling.
- Scalable Data Model: Firestore data model avoids hotspots and is designed for performance at scale.
- Fair Use Policy: Throttling and monitoring mechanisms to manage resource consumption per tenant.



---


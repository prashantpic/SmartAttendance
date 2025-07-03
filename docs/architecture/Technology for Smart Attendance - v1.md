# Specification

# 1. Technologies

## 1.1. Flutter
### 1.1.3. Version
3.22.x (latest stable)

### 1.1.4. Category
Mobile Development Framework

### 1.1.5. Features

- Cross-platform (iOS, Android)
- Declarative UI
- Hot Reload
- Rich Widget Library

### 1.1.6. Requirements

- REQ-TOP-001
- REQ-ATT-001
- REQ-15-001

### 1.1.7. Configuration


### 1.1.8. License

- **Type:** BSD-3-Clause
- **Cost:** Free

## 1.2. Dart
### 1.2.3. Version
3.4.x (latest stable)

### 1.2.4. Category
Mobile Development Language

### 1.2.5. Features

- Statically Typed
- Null Safety
- Asynchronous Programming

### 1.2.6. Requirements

- REQ-DX-002
- REQ-DX-003

### 1.2.7. Configuration


### 1.2.8. License

- **Type:** BSD-3-Clause
- **Cost:** Free

## 1.3. Firebase Platform
### 1.3.3. Version
N/A (Managed Service)

### 1.3.4. Category
Backend Platform (MBaaS)

### 1.3.5. Features

- Unified Platform
- Serverless Infrastructure
- Real-time Capabilities
- Scalability

### 1.3.6. Requirements

- REQ-TOP-001
- REQ-2-001
- REQ-MTDM-001

### 1.3.7. Configuration

- **Projects:** Three distinct projects for 'development', 'staging', and 'production' to ensure environment isolation as per REQ-DX-007.

### 1.3.8. License

- **Type:** Proprietary
- **Cost:** Usage-based (Spark/Blaze Plan)

## 1.4. Cloud Firestore
### 1.4.3. Version
N/A (Managed Service)

### 1.4.4. Category
Database

### 1.4.5. Features

- NoSQL Document Database
- Real-time Sync
- Offline Support
- Rich Querying
- Serverless Scaling

### 1.4.6. Requirements

- REQ-TOP-002
- REQ-MTDM-001
- REQ-MTDM-002
- REQ-AWF-009

### 1.4.7. Configuration

- **Data Model:** Siloed multi-tenant model under '/tenants/{tenantId}/' as per REQ-MTDM-001.
- **Security Rules:** Strict RBAC and hierarchical rules to enforce data isolation and access control as per REQ-11-001 and REQ-11-002.
- **Pitr:** Point-in-Time Recovery enabled on production project as per REQ-BRS-002.

### 1.4.8. License

- **Type:** Proprietary
- **Cost:** Usage-based

## 1.5. Firebase Authentication
### 1.5.3. Version
N/A (Managed Service)

### 1.5.4. Category
Authentication

### 1.5.5. Features

- Multi-factor Auth (Email/Pass, Phone OTP)
- Secure User Management
- Federated Identity
- Session Management

### 1.5.6. Requirements

- REQ-2-001
- REQ-2-002
- REQ-2-004

### 1.5.7. Configuration

- **Providers:** Email/Password and Phone Number (OTP) enabled.
- **Custom Claims:** Used to cache tenantId, role, and status for efficient, secure access control in Firestore Rules.

### 1.5.8. License

- **Type:** Proprietary
- **Cost:** Free tier with limits, then usage-based

## 1.6. Cloud Functions for Firebase
### 1.6.3. Version
2nd Gen

### 1.6.4. Category
Serverless Compute

### 1.6.5. Features

- Event-driven triggers (Firestore, Auth, Pub/Sub, Schedule)
- Scalable
- Idempotent Execution Support

### 1.6.6. Requirements

- REQ-TOP-002
- REQ-ATT-005
- REQ-7-003
- REQ-12-003

### 1.6.7. Configuration

- **Runtime:** Node.js latest LTS
- **Language:** TypeScript

### 1.6.8. License

- **Type:** Proprietary
- **Cost:** Usage-based

## 1.7. Node.js
### 1.7.3. Version
20.x (LTS)

### 1.7.4. Category
Backend Runtime

### 1.7.5. Features

- Asynchronous I/O
- Event-driven
- Large Ecosystem (npm)

### 1.7.6. Requirements

- REQ-TOP-002
- REQ-7-003

### 1.7.7. Configuration

- **Notes:** The runtime environment for all Cloud Functions.

### 1.7.8. License

- **Type:** MIT
- **Cost:** Free

## 1.8. TypeScript
### 1.8.3. Version
5.x (latest stable)

### 1.8.4. Category
Backend Language

### 1.8.5. Features

- Static Typing
- Superset of JavaScript
- Improved Tooling and Maintainability

### 1.8.6. Requirements

- REQ-TOP-002
- REQ-ATT-005
- REQ-DX-003

### 1.8.7. Configuration

- **Notes:** Used for all Cloud Functions to ensure type safety and code quality.

### 1.8.8. License

- **Type:** Apache 2.0
- **Cost:** Free

## 1.9. Firebase App Check
### 1.9.3. Version
N/A (Managed Service)

### 1.9.4. Category
Security

### 1.9.5. Features

- Client Attestation
- Protects against unauthorized clients
- Enforcement on backend services

### 1.9.6. Requirements

- REQ-2-007
- REQ-11-003

### 1.9.7. Configuration

- **Providers:** Play Integrity for Android, DeviceCheck for iOS.
- **Enforcement:** Enabled on Firestore, Cloud Functions, and Storage for production environment.

### 1.9.8. License

- **Type:** Proprietary
- **Cost:** Free

## 1.10. Firebase Cloud Messaging (FCM)
### 1.10.3. Version
N/A (Managed Service)

### 1.10.4. Category
Push Notifications

### 1.10.5. Features

- Cross-platform push notifications
- Topic and device-group messaging
- Custom data payloads

### 1.10.6. Requirements

- REQ-9-001
- REQ-AWF-007
- REQ-7-004

### 1.10.7. Configuration


### 1.10.8. License

- **Type:** Proprietary
- **Cost:** Free

## 1.11. Cloud Storage for Firebase
### 1.11.3. Version
N/A (Managed Service)

### 1.11.4. Category
File Storage

### 1.11.5. Features

- Scalable object storage
- Secure uploads/downloads
- Integration with Cloud Functions

### 1.11.6. Requirements

- REQ-8-001
- REQ-12-003

### 1.11.7. Configuration

- **Security Rules:** Rules to ensure users can only upload to their tenant-specific paths.

### 1.11.8. License

- **Type:** Proprietary
- **Cost:** Usage-based

## 1.12. Firebase Hosting
### 1.12.3. Version
N/A (Managed Service)

### 1.12.4. Category
Web Hosting

### 1.12.5. Features

- Global CDN
- Free SSL
- Easy deployment

### 1.12.6. Requirements

- REQ-TOP-001
- REQ-LRC-001
- REQ-19-005

### 1.12.7. Configuration

- **Sites:** Used for the public-facing tenant registration page, Privacy Policy, ToS, and the online help center.

### 1.12.8. License

- **Type:** Proprietary
- **Cost:** Usage-based (generous free tier)

## 1.13. Firebase Crashlytics
### 1.13.3. Version
N/A (Managed Service)

### 1.13.4. Category
Monitoring & Alerting

### 1.13.5. Features

- Real-time crash reporting
- Stack trace analysis
- Custom logging

### 1.13.6. Requirements

- REQ-MAA-005
- REQ-DX-004

### 1.13.7. Configuration

- **Notes:** Integrated into all builds (dev, staging, prod) and pointed to corresponding Firebase projects.

### 1.13.8. License

- **Type:** Proprietary
- **Cost:** Free

## 1.14. Google Cloud Monitoring
### 1.14.3. Version
N/A (Managed Service)

### 1.14.4. Category
Monitoring & Alerting

### 1.14.5. Features

- Metrics collection
- Custom dashboards
- Alerting on thresholds

### 1.14.6. Requirements

- REQ-MAA-003
- REQ-MAA-004

### 1.14.7. Configuration

- **Notes:** Used to monitor backend service health (Firestore latency, Function errors) and trigger alerts to the dev team.

### 1.14.8. License

- **Type:** Proprietary
- **Cost:** Usage-based (generous free tier)

## 1.15. Hive
### 1.15.3. Version
2.2.x (latest stable)

### 1.15.4. Category
Local Storage (Mobile)

### 1.15.5. Features

- Lightweight and fast NoSQL database
- Native Dart implementation
- Strong encryption support

### 1.15.6. Requirements

- REQ-ATT-004
- REQ-BRS-004

### 1.15.7. Configuration

- **Notes:** Used for queueing attendance records when the device is offline.

### 1.15.8. License

- **Type:** Apache 2.0
- **Cost:** Free

## 1.16. flutter_bloc
### 1.16.3. Version
8.1.x (latest stable)

### 1.16.4. Category
State Management

### 1.16.5. Features

- Predictable state management
- Separation of concerns (UI from business logic)
- Testable

### 1.16.6. Requirements

- REQ-ATT-003
- REQ-2-002

### 1.16.7. Configuration

- **Notes:** Chosen state management library to handle UI state, events, and business logic orchestration in the mobile app.

### 1.16.8. License

- **Type:** MIT
- **Cost:** Free

## 1.17. google_maps_flutter
### 1.17.3. Version
2.6.x (latest stable)

### 1.17.4. Category
Mapping

### 1.17.5. Features

- Display Google Maps
- Markers and overlays
- User location display

### 1.17.6. Requirements

- REQ-ATT-008

### 1.17.7. Configuration

- **Api Key:** API key required and configured per platform (Android/iOS).

### 1.17.8. License

- **Type:** BSD-3-Clause
- **Cost:** Usage-based (Google Maps Platform)

## 1.18. mockito
### 1.18.3. Version
5.4.x (latest stable)

### 1.18.4. Category
Testing Library

### 1.18.5. Features

- Mock object creation
- Stubbing method calls
- Verification of interactions

### 1.18.6. Requirements

- REQ-DX-003

### 1.18.7. Configuration

- **Notes:** Used for creating mock dependencies in unit and widget tests.

### 1.18.8. License

- **Type:** MIT
- **Cost:** Free

## 1.19. flutter_lints
### 1.19.3. Version
4.0.x (latest stable)

### 1.19.4. Category
Code Quality

### 1.19.5. Features

- Enforces official Dart style guide
- Identifies potential code issues

### 1.19.6. Requirements

- REQ-DX-002

### 1.19.7. Configuration

- **Notes:** Integrated into CI/CD pipeline as a mandatory check.

### 1.19.8. License

- **Type:** BSD-3-Clause
- **Cost:** Free

## 1.20. googleapis
### 1.20.3. Version
140.x (latest stable)

### 1.20.4. Category
API Client (Backend)

### 1.20.5. Features

- Official Node.js client for Google APIs
- Supports OAuth 2.0
- Type definitions for TypeScript

### 1.20.6. Requirements

- REQ-7-002
- REQ-7-003

### 1.20.7. Configuration

- **Notes:** Used in a Cloud Function to interact with the Google Sheets API for data export.

### 1.20.8. License

- **Type:** Apache 2.0
- **Cost:** Free

## 1.21. GitHub Actions
### 1.21.3. Version
N/A (Managed Service)

### 1.21.4. Category
CI/CD

### 1.21.5. Features

- Workflow automation
- Integration with GitHub repository
- Large marketplace of actions

### 1.21.6. Requirements

- REQ-DX-001
- REQ-PUB-003

### 1.21.7. Configuration

- **Notes:** Used to automate building, linting, testing, and deploying the mobile app and Cloud Functions.

### 1.21.8. License

- **Type:** Proprietary
- **Cost:** Free for public repos, usage-based for private

## 1.22. GitHub Dependabot
### 1.22.3. Version
N/A (Managed Service)

### 1.22.4. Category
Security Tooling

### 1.22.5. Features

- Automated dependency scanning
- Vulnerability alerts
- Automatic pull requests for updates

### 1.22.6. Requirements

- REQ-11-005
- REQ-DX-005

### 1.22.7. Configuration

- **Notes:** Configured to scan both pubspec.yaml (Flutter) and package.json (Functions).

### 1.22.8. License

- **Type:** Proprietary
- **Cost:** Included with GitHub

## 1.23. Firebase Local Emulator Suite
### 1.23.3. Version
latest

### 1.23.4. Category
Developer Tooling

### 1.23.5. Features

- Local emulation of Firebase services
- Fast development cycles
- Offline testing

### 1.23.6. Requirements

- REQ-DX-006
- REQ-BRS-007
- REQ-PSCM-004

### 1.23.7. Configuration

- **Notes:** Used to emulate Auth, Firestore, Functions, and Storage for local development and testing.

### 1.23.8. License

- **Type:** Proprietary
- **Cost:** Free



---

# 2. Configuration

- **Summary:** This technology stack is heavily centered on the Firebase ecosystem, leveraging its serverless, MBaaS capabilities to meet the system's requirements for rapid development, scalability, and reliability. Flutter is the clear choice for the cross-platform mobile client, given its tight integration with Firebase and the Dart language. For the backend, TypeScript is used with Node.js in Cloud Functions to provide type-safe, event-driven, server-side logic. The entire stack is supported by a robust DevOps toolchain using GitHub Actions for CI/CD and the Firebase Emulator Suite for efficient local development.


---


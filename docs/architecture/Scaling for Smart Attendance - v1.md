# Specification

# 1. Deployment Model

- **Infrastructure Requirements Analysis:**
  
  - **Compute Services:**
    
    - **Type:** Serverless Functions
    - **Provider:** Firebase Cloud Functions
    - **Justification:** The architecture is event-driven and serverless, requiring compute that scales with requests. Cloud Functions are natively integrated with Firestore and other Firebase services, fulfilling requirements REQ-TOP-002, REQ-ATT-005, and REQ-7-003.
    
  - **Storage Services:**
    
    - **Type:** Object Storage
    - **Provider:** Firebase Cloud Storage
    - **Justification:** Required for bulk user data import via CSV (REQ-8-001) and long-term archival of attendance data in NDJSON format (REQ-12-003).
    
  - **Database Services:**
    
    - **Type:** Managed NoSQL Database
    - **Provider:** Firebase Firestore
    - **Justification:** The core data persistence layer for the application, providing real-time sync, offline capabilities, and a serverless scaling model as mandated by the architecture (REQ-MTDM-002).
    
  - **Messaging Services:**
    
    - **Type:** Push & Scheduled Messaging
    - **Provider:** Firebase Cloud Messaging (FCM) & Google Cloud Scheduler
    - **Justification:** FCM is required for all user notifications (REQ-AWF-007, REQ-9-001). Cloud Scheduler is required to trigger periodic batch jobs like data archival (REQ-12-003) and Google Sheets sync (REQ-7-003).
    
  - **Caching Services:**
    
    - **Type:** Not Required
    - **Provider:** N/A
    - **Justification:** The SRS specifies client-side caching (Hive) and Firestore's own persistence. No dedicated server-side caching infrastructure (e.g., Redis, Memcached) is required by the current architecture.
    
  - **Deployment Orchestration:**
    
    - **Type:** CI/CD Pipeline
    - **Provider:** GitHub Actions
    - **Justification:** Explicitly mandated by REQ-DX-001 to automate the build, test, and deployment of both the Flutter application and the Firebase backend assets.
    
  
- **Cloud Vs On Premise Strategy:**
  
  - **Hosting Model:** Cloud-Native (PaaS/Serverless)
  - **Architecture Model:** Managed Serverless Platform
  - **Justification:** The entire technology stack is built on the Firebase platform, a managed serverless offering. This aligns with the project's goal of a low-maintenance, scalable, and cost-effective solution without dedicated infrastructure management.
  
- **Region And Availability Design:**
  
  - **Primary Region:** us-central1
  - **Availability Strategy:** Multi-Zone by Default
  - **Justification:** Firebase services are regional and automatically replicate data across multiple availability zones within that region. This inherently provides high availability to meet the 99.9% uptime SLO (REQ-BRS-003) without manual configuration.
  
- **Resource Allocation And Scaling:**
  
  - **Compute Scaling:**
    
    - **Mechanism:** Managed Auto-scaling
    - **Provider:** Firebase Cloud Functions
    - **Trigger:** Event-driven (HTTP, Firestore, Pub/Sub triggers)
    - **Justification:** Scaling is handled automatically by the provider based on the number of incoming events/requests, aligning with the serverless model and scalability requirements (REQ-PSCM-001).
    
  - **Database Scaling:**
    
    - **Mechanism:** Managed Auto-scaling
    - **Provider:** Firebase Firestore
    - **Trigger:** Automatic based on connection count and data load
    - **Justification:** Firestore scales transparently to handle application load, eliminating the need for manual capacity planning.
    
  - **Cost Optimization:**
    
    - **Strategies:**
      
      - Use of Firebase Local Emulator Suite during development to eliminate cloud costs (REQ-DX-006, REQ-PSCM-004).
      - Configuration of Google Cloud Billing alerts to monitor and control spend (REQ-MAA-007).
      - Implementation of data retention policies and archival to cheaper storage (REQ-12-003).
      
    
  
- **Service Mesh And Networking Topology:**
  
  - **Service Discovery:** Not Required (Managed by Provider)
  - **Api Gateway:** Not Required
  - **Network Architecture:** Default Provider VPC
  - **Dns And Service Resolution:** Managed by Firebase Hosting and Google Cloud
  - **Justification:** A serverless architecture on Firebase does not require a service mesh, custom API gateway, or complex VPC design. Service invocation is handled by event triggers and built-in HTTPS endpoints, simplifying the network topology.
  
- **Security And Compliance Implementation:**
  
  - **Network Security:**
    
    - **Controls:**
      
      - Firebase Security Rules for Firestore and Cloud Storage to enforce tenant isolation and RBAC (REQ-11-001, REQ-11-002).
      - Firebase App Check to ensure traffic originates from legitimate app instances (REQ-11-003).
      
    
  - **Secrets Management:**
    
    - **Tool:** GitHub Actions Secrets
    - **Scope:** CI/CD Pipeline
    - **Justification:** Required for securely storing environment-specific API keys, signing credentials, and service account keys needed during the automated deployment process.
    
  - **Identity And Access Management:**
    
    - **Provider:** Google Cloud IAM
    - **Strategy:** Principle of Least Privilege with predefined roles (Viewer, Editor, Admin) applied to development, staging, and production projects.
    - **Justification:** Controls developer and operator access to the underlying cloud infrastructure and services.
    
  - **Data Protection:**
    
    - **In Transit:** TLS 1.2+ (Provider-managed)
    - **At Rest:** AES-256 (Provider-managed)
    - **Justification:** All data is encrypted by default in transit and at rest by the Firebase platform, fulfilling standard security requirements.
    
  
- **Deployment Environments:**
  
  - **Strategy:** Multi-Project Isolation
  - **Justification:** Explicitly required by REQ-DX-007 to ensure strict separation between development, testing, and live production environments, preventing data contamination and enabling safe deployment validation.
  - **Environments:**
    
    - **Name:** development  
**Purpose:** Day-to-day development and local testing against emulated or cloud services.  
**Firebase Project:** smart-attendance-dev  
**Deployment Trigger:** Manual or on-demand from feature branches.  
**Data Isolation:** Full project separation. Contains synthetic test data.  
    - **Name:** staging  
**Purpose:** Pre-production environment for integration testing, QA validation, and user acceptance testing (UAT).  
**Firebase Project:** smart-attendance-staging  
**Deployment Trigger:** Automated deployment from a `staging` or `release` branch.  
**Data Isolation:** Full project separation. Contains a sanitized, near-production data set.  
    - **Name:** production  
**Purpose:** Live environment for all end-users.  
**Firebase Project:** smart-attendance-prod  
**Deployment Trigger:** Automated or manual promotion from the `main` branch after successful staging validation.  
**Data Isolation:** Full project separation. Contains all live tenant data.  
    
  
- **Application Deployment:**
  
  - **Client Application:**
    
    - **Type:** Mobile Application (Flutter)
    - **Targets:**
      
      - **Platform:** Android  
**Store:** Google Play Store  
**Artifact:** Android App Bundle (AAB)  
**Deployment Process:** Automated upload to Internal Testing track via GitHub Actions.  
      - **Platform:** iOS  
**Store:** Apple App Store  
**Artifact:** IPA File  
**Deployment Process:** Automated upload to TestFlight via GitHub Actions.  
      
    - **Justification:** Defines the deployment path for the user-facing mobile client as specified in section 7.1.
    
  - **Static Web Assets:**
    
    - **Type:** Web Pages
    - **Provider:** Firebase Hosting
    - **Assets:**
      
      - Tenant Registration Page
      - Privacy Policy & ToS Documents
      - Online Help Center
      
    - **Justification:** Required by REQ-TOP-001 and REQ-LRC-001 for public-facing web content.
    
  


---


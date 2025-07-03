# Specification

# 1. Event Driven Architecture Analysis

- **System Overview:**
  
  - **Analysis Date:** 2025-06-13
  - **Architecture Type:** Serverless, Event-Driven
  - **Technology Stack:**
    
    - Firebase Firestore
    - Firebase Cloud Functions
    - Firebase Authentication
    - Firebase Cloud Messaging (FCM)
    - Google Cloud Scheduler
    
  - **Bounded Contexts:**
    
    - Tenant Lifecycle Management
    - User & Authentication
    - Attendance & Approvals
    - External Integrations (Google Sheets)
    
  
- **Project Specific Events:**
  
  - **Event Id:** EVT-TENANT-001  
**Event Name:** TenantRegistrationSubmitted  
**Event Type:** command  
**Category:** Tenant Lifecycle  
**Description:** Fired when a new user completes the public registration form to sign up their organization.  
**Trigger Condition:** HTTP request to a dedicated Cloud Function endpoint from the public registration page.  
**Source Context:** Public Registration Web Page  
**Target Contexts:**
    
    - Tenant Lifecycle Management
    
**Payload:**
    
    - **Schema:**
      
      - **Organization Name:** string
      - **User Name:** string
      - **User Email:** string
      - **Password:** string
      
    - **Required Fields:**
      
      - organizationName
      - userName
      - userEmail
      - password
      
    - **Optional Fields:**
      
      
    
**Frequency:** low  
**Business Criticality:** critical  
**Data Source:**
    
    - **Database:** N/A
    - **Table:** N/A
    - **Operation:** create
    
**Routing:**
    
    - **Routing Key:** tenant.provision
    - **Exchange:** HTTP Endpoint
    - **Queue:** N/A
    
**Consumers:**
    
    - **Service:** Cloud Functions  
**Handler:** tenantProvisioningFunction  
**Processing Type:** async  
    
**Dependencies:**
    
    - REQ-TOP-001
    
**Error Handling:**
    
    - **Retry Strategy:** Client-side retry logic
    - **Dead Letter Queue:** N/A
    - **Timeout Ms:** 30000
    
  - **Event Id:** EVT-ATT-001  
**Event Name:** AttendanceRecordCreated  
**Event Type:** domain  
**Category:** Attendance & Approvals  
**Description:** Fired when a new attendance record document is created in Firestore. Triggers multiple downstream processes.  
**Trigger Condition:** onCreate trigger on Firestore path /tenants/{tenantId}/attendance/{attendanceId}  
**Source Context:** Attendance & Approvals  
**Target Contexts:**
    
    - Attendance & Approvals
    - Notifications
    
**Payload:**
    
    - **Schema:**
      
      
    - **Required Fields:**
      
      - userId
      - clientCheckInTimestamp
      - checkInLocation
      
    - **Optional Fields:**
      
      - eventId
      
    
**Frequency:** high  
**Business Criticality:** critical  
**Data Source:**
    
    - **Database:** Firestore
    - **Table:** attendance
    - **Operation:** create
    
**Routing:**
    
    - **Routing Key:** firestore.attendance.create
    - **Exchange:** Firestore Triggers
    - **Queue:** N/A
    
**Consumers:**
    
    - **Service:** Cloud Functions  
**Handler:** attendanceAugmentationFunction  
**Processing Type:** async  
    - **Service:** Cloud Functions  
**Handler:** supervisorNotificationFunction  
**Processing Type:** async  
    
**Dependencies:**
    
    - REQ-ATT-005
    - REQ-AWF-007
    
**Error Handling:**
    
    - **Retry Strategy:** Firebase native exponential backoff
    - **Dead Letter Queue:** gcp-pubsub-dlq-attendance
    - **Timeout Ms:** 60000
    
  - **Event Id:** EVT-ATT-002  
**Event Name:** AttendanceRecordActioned  
**Event Type:** domain  
**Category:** Attendance & Approvals  
**Description:** Fired when an attendance record's status is updated to 'Approved' or 'Rejected'.  
**Trigger Condition:** onUpdate trigger on Firestore path /tenants/{tenantId}/attendance/{attendanceId} where status field changes.  
**Source Context:** Attendance & Approvals  
**Target Contexts:**
    
    - Notifications
    
**Payload:**
    
    - **Schema:**
      
      
    - **Required Fields:**
      
      - userId
      - status
      - approvalDetails
      
    - **Optional Fields:**
      
      
    
**Frequency:** high  
**Business Criticality:** important  
**Data Source:**
    
    - **Database:** Firestore
    - **Table:** attendance
    - **Operation:** update
    
**Routing:**
    
    - **Routing Key:** firestore.attendance.update.status
    - **Exchange:** Firestore Triggers
    - **Queue:** N/A
    
**Consumers:**
    
    - **Service:** Cloud Functions  
**Handler:** subordinateNotificationFunction  
**Processing Type:** async  
    
**Dependencies:**
    
    - REQ-AWF-007
    - REQ-9-003
    
**Error Handling:**
    
    - **Retry Strategy:** Firebase native exponential backoff
    - **Dead Letter Queue:** gcp-pubsub-dlq-notifications
    - **Timeout Ms:** 60000
    
  - **Event Id:** EVT-SYS-001  
**Event Name:** ScheduledDataArchival  
**Event Type:** system  
**Category:** Data Management  
**Description:** A scheduled event that triggers the data archival and purging process for all tenants.  
**Trigger Condition:** Scheduled trigger from Google Cloud Scheduler (e.g., daily at 02:00 UTC).  
**Source Context:** System Scheduler  
**Target Contexts:**
    
    - Data Management
    
**Payload:**
    
    - **Schema:**
      
      
    - **Required Fields:**
      
      
    - **Optional Fields:**
      
      
    
**Frequency:** low  
**Business Criticality:** normal  
**Data Source:**
    
    - **Database:** N/A
    - **Table:** N/A
    - **Operation:** read
    
**Routing:**
    
    - **Routing Key:** system.schedule.archive
    - **Exchange:** Cloud Scheduler
    - **Queue:** N/A
    
**Consumers:**
    
    - **Service:** Cloud Functions  
**Handler:** dataArchivalFunction  
**Processing Type:** async  
    
**Dependencies:**
    
    - REQ-12-003
    
**Error Handling:**
    
    - **Retry Strategy:** Cloud Scheduler native retry
    - **Dead Letter Queue:** gcp-pubsub-dlq-system
    - **Timeout Ms:** 540000
    
  
- **Event Types And Schema Design:**
  
  - **Essential Event Types:**
    
    - **Event Name:** TenantRegistrationSubmitted  
**Category:** integration  
**Description:** Initiates the entire onboarding process for a new organization.  
**Priority:** high  
    - **Event Name:** AttendanceRecordCreated  
**Category:** domain  
**Description:** The most frequent and critical event, triggering data processing and notifications.  
**Priority:** high  
    - **Event Name:** AttendanceRecordActioned  
**Category:** domain  
**Description:** Closes the feedback loop to the user about the status of their request.  
**Priority:** high  
    - **Event Name:** ScheduledDataArchival  
**Category:** system  
**Description:** Essential for data lifecycle management and cost control.  
**Priority:** medium  
    
  - **Schema Design:**
    
    - **Format:** JSON
    - **Reasoning:** This is the native format for Firestore documents and the default for Cloud Functions triggers. It requires no translation layer, maximizing performance and minimizing complexity.
    - **Consistency Approach:** For Firestore-triggered events, the event payload is the document snapshot itself. This ensures the schema is always consistent with the data model. Schemas are documented in the data model definition.
    
  - **Schema Evolution:**
    
    - **Backward Compatibility:** True
    - **Forward Compatibility:** False
    - **Strategy:** Additive changes only. Consumers must be coded defensively to handle the absence of new, optional fields. Breaking changes require a coordinated deployment of functions and clients.
    
  - **Event Structure:**
    
    - **Standard Fields:**
      
      - eventId
      - eventTimestamp
      - traceId
      - sourceService
      
    - **Metadata Requirements:**
      
      - For Firestore triggers, the event context (params like tenantId, userId) is provided by the Cloud Function wrapper and used for tracing and security.
      
    
  
- **Event Routing And Processing:**
  
  - **Routing Mechanisms:**
    
    - **Type:** Firestore Path-Based Triggers  
**Description:** Cloud Functions are directly subscribed to data change events (onCreate, onUpdate, onDelete) on specific Firestore document paths. This is the primary mechanism for reactive workflows.  
**Use Case:** Triggering data augmentation, validation, and notifications when a document changes.  
    - **Type:** Google Cloud Scheduler Triggers  
**Description:** Cloud Functions are invoked on a recurring schedule (cron job).  
**Use Case:** Running batch jobs like daily data archival or Google Sheets synchronization.  
    - **Type:** HTTP Triggers  
**Description:** Cloud Functions are exposed via a public HTTPS endpoint.  
**Use Case:** Handling the initial tenant registration from the public-facing web page.  
    
  - **Processing Patterns:**
    
    - **Pattern:** parallel  
**Applicable Scenarios:**
    
    - AttendanceRecordCreated event triggering both data augmentation and supervisor notifications simultaneously.
    
**Implementation:** Two separate Cloud Functions are configured with the same Firestore trigger path. Firebase invokes both in parallel.  
    
  - **Filtering And Subscription:**
    
    - **Filtering Mechanism:** Primarily path-based filtering native to Firestore triggers. Any attribute-based filtering (e.g., acting only when 'status' field changes) is implemented within the consumer function's logic.
    - **Subscription Model:** Direct subscription. The Cloud Function deployment configuration defines the exact event source (e.g., Firestore path, scheduler job) it subscribes to.
    - **Routing Keys:**
      
      - /tenants/{tenantId}/attendance/{attendanceId}
      
    
  - **Handler Isolation:**
    
    - **Required:** True
    - **Approach:** Native Cloud Functions Environment
    - **Reasoning:** Each Cloud Function runs in its own isolated, containerized environment, managed by Google Cloud. This provides inherent handler isolation without additional configuration.
    
  - **Delivery Guarantees:**
    
    - **Level:** at-least-once
    - **Justification:** This is the native delivery guarantee provided by Firebase for Firestore and Scheduler triggers, ensuring that no event is lost, at the cost of potential duplicate deliveries.
    - **Implementation:** All Cloud Function handlers must be designed to be idempotent. This is a critical requirement (REQ-TOP-002, REQ-ATT-005) and is achieved by checking for existing state before performing actions (e.g., check if geocoded address already exists before processing).
    
  
- **Event Storage And Replay:**
  
  - **Persistence Requirements:**
    
    - **Required:** True
    - **Duration:** N/A - Inherent
    - **Reasoning:** The system is state-oriented, not event-sourced. The 'event' is the change in state, which is persisted in Firestore. The persistence of the event is therefore inherent to the persistence of the application's data.
    
  - **Event Sourcing:**
    
    - **Necessary:** False
    - **Justification:** The architecture is based on storing the current state of entities, not a log of events to derive state. Introducing event sourcing would add significant complexity with no clear benefit over the current model for the specified requirements.
    - **Scope:**
      
      
    
  - **Technology Options:**
    
    - **Technology:** Firestore  
**Suitability:** high  
**Reasoning:** Acts as the state store. The change stream from Firestore provides the events, serving as a de-facto event log for reactive processing.  
    
  - **Replay Capabilities:**
    
    - **Required:** False
    - **Scenarios:**
      
      
    - **Implementation:** System recovery is not based on event replay. It is handled by Firestore's Point-in-Time Recovery (PITR) and automated backups, which restore the system's state to a previous point.
    
  - **Retention Policy:**
    
    - **Strategy:** State-based Retention
    - **Duration:** Configurable per tenant (90-730 days)
    - **Archiving Approach:** The 'event' (i.e., the attendance document) is purged from the primary data store (Firestore) after its retention period and archived to Firebase Storage, as per REQ-12-003.
    
  
- **Dead Letter Queue And Error Handling:**
  
  - **Dead Letter Strategy:**
    
    - **Approach:** Utilize Cloud Functions v2 native Dead Letter Queue functionality.
    - **Queue Configuration:** For each critical, non-synchronous function, configure a dedicated Pub/Sub topic to receive events that have failed all retry attempts.
    - **Processing Logic:** A separate monitoring alert will be configured on the DLQ topic to notify the development team. Manual or semi-automated reprocessing can be performed after investigation.
    
  - **Retry Policies:**
    
    - **Error Type:** All transient errors (network timeouts, temporary service unavailability)  
**Max Retries:** 5  
**Backoff Strategy:** exponential  
**Delay Configuration:** Managed automatically by the Firebase Cloud Functions runtime environment.  
    
  - **Poison Message Handling:**
    
    - **Detection Mechanism:** A message is considered 'poison' after exhausting the built-in retry attempts.
    - **Handling Strategy:** The event is automatically routed to the configured DLQ (Pub/Sub topic) for offline analysis.
    - **Alerting Required:** True
    
  - **Error Notification:**
    
    - **Channels:**
      
      - Google Cloud Monitoring Alerts
      - Email
      
    - **Severity:** critical
    - **Recipients:**
      
      - Development Team
      
    
  - **Recovery Procedures:**
    
    - **Scenario:** A bug in an event handler function causes all events to fail and fill the DLQ.  
**Procedure:** 1. Disable the faulty function trigger. 2. Deploy a corrected version of the function. 3. Write a one-off utility function to read from the DLQ, transform, and re-process the failed events. 4. Re-enable the original function trigger.  
**Automation Level:** semi-automated  
    
  
- **Event Versioning Strategy:**
  
  - **Schema Evolution Approach:**
    
    - **Strategy:** Additive Schema Changes
    - **Versioning Scheme:** Implicit (No version number in payload)
    - **Migration Strategy:** Consumers must be coded defensively to handle the absence of newly added optional fields. Breaking changes are avoided.
    
  - **Compatibility Requirements:**
    
    - **Backward Compatible:** True
    - **Forward Compatible:** False
    - **Reasoning:** The primary requirement is that new consumers can process old events. An old consumer encountering a new event with extra fields will not fail if using native SDKs, but will not understand the new data.
    
  - **Version Identification:**
    
    - **Mechanism:** Not required
    - **Location:** N/A
    - **Format:** N/A
    
  - **Consumer Upgrade Strategy:**
    
    - **Approach:** Deploy consumer (Cloud Function) updates before the code that generates the new event schema is deployed.
    - **Rollout Strategy:** Standard deployment via CI/CD pipeline.
    - **Rollback Procedure:** Redeploy the previous stable version of the Cloud Function from the CI/CD pipeline.
    
  - **Schema Registry:**
    
    - **Required:** False
    - **Technology:** N/A
    - **Governance:** Schema is managed as part of the application's data model code and technical documentation. A registry would be over-engineering for this system.
    
  
- **Event Monitoring And Observability:**
  
  - **Monitoring Capabilities:**
    
    - **Capability:** Function Performance Monitoring  
**Justification:** To meet performance SLOs and detect degradation.  
**Implementation:** Google Cloud Monitoring dashboards for execution count, duration (P50, P95, P99), and memory usage.  
    - **Capability:** Function Error & Failure Reporting  
**Justification:** To ensure system reliability and trigger alerts on critical issues.  
**Implementation:** Google Cloud Logging for detailed logs, and Google Cloud Monitoring for error rate metrics and alerting.  
    - **Capability:** DLQ Monitoring  
**Justification:** To identify and react to poison messages and persistent failures.  
**Implementation:** Google Cloud Monitoring alert on the number of undelivered messages in the DLQ's Pub/Sub subscription.  
    
  - **Tracing And Correlation:**
    
    - **Tracing Required:** True
    - **Correlation Strategy:** Leverage native trace context propagation.
    - **Trace Id Propagation:** Managed automatically by Google Cloud Trace for services within the GCP ecosystem (Firestore Triggers -> Cloud Functions).
    
  - **Performance Metrics:**
    
    - **Metric:** Cloud Function P95 Execution Time  
**Threshold:** < 1000ms for high-frequency functions  
**Alerting:** True  
    - **Metric:** Cloud Function Error Rate  
**Threshold:** > 1% over a 5-minute window  
**Alerting:** True  
    - **Metric:** DLQ Message Count  
**Threshold:** > 0  
**Alerting:** True  
    
  - **Event Flow Visualization:**
    
    - **Required:** True
    - **Tooling:** Google Cloud Trace
    - **Scope:** Visualize the flow from an event source (e.g., Firestore write) through the Cloud Function invocation, including latency at each step.
    
  - **Alerting Requirements:**
    
    - **Condition:** Cloud Function error rate exceeds 1%  
**Severity:** critical  
**Response Time:** Immediate investigation required.  
**Escalation Path:**
    
    - On-call Developer
    
    - **Condition:** Event lands in a Dead Letter Queue  
**Severity:** warning  
**Response Time:** Investigate within 1 business day.  
**Escalation Path:**
    
    - Development Team
    
    
  
- **Implementation Priority:**
  
  - **Component:** Idempotent Logic in Core Functions  
**Priority:** high  
**Dependencies:**
    
    - attendanceAugmentationFunction
    - tenantProvisioningFunction
    
**Estimated Effort:** Low (Part of initial development)  
  - **Component:** DLQ Configuration for Critical Functions  
**Priority:** high  
**Dependencies:**
    
    - attendanceAugmentationFunction
    
**Estimated Effort:** Low  
  - **Component:** Cloud Monitoring Dashboards & Alerts  
**Priority:** medium  
**Dependencies:**
    
    
**Estimated Effort:** Medium  
  
- **Risk Assessment:**
  
  - **Risk:** Non-idempotent event handlers causing data corruption or duplicate notifications on retries.  
**Impact:** high  
**Probability:** medium  
**Mitigation:** Strict code reviews and unit tests to enforce idempotent logic in all Cloud Function handlers.  
  - **Risk:** Cascading failures due to a bug in a high-frequency event handler (e.g., AttendanceRecordCreated).  
**Impact:** high  
**Probability:** low  
**Mitigation:** Implement robust DLQ strategy and configure aggressive alerting on error rates to allow for rapid disabling of the faulty function.  
  
- **Recommendations:**
  
  - **Category:** Reliability  
**Recommendation:** Strictly enforce idempotency for all Firestore-triggered Cloud Functions from day one. This is the most critical principle for reliability in this architecture.  
**Justification:** The 'at-least-once' delivery guarantee of Firebase necessitates this to prevent data corruption or duplicate actions during retries.  
**Priority:** high  
  - **Category:** Error Handling  
**Recommendation:** Configure Dead Letter Queues for all asynchronous, critical event handlers (e.g., data augmentation, notifications). Do not rely solely on logs for failure analysis.  
**Justification:** DLQs provide a safety net for persistent failures, preventing data loss and allowing for controlled reprocessing of failed events.  
**Priority:** high  
  - **Category:** Observability  
**Recommendation:** Establish a baseline monitoring dashboard in Google Cloud Monitoring before launch, covering key function metrics (latency, errors, executions) and DLQ size.  
**Justification:** Provides essential visibility into the health of the event-driven components, enabling proactive issue detection rather than reactive problem-solving.  
**Priority:** medium  
  


---


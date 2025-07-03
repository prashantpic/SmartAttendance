# Architecture Design Specification

# 1. Patterns

## 1.1. Request-Reply
### 1.1.2. Type
RequestReply

### 1.1.3. Implementation
Synchronous client-to-backend communication via Firebase SDK calls (which abstract underlying HTTP/gRPC requests) and direct invocation of Callable Cloud Functions.

### 1.1.4. Applicability
Essential for all immediate, user-initiated actions requiring a direct success/failure response. This includes user login (REQ-2-001), fetching user profiles (REQ-2-002), creating events (REQ-6-001), and form submissions where the UI must wait for confirmation before proceeding.

## 1.2. Publish-Subscribe
### 1.2.2. Type
PublishSubscribe

### 1.2.3. Implementation
Asynchronous, event-driven communication using Firestore Triggers to invoke Cloud Functions and Firebase Cloud Messaging (FCM) to deliver push notifications.

### 1.2.4. Applicability
Forms the core of the backend's reactive architecture. It decouples processes such as augmenting attendance records after creation (REQ-ATT-005), sending approval notifications to supervisors (REQ-AWF-007), and alerting admins about integration failures (REQ-7-004).

## 1.3. Message Queue
### 1.3.2. Type
MessageQueue

### 1.3.3. Implementation
Client-side queueing using the local Hive database to temporarily store attendance records created while the application is offline.

### 1.3.4. Applicability
Critical for fulfilling the offline functionality requirement (REQ-ATT-004) and ensuring system reliability (REQ-BRS-004). It guarantees that user-generated data is not lost during network outages and is reliably delivered to the backend upon reconnection.

## 1.4. Idempotent Receiver
### 1.4.2. Type
IdempotentConsumer

### 1.4.3. Implementation
Cloud Functions designed to safely handle duplicate event triggers without causing incorrect side effects. This is primarily achieved by checking for the existence of a resource before creating it.

### 1.4.4. Applicability
A mandatory pattern for system reliability in an event-driven context. It is explicitly required for tenant provisioning (REQ-TOP-002), Google Sheets export (REQ-7-003), and data archival functions (REQ-12-003) to prevent data duplication that could result from event re-delivery.

## 1.5. File Transfer
### 1.5.2. Type
FileTransfer

### 1.5.3. Implementation
Asynchronous batch data processing initiated by file uploads to Firebase Storage (for CSV import) and automated file creation in Storage (for NDJSON archival).

### 1.5.4. Applicability
The designated pattern for handling the system's bulk data operations, as specified for the one-time bulk import of user data (REQ-8-001) and the scheduled, automated archival of historical attendance records (REQ-12-003).

## 1.6. Circuit Breaker
### 1.6.2. Type
CircuitBreaker

### 1.6.3. Implementation
A stateful error-handling mechanism within the scheduled Cloud Function for Google Sheets integration, which distinguishes between transient and terminal API failures.

### 1.6.4. Applicability
Essential for building a resilient integration with the external Google Sheets API. It prevents repeated, failing calls on terminal errors (e.g., permission revoked), updates the sync status to 'Failed', and triggers notifications for manual intervention, as per REQ-7-004 and REQ-7-005.



---


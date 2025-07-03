# Specification

# 1. Logging And Observability Analysis

- **System Overview:**
  
  - **Analysis Date:** 2025-06-13
  - **Technology Stack:**
    
    - Flutter
    - Dart
    - Firebase Firestore
    - Firebase Cloud Functions (TypeScript/Node.js)
    - Firebase Authentication
    - Firebase Cloud Messaging
    - Firebase App Check
    - Google Cloud Monitoring
    - Hive
    
  - **Monitoring Requirements:**
    
    - REQ-MAA-001 (Audit Trail)
    - REQ-MAA-003 (Key Metrics Monitoring)
    - REQ-MAA-004 (Automated Alerts)
    - REQ-MAA-005 (Crash Reporting)
    - REQ-MAA-007 (Budget Alerts)
    - REQ-LRC-005 (PII Handling)
    - REQ-11-007 (Audit Log Access)
    
  - **System Architecture:** Serverless, Event-Driven, Multi-Tenant Mobile Backend as a Service (MBaaS)
  - **Environment:** production
  
- **Log Level And Category Strategy:**
  
  - **Default Log Level:** INFO
  - **Environment Specific Levels:**
    
    - **Environment:** production  
**Log Level:** INFO  
**Justification:** Provides a balance of operational insight and cost control, logging key business events without excessive noise.  
    - **Environment:** staging  
**Log Level:** DEBUG  
**Justification:** Enables detailed tracing and validation of application logic by the QA team before release.  
    - **Environment:** development  
**Log Level:** DEBUG  
**Justification:** Provides maximum verbosity for developers during feature implementation and local testing.  
    
  - **Component Categories:**
    
    - **Component:** Cloud Functions (General)  
**Category:** Application  
**Log Level:** INFO  
**Verbose Logging:** False  
**Justification:** Default logging level for all server-side functions.  
    - **Component:** googleSheetsSyncFunction  
**Category:** Integration  
**Log Level:** INFO  
**Verbose Logging:** True  
**Justification:** Batch job with complex external dependencies; requires detailed step logging at DEBUG level for troubleshooting, but INFO for production success/failure summaries.  
    - **Component:** attendanceProcessorFunction  
**Category:** Application  
**Log Level:** INFO  
**Verbose Logging:** False  
**Justification:** High-frequency function. Logging is focused on successful augmentation or errors.  
    - **Component:** Mobile Client (Flutter)  
**Category:** CrashReport  
**Log Level:** ERROR  
**Verbose Logging:** False  
**Justification:** Client-side logging is focused on capturing unhandled exceptions and fatal errors via Firebase Crashlytics, not general purpose logging.  
    
  - **Sampling Strategies:**
    
    - **Component:** All Components  
**Sampling Rate:** 1.0  
**Condition:** N/A  
**Reason:** The system scale (up to 500 users/tenant) does not warrant the complexity of log sampling. 100% log capture is required for effective troubleshooting and auditing.  
    
  - **Logging Approach:**
    
    - **Structured:** True
    - **Format:** JSON
    - **Standard Fields:**
      
      - timestamp
      - severity
      - message
      - component
      - tenantId
      - correlationId
      - traceId
      
    - **Custom Fields:**
      
      - userId
      - attendanceId
      - sourceDocumentPath
      - action
      
    
  
- **Log Aggregation Architecture:**
  
  - **Collection Mechanism:**
    
    - **Type:** direct
    - **Technology:** Google Cloud Logging
    - **Configuration:**
      
      
    - **Justification:** Cloud Functions natively and automatically stream stdout/stderr to Google Cloud Logging. No agent or sidecar is required.
    
  - **Strategy:**
    
    - **Approach:** centralized
    - **Reasoning:** All server-side logs are centralized into Google Cloud Logging for each respective Firebase project environment (dev, staging, prod), enabling unified search, analysis, and alerting, as required by REQ-MAA-003 and REQ-MAA-004.
    - **Local Retention:** N/A
    
  - **Shipping Methods:**
    
    
  - **Buffering And Batching:**
    
    - **Buffer Size:** Managed by Provider
    - **Batch Size:** 0
    - **Flush Interval:** Managed by Provider
    - **Backpressure Handling:** Managed by the Google Cloud Logging service.
    
  - **Transformation And Enrichment:**
    
    - **Transformation:** Add Contextual Fields  
**Purpose:** Enrich all log messages from a function invocation with consistent metadata.  
**Stage:** collection  
    
  - **High Availability:**
    
    - **Required:** True
    - **Redundancy:** Managed by Provider
    - **Failover Strategy:** Google Cloud Logging is a globally replicated, highly available service.
    
  
- **Retention Policy Design:**
  
  - **Retention Periods:**
    
    - **Log Type:** System Logs (INFO, DEBUG)  
**Retention Period:** 30 days  
**Justification:** Sufficient for short-term operational troubleshooting while managing costs.  
**Compliance Requirement:** N/A  
    - **Log Type:** Error Logs (ERROR, CRITICAL)  
**Retention Period:** 90 days  
**Justification:** Longer retention for error analysis and identifying recurring issues.  
**Compliance Requirement:** N/A  
    - **Log Type:** Security & Access Logs (Cloud Audit Logs)  
**Retention Period:** 400 days  
**Justification:** Meets common compliance standards for retaining security audit information.  
**Compliance Requirement:** General Security Best Practice  
    
  - **Compliance Requirements:**
    
    - **Regulation:** GDPR/CCPA  
**Applicable Log Types:**
    
    - System Logs
    - Error Logs
    
**Minimum Retention:** N/A  
**Special Handling:** PII must be masked or excluded from logs to honor data minimization principles, as per REQ-LRC-005.  
    
  - **Volume Impact Analysis:**
    
    - **Estimated Daily Volume:** Low to Medium
    - **Storage Cost Projection:** Expected to be within the Google Cloud Logging free tier for the initial user load.
    - **Compression Ratio:** Managed by Provider
    
  - **Storage Tiering:**
    
    - **Hot Storage:**
      
      - **Duration:** Managed by Provider
      - **Accessibility:** immediate
      - **Cost:** standard
      
    - **Warm Storage:**
      
      - **Duration:** N/A
      - **Accessibility:** N/A
      - **Cost:** N/A
      
    - **Cold Storage:**
      
      - **Duration:** N/A
      - **Accessibility:** N/A
      - **Cost:** N/A
      
    
  - **Compression Strategy:**
    
    - **Algorithm:** Managed by Provider
    - **Compression Level:** Managed by Provider
    - **Expected Ratio:** N/A
    
  - **Anonymization Requirements:**
    
    - **Data Type:** PII  
**Method:** mask  
**Timeline:** real-time  
**Compliance:** GDPR/CCPA  
    
  
- **Search Capability Requirements:**
  
  - **Essential Capabilities:**
    
    - **Capability:** Filter logs by tenantId  
**Performance Requirement:** <5 seconds  
**Justification:** Essential for troubleshooting issues for a specific customer in a multi-tenant system.  
    - **Capability:** Filter logs by correlationId  
**Performance Requirement:** <5 seconds  
**Justification:** Essential for tracing a single business transaction across multiple event-driven Cloud Functions.  
    - **Capability:** Full-text search on log message  
**Performance Requirement:** <10 seconds  
**Justification:** Standard requirement for general-purpose debugging and error investigation.  
    
  - **Performance Characteristics:**
    
    - **Search Latency:** Seconds
    - **Concurrent Users:** 5
    - **Query Complexity:** complex
    - **Indexing Strategy:** Field-based indexing on standard and custom fields.
    
  - **Indexed Fields:**
    
    - **Field:** jsonPayload.tenantId  
**Index Type:** Keyword  
**Search Pattern:** Exact Match  
**Frequency:** high  
    - **Field:** jsonPayload.correlationId  
**Index Type:** Keyword  
**Search Pattern:** Exact Match  
**Frequency:** high  
    - **Field:** jsonPayload.userId  
**Index Type:** Keyword  
**Search Pattern:** Exact Match  
**Frequency:** medium  
    - **Field:** severity  
**Index Type:** Keyword  
**Search Pattern:** Exact Match  
**Frequency:** high  
    
  - **Full Text Search:**
    
    - **Required:** True
    - **Fields:**
      
      - textPayload
      - jsonPayload.message
      
    - **Search Engine:** Google Cloud Logging Search
    - **Relevance Scoring:** True
    
  - **Correlation And Tracing:**
    
    - **Correlation Ids:**
      
      - correlationId
      - traceId
      
    - **Trace Id Propagation:** Native (Google Cloud Trace)
    - **Span Correlation:** True
    - **Cross Service Tracing:** True
    
  - **Dashboard Requirements:**
    
    - **Dashboard:** Cloud Functions Health  
**Purpose:** Monitor overall performance and error rates of all backend functions as per REQ-MAA-003.  
**Refresh Interval:** 60s  
**Audience:** Developers, SREs  
    - **Dashboard:** Firestore Performance  
**Purpose:** Monitor Firestore latency and document read/write rates as per REQ-MAA-003.  
**Refresh Interval:** 60s  
**Audience:** Developers, SREs  
    
  
- **Storage Solution Selection:**
  
  - **Selected Technology:**
    
    - **Primary:** Google Cloud Logging
    - **Reasoning:** Natively integrated with the entire Firebase/GCP stack, requiring zero configuration for log collection. Provides robust search, alerting, and retention capabilities that meet all system requirements.
    - **Alternatives:**
      
      - Datadog
      - Splunk
      
    
  - **Scalability Requirements:**
    
    - **Expected Growth Rate:** Linear with user activity
    - **Peak Load Handling:** Managed by the Google Cloud Logging service, which is designed for hyper-scale.
    - **Horizontal Scaling:** True
    
  - **Cost Performance Analysis:**
    
    - **Solution:** Google Cloud Logging  
**Cost Per Gb:** Usage-based with a generous free tier.  
**Query Performance:** Excellent, especially on indexed fields.  
**Operational Complexity:** low  
    
  - **Backup And Recovery:**
    
    - **Backup Frequency:** N/A (Managed Service)
    - **Recovery Time Objective:** N/A
    - **Recovery Point Objective:** N/A
    - **Testing Frequency:** N/A
    
  - **Geo Distribution:**
    
    - **Required:** False
    - **Regions:**
      
      
    - **Replication Strategy:** 
    
  - **Data Sovereignty:**
    
    
  
- **Access Control And Compliance:**
  
  - **Access Control Requirements:**
    
    - **Role:** Developer  
**Permissions:**
    
    - logs.viewer
    - monitoring.viewer
    
**Log Types:**
    
    - System Logs
    - Error Logs
    
**Justification:** Allows developers to troubleshoot issues in production without having write access to resources.  
    - **Role:** SRE/Operator  
**Permissions:**
    
    - logs.admin
    - monitoring.admin
    
**Log Types:**
    
    - All
    
**Justification:** Allows full control over logging configuration, alerting, and production resources for incident response.  
    - **Role:** Tenant Admin  
**Permissions:**
    
    
**Log Types:**
    
    
**Justification:** Tenant Admins must NOT have access to system logs. Their access is limited to the business-level `auditLogs` collection in Firestore, as per REQ-MAA-002.  
    
  - **Sensitive Data Handling:**
    
    - **Data Type:** PII  
**Handling Strategy:** mask  
**Fields:**
    
    - email
    - name
    - phoneNumber
    - checkInAddress
    - checkOutAddress
    
**Compliance Requirement:** GDPR/CCPA (REQ-LRC-005)  
    - **Data Type:** Geolocation  
**Handling Strategy:** exclude  
**Fields:**
    
    - checkInLocation
    - checkOutLocation
    
**Compliance Requirement:** Data Minimization  
    
  - **Encryption Requirements:**
    
    - **In Transit:**
      
      - **Required:** True
      - **Protocol:** TLS 1.2+
      - **Certificate Management:** Managed by Google
      
    - **At Rest:**
      
      - **Required:** True
      - **Algorithm:** AES-256
      - **Key Management:** Managed by Google
      
    
  - **Audit Trail:**
    
    - **Log Access:** True
    - **Retention Period:** 400 days
    - **Audit Log Location:** Google Cloud Audit Logs
    - **Compliance Reporting:** True
    
  - **Regulatory Compliance:**
    
    - **Regulation:** GDPR  
**Applicable Components:**
    
    - Cloud Functions
    - Mobile Client
    
**Specific Requirements:**
    
    - Data Minimization
    - Right to Erasure
    - Access Control
    
**Evidence Collection:** PII masking in logs, Firestore security rules, and `auditLogs` collection.  
    
  - **Data Protection Measures:**
    
    - **Measure:** PII Masking in Logs  
**Implementation:** A utility function in each Cloud Function will be used to process and mask log objects before they are written to stdout.  
**Monitoring Required:** True  
    
  
- **Project Specific Logging Config:**
  
  - **Logging Config:**
    
    - **Level:** INFO
    - **Retention:** 30 days
    - **Aggregation:** Google Cloud Logging
    - **Storage:** Google Cloud Logging
    - **Configuration:**
      
      
    
  - **Component Configurations:**
    
    - **Component:** Cloud Functions  
**Log Level:** INFO (Production)  
**Output Format:** JSON  
**Destinations:**
    
    - Google Cloud Logging
    
**Sampling:**
    
    - **Enabled:** False
    - **Rate:** 1.0
    
**Custom Fields:**
    
    - tenantId
    - correlationId
    
    - **Component:** Mobile Client (Flutter)  
**Log Level:** ERROR  
**Output Format:** N/A  
**Destinations:**
    
    - Firebase Crashlytics
    
**Sampling:**
    
    - **Enabled:** False
    - **Rate:** 1.0
    
**Custom Fields:**
    
    - userId
    - tenantId
    
    
  - **Metrics:**
    
    
  - **Alert Rules:**
    
    - **Name:** High Cloud Function Error Rate  
**Condition:** Cloud Function error rate > 2% over a 5-minute window  
**Severity:** Critical  
**Actions:**
    
    - **Type:** email  
**Target:** dev-alerts@example.com  
**Configuration:**
    
    
    
**Suppression Rules:**
    
    
**Escalation Path:**
    
    - On-call SRE
    
    - **Name:** High App Crash Rate  
**Condition:** Crashlytics crash-free user rate < 99.5% for a 24-hour period  
**Severity:** High  
**Actions:**
    
    - **Type:** email  
**Target:** dev-alerts@example.com  
**Configuration:**
    
    
    
**Suppression Rules:**
    
    
**Escalation Path:**
    
    - Mobile Development Lead
    
    - **Name:** Production Budget Alert  
**Condition:** Actual spend exceeds 90% of monthly budget  
**Severity:** High  
**Actions:**
    
    - **Type:** email  
**Target:** billing-alerts@example.com  
**Configuration:**
    
    
    
**Suppression Rules:**
    
    
**Escalation Path:**
    
    - Engineering Manager
    
    
  
- **Implementation Priority:**
  
  - **Component:** Structured Logging Foundation  
**Priority:** high  
**Dependencies:**
    
    
**Estimated Effort:** Low  
**Risk Level:** low  
  - **Component:** PII Masking in Logs  
**Priority:** high  
**Dependencies:**
    
    - Structured Logging Foundation
    
**Estimated Effort:** Medium  
**Risk Level:** medium  
  - **Component:** Production Error & Budget Alerting  
**Priority:** high  
**Dependencies:**
    
    
**Estimated Effort:** Low  
**Risk Level:** low  
  - **Component:** Monitoring Dashboards  
**Priority:** medium  
**Dependencies:**
    
    - Structured Logging Foundation
    
**Estimated Effort:** Medium  
**Risk Level:** low  
  
- **Risk Assessment:**
  
  - **Risk:** PII Leakage in Production Logs  
**Impact:** high  
**Probability:** medium  
**Mitigation:** Implement a mandatory PII masking utility and enforce its use via code reviews. Limit production log access to authorized personnel.  
**Contingency Plan:** If leakage occurs, identify the source, rotate credentials if necessary, purge affected logs, and conduct a post-mortem.  
  - **Risk:** Excessive Logging Costs  
**Impact:** medium  
**Probability:** medium  
**Mitigation:** Set default log level to INFO in production. Implement budget alerts (REQ-MAA-007). Avoid logging large objects or binary data.  
**Contingency Plan:** If costs spike, analyze usage to identify the noisy component, adjust its log level, and refine logging statements.  
  - **Risk:** Ineffective Troubleshooting due to Missing Context  
**Impact:** high  
**Probability:** low  
**Mitigation:** Enforce a logging standard where all server-side logs MUST include `tenantId` and a `correlationId` for tracing event-driven workflows.  
**Contingency Plan:** If an issue cannot be diagnosed, temporarily increase log verbosity for the affected component in a controlled manner.  
  
- **Recommendations:**
  
  - **Category:** Security & Compliance  
**Recommendation:** Prioritize the implementation of a robust PII masking utility for all Cloud Functions before deploying to production.  
**Justification:** This is essential to comply with stated GDPR/CCPA requirements (REQ-LRC-005) and to mitigate the high impact risk of a data breach through log files.  
**Priority:** high  
**Implementation Notes:** Create a shared TypeScript module with a `maskLog(object)` function that recursively masks known sensitive fields. This module should be a mandatory import for all function entry points.  
  - **Category:** Observability  
**Recommendation:** Enforce the universal inclusion of `tenantId` and a unique `correlationId` in all structured logs generated by Cloud Functions.  
**Justification:** In a multi-tenant, event-driven architecture, this is the only effective way to isolate customer-specific issues and trace a single business process across multiple asynchronous function calls.  
**Priority:** high  
**Implementation Notes:** The `correlationId` should be generated at the start of a workflow (e.g., in the attendance marking service on the client) and passed through all subsequent events and function invocations.  
  - **Category:** Cost Management  
**Recommendation:** Configure GCP Budget Alerts for the production project as part of the initial infrastructure setup.  
**Justification:** As a usage-based serverless system, costs can scale unexpectedly. Early warnings via budget alerts (REQ-MAA-007) are critical for preventing significant cost overruns.  
**Priority:** high  
**Implementation Notes:** Set multiple alert thresholds (e.g., 50%, 90% of actual, 100% of forecasted) to provide an early warning system.  
  


---


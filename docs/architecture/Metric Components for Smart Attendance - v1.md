# Specification

# 1. Telemetry And Metrics Analysis

- **System Overview:**
  
  - **Analysis Date:** 2025-06-13
  - **Technology Stack:**
    
    - Flutter
    - Firebase Firestore
    - Firebase Cloud Functions (TypeScript)
    - Firebase Authentication
    - Firebase App Check
    - Firebase Crashlytics
    - Google Cloud Monitoring
    
  - **Monitoring Components:**
    
    - Firebase Crashlytics & Performance Monitoring
    - Google Cloud Monitoring & Alerting
    - Google Cloud Logging
    - Google Cloud Billing
    
  - **Requirements:**
    
    - REQ-PSCM-001
    - REQ-PSCM-002
    - REQ-MAA-003
    - REQ-MAA-004
    - REQ-MAA-007
    - REQ-BRS-003
    - REQ-ATT-004
    - REQ-7-003
    
  - **Environment:** production
  
- **Standard System Metrics Selection:**
  
  - **Hardware Utilization Metrics:**
    
    
  - **Runtime Metrics:**
    
    - **Name:** cloud_function.execution_count  
**Type:** counter  
**Unit:** invocations  
**Description:** Total number of times a Cloud Function is invoked, dimensioned by function name.  
**Technology:** Node.js  
**Collection:**
    
    - **Interval:** 60s
    - **Method:** GCP-native
    
**Criticality:** medium  
    - **Name:** cloud_function.execution_time  
**Type:** histogram  
**Unit:** ms  
**Description:** Distribution of Cloud Function execution durations, dimensioned by function name.  
**Technology:** Node.js  
**Collection:**
    
    - **Interval:** 60s
    - **Method:** GCP-native
    
**Criticality:** high  
    
  - **Request Response Metrics:**
    
    - **Name:** firestore.operation.latency  
**Type:** histogram  
**Unit:** ms  
**Description:** Latency of Firestore read, write, and delete operations.  
**Dimensions:**
    
    - operation_type
    
**Percentiles:**
    
    - p95
    - p99
    
**Collection:**
    
    - **Interval:** 60s
    - **Method:** GCP-native
    
    
  - **Availability Metrics:**
    
    - **Name:** service.availability.rate  
**Type:** gauge  
**Unit:** percentage  
**Description:** Uptime of core backend services, calculated as (successful_requests / total_requests) * 100.  
**Calculation:** Derived from cloud_function.error_rate.  
**Sla Target:** 99.9  
    
  - **Scalability Metrics:**
    
    - **Name:** tenant.active_user.count  
**Type:** gauge  
**Unit:** users  
**Description:** Number of active users per tenant, to monitor against the 500-user design target.  
**Capacity Threshold:** 450  
    
  
- **Application Specific Metrics Design:**
  
  - **Transaction Metrics:**
    
    - **Name:** transaction.attendance_check_in.latency  
**Type:** histogram  
**Unit:** ms  
**Description:** End-to-end latency from user pressing 'Check-in' to UI confirmation.  
**Business_Context:** Directly measures the user-perceived performance for REQ-PSCM-001.  
**Dimensions:**
    
    - network_type
    
**Collection:**
    
    - **Interval:** per-request
    - **Method:** Firebase Performance Monitoring Custom Trace
    
**Aggregation:**
    
    - **Functions:**
      
      - p95
      
    - **Window:** 5m
    
    - **Name:** transaction.supervisor_dashboard.load_latency  
**Type:** histogram  
**Unit:** ms  
**Description:** Time to load the supervisor's approval dashboard.  
**Business_Context:** Directly measures the performance for REQ-PSCM-002.  
**Dimensions:**
    
    - subordinate_count_bucket
    
**Collection:**
    
    - **Interval:** per-request
    - **Method:** Firebase Performance Monitoring Custom Trace
    
**Aggregation:**
    
    - **Functions:**
      
      - p95
      
    - **Window:** 5m
    
    - **Name:** job.sheets_sync.status  
**Type:** counter  
**Unit:** count  
**Description:** Count of Google Sheets sync job outcomes.  
**Business_Context:** Monitors the reliability of the REQ-7-003 data export feature.  
**Dimensions:**
    
    - tenantId
    - outcome
    
**Collection:**
    
    - **Interval:** per-job-run
    - **Method:** Custom metric in Cloud Function
    
**Aggregation:**
    
    - **Functions:**
      
      - sum
      
    - **Window:** 24h
    
    
  - **Cache Performance Metrics:**
    
    
  - **External Dependency Metrics:**
    
    - **Name:** dependency.api.latency  
**Type:** histogram  
**Unit:** ms  
**Description:** Latency of calls to external APIs.  
**Dependency:** Google Sheets API, Google Geocoding API  
**Circuit Breaker Integration:** True  
**Sla:**
    
    - **Response Time:** 5000ms
    - **Availability:** 99.5
    
    
  - **Error Metrics:**
    
    - **Name:** cloud_function.error.rate  
**Type:** gauge  
**Unit:** percentage  
**Description:** Percentage of Cloud Function invocations that result in an error, dimensioned by function name.  
**Error Types:**
    
    - unhandled_exception
    - timeout
    
**Dimensions:**
    
    - function_name
    
**Alert Threshold:** 2  
    - **Name:** client.crash_free_users.rate  
**Type:** gauge  
**Unit:** percentage  
**Description:** Percentage of users who did not experience a crash in a given session.  
**Error Types:**
    
    - unhandled_exception
    
**Dimensions:**
    
    - app_version
    - os_version
    
**Alert Threshold:** 99.5  
    
  - **Throughput And Latency Metrics:**
    
    - **Name:** attendance.record.throughput  
**Type:** summary  
**Unit:** records/minute  
**Description:** Number of attendance records being created per minute.  
**Percentiles:**
    
    
**Buckets:**
    
    
**Sla Targets:**
    
    - **P95:** 
    - **P99:** 
    
    
  
- **Business Kpi Identification:**
  
  - **Critical Business Metrics:**
    
    - **Name:** tenant.signups.count  
**Type:** counter  
**Unit:** tenants  
**Description:** Total number of new organizations that have signed up.  
**Business Owner:** Product Team  
**Calculation:** Increment on successful execution of tenantProvisioningFunction.  
**Reporting Frequency:** daily  
**Target:** 10/week  
    
  - **User Engagement Metrics:**
    
    - **Name:** users.daily_active.count  
**Type:** gauge  
**Unit:** users  
**Description:** Number of unique users who log in per day.  
**Segmentation:**
    
    - tenantId
    - role
    
**Cohort Analysis:** False  
    - **Name:** attendance.records.created_per_day  
**Type:** counter  
**Unit:** records  
**Description:** Number of attendance check-ins created per day.  
**Segmentation:**
    
    - tenantId
    
**Cohort Analysis:** False  
    
  - **Conversion Metrics:**
    
    - **Name:** funnel.tenant_registration.rate  
**Type:** gauge  
**Unit:** percentage  
**Description:** Conversion rate from viewing the registration page to successfully creating a tenant.  
**Funnel Stage:** Registration  
**Conversion Target:** 5  
    
  - **Operational Efficiency Kpis:**
    
    - **Name:** job.user_import.records_processed  
**Type:** gauge  
**Unit:** records  
**Description:** Number of user records successfully processed by the bulk import function.  
**Calculation:** Sum of successful rows in a job run.  
**Benchmark Target:** 1000 records < 5 minutes  
    - **Name:** attendance.approval.time_to_action  
**Type:** histogram  
**Unit:** hours  
**Description:** Time from attendance submission to supervisor approval/rejection.  
**Calculation:** approvalDetails.timestamp - serverSyncTimestamp  
**Benchmark Target:** p90 < 24 hours  
    
  - **Revenue And Cost Metrics:**
    
    - **Name:** gcp.project.cost  
**Type:** gauge  
**Unit:** USD  
**Description:** Total daily and forecasted monthly cost of the production GCP project.  
**Frequency:** daily  
**Accuracy:** high  
    
  - **Customer Satisfaction Indicators:**
    
    
  
- **Collection Interval Optimization:**
  
  - **Sampling Frequencies:**
    
    - **Metric Category:** Backend Service Metrics (Functions, Firestore)  
**Interval:** 60s  
**Justification:** Standard interval for GCP-native metrics, balancing visibility with cost.  
**Resource Impact:** low  
    - **Metric Category:** Client-Side Custom Traces (Latency)  
**Interval:** per-request  
**Justification:** Required to measure user-facing performance SLOs accurately.  
**Resource Impact:** low  
    
  - **High Frequency Metrics:**
    
    - **Name:** transaction.attendance_check_in.latency  
**Interval:** per-request  
**Criticality:** high  
**Cost Justification:** Directly measures a critical user-facing SLO (REQ-PSCM-001).  
    
  - **Cardinality Considerations:**
    
    - **Metric Name:** All tenant-specific metrics  
**Estimated Cardinality:** Potentially high (number of tenants)  
**Dimension Strategy:** Use 'tenantId' as a dimension.  
**Mitigation Approach:** Monitor cost implications. If excessive, aggregate metrics across tenants for some views.  
    
  - **Aggregation Periods:**
    
    - **Metric Type:** Latency  
**Periods:**
    
    - 1m
    - 5m
    - 1h
    - 24h
    
**Retention Strategy:** Raw data for 30 days, aggregated data for 1 year.  
    
  - **Collection Methods:**
    
    - **Method:** real-time  
**Applicable Metrics:**
    
    - cloud_function.error.rate
    - client.crash_free_users.rate
    - transaction.attendance_check_in.latency
    
**Implementation:** Native Firebase and GCP monitoring services.  
**Performance:** high  
    
  
- **Aggregation Method Selection:**
  
  - **Statistical Aggregations:**
    
    - **Metric Name:** cloud_function.error.rate  
**Aggregation Functions:**
    
    - avg
    - rate
    
**Windows:**
    
    - 5m
    - 1h
    
**Justification:** Averaging over time windows is necessary for stable alerting.  
    
  - **Histogram Requirements:**
    
    - **Metric Name:** transaction.attendance_check_in.latency  
**Buckets:**
    
    - 0-100ms
    - 100-500ms
    - 500-1000ms
    - 1000-3000ms
    - >3000ms
    
**Percentiles:**
    
    - p50
    - p90
    - p95
    - p99
    
**Accuracy:** high  
    
  - **Percentile Calculations:**
    
    - **Metric Name:** firestore.operation.latency  
**Percentiles:**
    
    - p95
    - p99
    
**Algorithm:** GCP-native  
**Accuracy:** high  
    
  - **Metric Types:**
    
    - **Name:** tenant.signups.count  
**Implementation:** counter  
**Reasoning:** This value only ever increases.  
**Resets Handling:** Does not reset.  
    - **Name:** tenant.active_user.count  
**Implementation:** gauge  
**Reasoning:** This value can increase or decrease.  
**Resets Handling:** Recalculated daily.  
    
  - **Dimensional Aggregation:**
    
    - **Metric Name:** cloud_function.execution_time  
**Dimensions:**
    
    - function_name
    
**Aggregation Strategy:** Average and P95 over time.  
**Cardinality Impact:** low  
    
  - **Derived Metrics:**
    
    - **Name:** service.availability.rate  
**Calculation:** 100 - cloud_function.error.rate  
**Source Metrics:**
    
    - cloud_function.error.rate
    
**Update Frequency:** 60s  
    
  
- **Storage Requirements Planning:**
  
  - **Retention Periods:**
    
    - **Metric Type:** High-Resolution (raw)  
**Retention Period:** 30 days  
**Justification:** Sufficient for short-term debugging and analysis.  
**Compliance Requirement:** None  
    - **Metric Type:** Aggregated (downsampled)  
**Retention Period:** 395 days  
**Justification:** Allows for year-over-year trend analysis.  
**Compliance Requirement:** None  
    
  - **Data Resolution:**
    
    - **Time Range:** 0-30 days  
**Resolution:** 60s  
**Query Performance:** high  
**Storage Optimization:** N/A  
    - **Time Range:** 31-395 days  
**Resolution:** 1h  
**Query Performance:** medium  
**Storage Optimization:** Downsampling  
    
  - **Downsampling Strategies:**
    
    - **Source Resolution:** 60s  
**Target Resolution:** 1h  
**Aggregation Method:** avg, sum, min, max  
**Trigger Condition:** Age of data > 30 days  
    
  - **Storage Performance:**
    
    - **Write Latency:** <2s
    - **Query Latency:** <5s for dashboard queries
    - **Throughput Requirements:** Handled by GCP
    - **Scalability Needs:** Handled by GCP
    
  - **Query Optimization:**
    
    - **Query Pattern:** Fetch latency for a specific transaction for one tenant over the last 7 days.  
**Optimization Strategy:** Filter first on indexed dimensions like 'metric_name' and 'tenantId', then by time.  
**Indexing Requirements:**
    
    - Provided by Google Cloud Monitoring
    
    
  - **Cost Optimization:**
    
    - **Strategy:** Limit high-cardinality dimensions  
**Implementation:** Avoid using unconstrained user input (e.g., raw URLs) as metric dimensions.  
**Expected Savings:** moderate  
**Tradeoffs:** Reduced granularity in some drill-downs.  
    
  
- **Project Specific Metrics Config:**
  
  - **Standard Metrics:**
    
    - **Name:** firebase_performance/http/response_time  
**Type:** histogram  
**Unit:** ms  
**Collection:**
    
    - **Interval:** per-request
    - **Method:** Firebase Performance SDK
    
**Thresholds:**
    
    - **Warning:** p90 > 2000ms
    - **Critical:** p95 > 4000ms
    
**Dimensions:**
    
    - http_method
    - url_pattern
    
    - **Name:** cloudfunctions.googleapis.com/function/execution_times  
**Type:** histogram  
**Unit:** ms  
**Collection:**
    
    - **Interval:** 60s
    - **Method:** GCP-native
    
**Thresholds:**
    
    - **Warning:** p95 > 3000ms
    - **Critical:** p99 > 8000ms
    
**Dimensions:**
    
    - function_name
    - region
    
    
  - **Custom Metrics:**
    
    - **Name:** transaction/attendance_check_in  
**Description:** Custom trace for REQ-PSCM-001 measuring check-in latency.  
**Calculation:** Time delta between trace start and stop.  
**Type:** histogram  
**Unit:** ms  
**Business Context:** Core user action performance  
**Collection:**
    
    - **Interval:** per-request
    - **Method:** Firebase Performance SDK Custom Trace
    
**Alerting:**
    
    - **Enabled:** True
    - **Conditions:**
      
      - p95 > 3000ms for 5 minutes
      
    
    - **Name:** job/sheets_sync/outcome  
**Description:** Tracks the outcome of the scheduled Google Sheets sync job.  
**Calculation:** Increment counter based on job result.  
**Type:** counter  
**Unit:** count  
**Business Context:** Reliability of reporting integration  
**Collection:**
    
    - **Interval:** per-run
    - **Method:** Custom Cloud Monitoring metric from Cloud Function
    
**Alerting:**
    
    - **Enabled:** True
    - **Conditions:**
      
      - sum(outcome='failure') > 0 in 24h
      
    
    
  - **Dashboard Metrics:**
    
    - **Dashboard:** Production Health Overview  
**Metrics:**
    
    - service.availability.rate
    - client.crash_free_users.rate
    - cloud_function.error.rate
    - firestore.operation.latency
    - gcp.project.cost
    
**Refresh Interval:** 1m  
**Audience:** Development Team, SRE  
    - **Dashboard:** Business KPI Dashboard  
**Metrics:**
    
    - tenant.signups.count
    - users.daily_active.count
    - attendance.records.created_per_day
    - funnel.tenant_registration.rate
    
**Refresh Interval:** 1h  
**Audience:** Product Team, Management  
    
  
- **Implementation Priority:**
  
  - **Component:** Client-Side Crash & Error Reporting (Crashlytics)  
**Priority:** high  
**Dependencies:**
    
    
**Estimated Effort:** Low  
**Risk Level:** low  
  - **Component:** Backend Service Monitoring (Cloud Monitoring Defaults)  
**Priority:** high  
**Dependencies:**
    
    
**Estimated Effort:** Low  
**Risk Level:** low  
  - **Component:** Custom Traces for SLOs (REQ-PSCM-001, REQ-PSCM-002)  
**Priority:** high  
**Dependencies:**
    
    
**Estimated Effort:** Medium  
**Risk Level:** low  
  - **Component:** Business KPI Counters (Signups, Active Users)  
**Priority:** medium  
**Dependencies:**
    
    
**Estimated Effort:** Medium  
**Risk Level:** low  
  
- **Risk Assessment:**
  
  - **Risk:** Metrics configuration leads to excessive cost due to high cardinality or custom metric volume.  
**Impact:** medium  
**Probability:** medium  
**Mitigation:** Set up budget alerts (REQ-MAA-007). Regularly review costs. Avoid using high-cardinality fields like 'userId' as a primary dimension for all metrics.  
**Contingency Plan:** Reduce custom metric collection frequency or increase aggregation intervals.  
  - **Risk:** Alert fatigue desensitizes the development team to critical alerts.  
**Impact:** high  
**Probability:** medium  
**Mitigation:** Carefully tune alert thresholds based on baseline performance in staging. Use separate channels for high-priority (paging) vs. low-priority (email/chat) alerts.  
**Contingency Plan:** Conduct a bi-weekly review of all triggered alerts to fine-tune or remove noisy ones.  
  
- **Recommendations:**
  
  - **Category:** Observability  
**Recommendation:** Instrument custom traces in the Flutter app for all major user-facing workflows, not just the two with explicit SLOs. This includes user registration, event creation, and the approval action.  
**Justification:** Provides holistic insight into user-perceived performance and helps pinpoint bottlenecks proactively.  
**Priority:** medium  
**Implementation Notes:** Use the Firebase Performance Monitoring SDK's `Trace` API.  
  - **Category:** Cost Management  
**Recommendation:** Create a log-based metric in Cloud Monitoring to count the number of documents processed by the Archival and Sheets Sync functions.  
**Justification:** This metric provides a direct link between function execution cost and business value (records processed), helping to optimize the cost-efficiency of these batch jobs.  
**Priority:** low  
**Implementation Notes:** Requires structured logging from the Cloud Functions to output the number of processed records.  
  


---


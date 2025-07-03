# Specification

# 1. Alerting And Incident Response Analysis

- **System Overview:**
  
  - **Analysis Date:** 2025-06-13
  - **Technology Stack:**
    
    - Flutter
    - Firebase Firestore
    - Firebase Cloud Functions (TypeScript)
    - Firebase Authentication
    - Firebase Crashlytics
    - Google Cloud Monitoring
    
  - **Metrics Configuration:**
    
    - Firestore read/write/delete latencies
    - Cloud Function execution counts, duration, and error rates
    - Firebase Crashlytics crash-free user rates
    - Google Cloud Billing budget consumption
    - Per-tenant resource consumption (for Fair Use Policy)
    
  - **Monitoring Needs:**
    
    - Detect and respond to backend service degradation (latency, errors).
    - Identify spikes in mobile application crash rates.
    - Alert on failures in critical integrations (Google Sheets).
    - Notify administrators of Fair Use Policy violations.
    - Prevent budget overruns.
    - Track Dead Letter Queue (DLQ) activity for failed event processing.
    
  - **Environment:** production
  
- **Alert Condition And Threshold Design:**
  
  - **Critical Metrics Alerts:**
    
    - **Metric:** Cloud Function Error Rate  
**Condition:** > 2% over 5 minutes  
**Threshold Type:** static  
**Value:** 2  
**Justification:** A sustained error rate indicates a potential bug or infrastructure issue impacting core backend logic. (REQ-MAA-004)  
**Business Impact:** High - Core workflows like user provisioning or attendance processing may fail.  
    - **Metric:** Application Crash-Free User Rate  
**Condition:** < 99.5% over 1 hour  
**Threshold Type:** static  
**Value:** 99.5  
**Justification:** A drop below this threshold indicates a significant quality issue affecting a large number of users, potentially due to a bad release. (REQ-MAA-004)  
**Business Impact:** Critical - Widespread user-facing failures lead to reputation damage and support load.  
    - **Metric:** Firestore P95 Read/Write Latency  
**Condition:** > 1500ms for 5 minutes  
**Threshold Type:** static  
**Value:** 1500  
**Justification:** Sustained high latency points to inefficient queries or database hotspots, violating performance SLOs. (REQ-MAA-004)  
**Business Impact:** Medium - Degraded user experience, potentially leading to timeouts.  
    - **Metric:** Google Cloud Budget Forecast  
**Condition:** Forecasted spend > 100% of monthly budget  
**Threshold Type:** predictive  
**Value:** 100  
**Justification:** Proactively alerts the team to potential cost overruns before they happen. (REQ-MAA-007)  
**Business Impact:** High - Prevents unexpected financial costs.  
    
  - **Threshold Strategies:**
    
    
  - **Baseline Deviation Alerts:**
    
    
  - **Predictive Alerts:**
    
    - **Metric:** GCP Monthly Cost  
**Prediction Window:** Current Billing Month  
**Confidence Threshold:** N/A  
**Algorithm:** GCP Native Forecasting  
**Training Period:** N/A  
    
  - **Compound Conditions:**
    
    
  
- **Severity Level Classification:**
  
  - **Severity Definitions:**
    
    - **Level:** Critical  
**Criteria:** Widespread service outage, critical data loss risk, or significant user-facing impact (e.g., high crash rate). Immediate automated or manual intervention required.  
**Business Impact:** High  
**Customer Impact:** Severe  
**Response Time:** < 5 minutes  
**Escalation Required:** True  
    - **Level:** High  
**Criteria:** Significant service degradation, failure of a core feature for a subset of users, or risk of SLA violation. Requires urgent attention.  
**Business Impact:** Medium  
**Customer Impact:** Significant  
**Response Time:** < 15 minutes  
**Escalation Required:** True  
    - **Level:** Medium  
**Criteria:** Non-critical service degradation or failure of a non-essential feature. Action required but not immediately.  
**Business Impact:** Low  
**Customer Impact:** Moderate  
**Response Time:** < 1 hour  
**Escalation Required:** False  
    - **Level:** Warning  
**Criteria:** Indicates a potential future problem or a business policy violation. Requires investigation within business hours.  
**Business Impact:** Low  
**Customer Impact:** Minimal  
**Response Time:** < 8 hours  
**Escalation Required:** False  
    
  - **Business Impact Matrix:**
    
    
  - **Customer Impact Criteria:**
    
    
  - **Sla Violation Severity:**
    
    
  - **System Health Severity:**
    
    
  
- **Notification Channel Strategy:**
  
  - **Channel Configuration:**
    
    - **Channel:** pagerduty  
**Purpose:** Primary on-call alerting for Critical incidents requiring immediate human intervention.  
**Applicable Severities:**
    
    - Critical
    
**Time Constraints:** 24/7  
**Configuration:**
    
    
    - **Channel:** slack  
**Purpose:** Team-wide notifications for High and Medium severity alerts, and informational updates.  
**Applicable Severities:**
    
    - High
    - Medium
    
**Time Constraints:** 24/7  
**Configuration:**
    
    - **Channel:** #smart-attendance-alerts
    
    - **Channel:** email  
**Purpose:** Notifications for budget alerts and non-urgent warnings.  
**Applicable Severities:**
    
    - Warning
    
**Time Constraints:** Business Hours  
**Configuration:**
    
    - **Recipient_List:** dev-team@example.com, billing@example.com
    
    - **Channel:** fcm  
**Purpose:** Push notifications sent directly to Tenant Admins for business-level events like integration failures or policy violations.  
**Applicable Severities:**
    
    - High
    - Warning
    
**Time Constraints:** 24/7  
**Configuration:**
    
    
    
  - **Routing Rules:**
    
    
  - **Time Based Routing:**
    
    
  - **Ticketing Integration:**
    
    
  - **Emergency Notifications:**
    
    
  - **Chat Platform Integration:**
    
    
  
- **Alert Correlation Implementation:**
  
  - **Grouping Requirements:**
    
    
  - **Parent Child Relationships:**
    
    
  - **Topology Based Correlation:**
    
    
  - **Time Window Correlation:**
    
    
  - **Causal Relationship Detection:**
    
    
  - **Maintenance Window Suppression:**
    
    - **Maintenance Type:** Scheduled Maintenance Window  
**Suppression Scope:**
    
    - Cloud Function Latency
    - Cloud Function Error Rate
    - Firestore Latency
    
**Automatic Detection:** False  
**Manual Override:** True  
    
  
- **False Positive Mitigation:**
  
  - **Noise Reduction Strategies:**
    
    - **Strategy:** Use P95 for latency metrics  
**Implementation:** Configure Google Cloud Monitoring alerts to use 95th percentile aggregation.  
**Applicable Alerts:**
    
    - Firestore High Latency
    - Cloud Function High Latency
    
**Effectiveness:** High - Ignores extreme outliers and focuses on sustained degradation affecting a significant portion of requests.  
    
  - **Confirmation Counts:**
    
    - **Alert Type:** all_backend_metrics  
**Confirmation Threshold:** 5  
**Confirmation Window:** 5 minutes  
**Reset Condition:** Metric falls below threshold for 2 consecutive minutes.  
    
  - **Dampening And Flapping:**
    
    
  - **Alert Validation:**
    
    
  - **Smart Filtering:**
    
    
  - **Quorum Based Alerting:**
    
    
  
- **On Call Management Integration:**
  
  - **Escalation Paths:**
    
    - **Severity:** Critical  
**Escalation Levels:**
    
    - **Level:** 0  
**Recipients:**
    
    - Primary On-Call Developer (via PagerDuty)
    
**Escalation Time:** 15 minutes  
**Requires Acknowledgment:** True  
    - **Level:** 1  
**Recipients:**
    
    - Secondary On-Call Developer
    - Engineering Lead
    
**Escalation Time:** N/A  
**Requires Acknowledgment:** False  
    
**Ultimate Escalation:** Head of Engineering  
    
  - **Escalation Timeframes:**
    
    
  - **On Call Rotation:**
    
    - **Team:** Backend Development  
**Rotation Type:** weekly  
**Handoff Time:** Monday 10:00 UTC  
**Backup Escalation:** Engineering Lead  
    
  - **Acknowledgment Requirements:**
    
    
  - **Incident Ownership:**
    
    
  - **Follow The Sun Support:**
    
    
  
- **Project Specific Alerts Config:**
  
  - **Alerts:**
    
    - **Name:** Cloud Function High Error Rate  
**Description:** Alerts when a Cloud Function's error rate exceeds 2% for 5 minutes, indicating a potential backend outage. (REQ-MAA-004)  
**Condition:** metric.type="cloudfunctions.googleapis.com/function/execution_count" resource.type="cloud_function" metric.label.status="error" | rate | window(5m) > 0.02  
**Threshold:** 2%  
**Severity:** Critical  
**Channels:**
    
    - pagerduty
    
**Correlation:**
    
    - **Group Id:** backend-health
    - **Suppression Rules:**
      
      
    
**Escalation:**
    
    - **Enabled:** True
    - **Escalation Time:** 15m
    - **Escalation Path:**
      
      - Critical
      
    
**Suppression:**
    
    - **Maintenance Window:** True
    - **Dependency Failure:** False
    - **Manual Override:** True
    
**Validation:**
    
    - **Confirmation Count:** 5
    - **Confirmation Window:** 5m
    
**Remediation:**
    
    - **Automated Actions:**
      
      
    - **Runbook Url:** https://example.com/runbooks/cloud-function-errors
    - **Troubleshooting Steps:**
      
      - Check Google Cloud Logging for the failing function.
      - Inspect recent code changes for bugs.
      - Review Crashlytics for related client-side errors.
      
    
    - **Name:** High Crash Rate  
**Description:** Alerts when the application's crash-free user rate drops below 99.5% for an hour. (REQ-MAA-004)  
**Condition:** firebase.crashlytics.crash_free_users < 0.995 for 1h  
**Threshold:** 99.5%  
**Severity:** Critical  
**Channels:**
    
    - pagerduty
    - slack
    
**Correlation:**
    
    - **Group Id:** client-health
    - **Suppression Rules:**
      
      
    
**Escalation:**
    
    - **Enabled:** True
    - **Escalation Time:** 15m
    - **Escalation Path:**
      
      - Critical
      
    
**Suppression:**
    
    - **Maintenance Window:** False
    - **Dependency Failure:** False
    - **Manual Override:** True
    
**Validation:**
    
    - **Confirmation Count:** 0
    - **Confirmation Window:** 
    
**Remediation:**
    
    - **Automated Actions:**
      
      
    - **Runbook Url:** https://example.com/runbooks/high-crash-rate
    - **Troubleshooting Steps:**
      
      - Analyze crash reports in Firebase Crashlytics dashboard.
      - Identify if the crash is tied to a specific OS, device, or app version.
      - Initiate rollback of the latest release if necessary.
      
    
    - **Name:** GSheets Sync Permanent Failure  
**Description:** Alerts Tenant Admins and the dev team when the Google Sheets sync fails with a non-recoverable error. (REQ-7-004)  
**Condition:** Log-based alert on 'Server.GoogleSheets.PermanentError' error string in Cloud Logging  
**Threshold:** 1 occurrence  
**Severity:** High  
**Channels:**
    
    - fcm
    - slack
    
**Correlation:**
    
    - **Group Id:** integrations
    - **Suppression Rules:**
      
      
    
**Escalation:**
    
    - **Enabled:** False
    - **Escalation Time:** 
    - **Escalation Path:**
      
      
    
**Suppression:**
    
    - **Maintenance Window:** False
    - **Dependency Failure:** False
    - **Manual Override:** True
    
**Validation:**
    
    - **Confirmation Count:** 0
    - **Confirmation Window:** 
    
**Remediation:**
    
    - **Automated Actions:**
      
      - Trigger FCM notification to Tenant Admin.
      - Update LinkedSheet status to 'Failed' in Firestore.
      
    - **Runbook Url:** https://example.com/runbooks/gsheets-sync-failure
    - **Troubleshooting Steps:**
      
      - Advise admin to re-link their Google Sheet.
      - Dev team to check for API changes on Google's side.
      
    
    - **Name:** GCP Budget Alert  
**Description:** Alerts the billing and dev teams when monthly spend is forecasted to exceed the budget. (REQ-MAA-007)  
**Condition:** Forecasted spend > 100% of budget  
**Threshold:** 100%  
**Severity:** High  
**Channels:**
    
    - email
    
**Correlation:**
    
    - **Group Id:** billing
    - **Suppression Rules:**
      
      
    
**Escalation:**
    
    - **Enabled:** False
    - **Escalation Time:** 
    - **Escalation Path:**
      
      
    
**Suppression:**
    
    - **Maintenance Window:** False
    - **Dependency Failure:** False
    - **Manual Override:** False
    
**Validation:**
    
    - **Confirmation Count:** 0
    - **Confirmation Window:** 
    
**Remediation:**
    
    - **Automated Actions:**
      
      
    - **Runbook Url:** https://example.com/runbooks/budget-alert
    - **Troubleshooting Steps:**
      
      - Analyze GCP Billing reports to identify the source of the cost spike.
      - Check for inefficient queries or functions causing high usage.
      - Adjust budget if increased spending is expected.
      
    
    - **Name:** Dead Letter Queue Message  
**Description:** Alerts when a message lands in a Dead Letter Queue, indicating an event failed processing after all retries.  
**Condition:** pubsub.googleapis.com/subscription/num_undelivered_messages > 0 for 5m  
**Threshold:** > 0  
**Severity:** High  
**Channels:**
    
    - slack
    
**Correlation:**
    
    - **Group Id:** backend-health
    - **Suppression Rules:**
      
      
    
**Escalation:**
    
    - **Enabled:** False
    - **Escalation Time:** 
    - **Escalation Path:**
      
      
    
**Suppression:**
    
    - **Maintenance Window:** True
    - **Dependency Failure:** False
    - **Manual Override:** True
    
**Validation:**
    
    - **Confirmation Count:** 0
    - **Confirmation Window:** 
    
**Remediation:**
    
    - **Automated Actions:**
      
      
    - **Runbook Url:** https://example.com/runbooks/dlq-handling
    - **Troubleshooting Steps:**
      
      - Inspect the message payload in the DLQ subscription.
      - Analyze function logs for the root cause of the failure.
      - Fix the underlying bug and redeploy.
      - Manually re-process the message from the DLQ.
      
    
    
  - **Alert Groups:**
    
    
  - **Notification Templates:**
    
    
  
- **Implementation Priority:**
  
  
- **Risk Assessment:**
  
  
- **Recommendations:**
  
  


---


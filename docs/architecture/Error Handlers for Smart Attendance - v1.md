# Specification

# 1. Error Handling

- **Strategies:**
  
  - **Type:** Retry  
**Configuration:**
    
    - **Description:** Handles transient, recoverable errors in server-side Cloud Functions communicating with external APIs, as per REQ-7-005.
    - **Policies:**
      
      - **Name:** GoogleSheetsSync_TransientRetry  
**Target Function:** googleSheetsSyncFunction  
**Triggering Errors:**
    
    - Server.GoogleSheets.TransientError
    
**Retry Strategy:** ExponentialBackoffWithJitter  
**Max Attempts:** 3  
**Initial Delay:** 10s  
**Max Delay:** 60s  
      - **Name:** Geocoding_TransientRetry  
**Target Function:** attendanceAugmentationFunction  
**Triggering Errors:**
    
    - Server.Geocoding.TransientError
    
**Retry Strategy:** FixedInterval  
**Max Attempts:** 2  
**Initial Delay:** 5s  
      
    
  - **Type:** CircuitBreaker  
**Configuration:**
    
    - **Description:** Handles permanent, non-recoverable errors in the Google Sheets integration, preventing repeated failing calls. The 'circuit' is opened by setting the status to 'Failed' and requires manual reset by an Admin, as per REQ-7-004.
    - **Policies:**
      
      - **Name:** GoogleSheetsSync_PermanentFailure  
**Target Function:** googleSheetsSyncFunction  
**Triggering Errors:**
    
    - Server.GoogleSheets.PermanentError
    
**Failure Threshold:** 1  
**Open State Action:** StopSync  
**Open State Duration:** Infinite  
**Reset Mechanism:** Manual (Admin re-links sheet)  
**On Open Actions:**
    
    - Set `LinkedSheet.lastSyncStatus` to 'Failed'
    - Set `LinkedSheet.lastSyncError` with specific error
    - Trigger `AdminNotification` of type `GSheetSyncFailed`
    
      
    
  - **Type:** Fallback  
**Configuration:**
    
    - **Description:** Ensures core application functionality remains available during network outages or non-critical service failures, as per REQ-ATT-004 and REQ-ATT-008.
    - **Policies:**
      
      - **Name:** OfflineAttendance_Queueing  
**Target Layer:** Mobile Data Layer  
**Triggering Errors:**
    
    - Client.NetworkError
    
**Fallback Action:** Save `Attendance` record to local Hive database with `syncStatus: 'Queued'`. The application logic will handle subsequent sync attempts upon network restoration.  
      - **Name:** MapsAPI_GracefulDegradation  
**Target Layer:** Mobile Presentation Layer  
**Triggering Errors:**
    
    - Client.MapsAPIUnavailable
    
**Fallback Action:** Render a placeholder instead of the map preview and display a non-blocking message. The 'Check-In' function remains fully operational.  
      
    
  - **Type:** DeadLetter  
**Configuration:**
    
    - **Description:** Isolates records that fail processing after all retries or due to validation errors, making them available for manual review without blocking the main workflow, as per REQ-8-004 and REQ-ATT-004.
    - **Policies:**
      
      - **Name:** BulkImport_ValidationFailure  
**Target Function:** bulkUserImportFunction  
**Triggering Errors:**
    
    - Server.BulkImport.ValidationError
    
**Disposition:** Log failed row and reason to a validation report for Admin review.  
      - **Name:** OfflineSync_PermanentFailure  
**Target Layer:** Mobile Application Logic Layer  
**Triggering Errors:**
    
    - Client.OfflineSync.PermanentFailure
    
**Disposition:** Update local `Attendance` record `syncStatus` to 'Failed' to make the error visible to the user and prevent further automatic sync attempts for that record.  
      
    
  
- **Monitoring:**
  
  - **Error Categories:**
    
    - Client.NetworkError
    - Client.MapsAPIUnavailable
    - Client.OfflineSync.PermanentFailure
    - Server.GoogleSheets.TransientError
    - Server.GoogleSheets.PermanentError
    - Server.Geocoding.TransientError
    - Server.BulkImport.ValidationError
    - System.Crash.UnhandledException
    - System.Performance.LatencyViolation
    - System.Budget.ThresholdExceeded
    
  - **Logging:** All unhandled client-side exceptions are reported to Firebase Crashlytics with user, device, and version context (REQ-MAA-005). All server-side function errors are logged to Google Cloud Logging with `tenantId` and invocation context (REQ-MAA-003). Specific API errors from Google Sheets are logged to the `LinkedSheet` document (REQ-7-004).
  - **Alerting:**
    
    - **Rules:**
      
      - **Name:** Critical Backend Alert  
**Condition:** Cloud Function error rate exceeds defined threshold OR P95 latency exceeds SLO.  
**Notification Channel:** Development Team (Email/PagerDuty)  
**Reference:** REQ-MAA-004  
      - **Name:** Critical Crash Rate Alert  
**Condition:** Firebase Crashlytics crash-free user rate falls below defined threshold.  
**Notification Channel:** Development Team (Email/PagerDuty)  
**Reference:** REQ-MAA-004  
      - **Name:** GSheets Sync Failure Alert  
**Condition:** `Server.GoogleSheets.PermanentError` is detected.  
**Notification Channel:** Tenant Admin (FCM Push Notification)  
**Reference:** REQ-7-004, REQ-9-004  
      - **Name:** Budget Alert  
**Condition:** GCP project spending (actual or forecasted) exceeds predefined monetary threshold.  
**Notification Channel:** Development Team (GCP Billing Alert)  
**Reference:** REQ-MAA-007  
      
    
  


---


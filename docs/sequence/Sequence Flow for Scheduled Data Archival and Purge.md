# Specification

# 1. Sequence Design Overview

- **Sequence_Diagram:**
  ### . Scheduled Data Archival and Purge
  Illustrates the data lifecycle management process where a scheduled function queries for old attendance records based on the tenant's configured retention policy, exports them to Firebase Storage as NDJSON, and then purges them from the active Firestore database.

  #### .4. Purpose
  To document the automated enforcement of data retention policies for cost and compliance management.

  #### .5. Type
  DataFlow

  #### .6. Participant Repository Ids
  
  - google-cloud-scheduler
  - data-archival-fn
  - firestore-db
  - firebase-storage
  
  #### .7. Key Interactions
  
  - Cloud Scheduler triggers the dataArchivalFunction.
  - Function iterates through all tenants.
  - For each tenant, it reads the dataRetentionDays from their TenantConfig.
  - Function queries Attendance collection for records older than the retention period.
  - Function writes the queried records to a .ndjson file in a tenant-specific folder in Firebase Storage.
  - After successful write to Storage, the function uses a batched write to delete the archived records from Firestore.
  
  #### .8. Related Feature Ids
  
  - 6.3.2
  
  #### .9. Domain
  Data Management

  #### .10. Metadata
  
  - **Complexity:** Medium
  - **Priority:** Medium
  - **Frequency:** Periodic
  


---

# 2. Sequence Diagram Details

- **Success:** True
- **Cache_Created:** True
- **Status:** refreshed
- **Cache_Id:** b9c74vvivsfhl1xmdjcsucore82qwy3u7caywavl
- **Cache_Name:** cachedContents/b9c74vvivsfhl1xmdjcsucore82qwy3u7caywavl
- **Cache_Display_Name:** repositories
- **Cache_Status_Verified:** True
- **Model:** models/gemini-2.5-pro-preview-03-25
- **Workflow_Id:** I9v2neJ0O4zJsz8J
- **Execution_Id:** AIzaSyCGei_oYXMpZW-N3d-yH-RgHKXz8dsixhc
- **Project_Id:** 20
- **Record_Id:** 25
- **Cache_Type:** repositories


---


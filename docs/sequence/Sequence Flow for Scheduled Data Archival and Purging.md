# Specification

# 1. Sequence Design Overview

- **Sequence_Diagram:**
  ### . Scheduled Data Archival and Purging
  Shows the automated, nightly process that enforces the data retention policy by archiving old attendance records from the hot storage (Firestore) to cold storage (Cloud Storage) and then purging them.

  #### .4. Purpose
  To document the system's data lifecycle management, which is critical for performance and cost control.

  #### .5. Type
  DataFlow

  #### .6. Participant Repository Ids
  
  - REPO-012-SCHEDULER
  - REPO-009-SVC-ARCHIVE
  - REPO-003-DB
  - REPO-013-STORAGE
  
  #### .7. Key Interactions
  
  - Cloud Scheduler triggers the Archival Cloud Function.
  - Function queries all tenants to find records older than their configured dataRetentionDays.
  - Function reads the matching records and streams them into an NDJSON file in a tenant-specific folder in Cloud Storage.
  - After verifying the file write, the function uses a batched write to delete the archived records from Firestore.
  - The function logs the outcome of the archival job.
  
  #### .8. Related Feature Ids
  
  - 6.3.2
  
  #### .9. Domain
  Data Management

  #### .10. Metadata
  
  - **Complexity:** Medium
  - **Priority:** Medium
  


---

# 2. Sequence Diagram Details

- **Success:** True
- **Cache_Created:** True
- **Status:** refreshed
- **Cache_Id:** fqpzfrfvsdbwref8zybd60801165aj89j0xjtedn
- **Cache_Name:** cachedContents/fqpzfrfvsdbwref8zybd60801165aj89j0xjtedn
- **Cache_Display_Name:** repositories
- **Cache_Status_Verified:** True
- **Model:** models/gemini-2.5-pro-preview-03-25
- **Workflow_Id:** I9v2neJ0O4zJsz8J
- **Execution_Id:** AIzaSyCGei_oYXMpZW-N3d-yH-RgHKXz8dsixhc
- **Project_Id:** 20
- **Record_Id:** 25
- **Cache_Type:** repositories


---


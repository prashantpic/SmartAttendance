# Specification

# 1. Sequence Design Overview

- **Sequence_Diagram:**
  ### . Scheduled Google Sheets Data Export
  Models the automated, periodic batch process that exports approved attendance data from Firestore to a tenant's linked Google Sheet.

  #### .4. Purpose
  To detail the primary reporting and data export integration, a key feature for administrators.

  #### .5. Type
  IntegrationPattern

  #### .6. Participant Repository Ids
  
  - REPO-012-SCHEDULER
  - REPO-008-SVC-EXPORT
  - REPO-003-DB
  - REPO-014-EXT-GSHEETS
  
  #### .7. Key Interactions
  
  - Cloud Scheduler triggers the Export Cloud Function on a schedule.
  - Function queries the linkedSheets collection to find all tenants with active integrations.
  - For each tenant, the function queries attendance for new, approved records.
  - Function authenticates to the Google Sheets API using the tenant's stored credentials.
  - Function appends the new records to the designated Google Sheet.
  - Function updates the lastSyncTimestamp in the tenant's linkedSheets document.
  
  #### .8. Related Feature Ids
  
  - 3.7
  
  #### .9. Domain
  Reporting

  #### .10. Metadata
  
  - **Complexity:** High
  - **Priority:** High
  


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


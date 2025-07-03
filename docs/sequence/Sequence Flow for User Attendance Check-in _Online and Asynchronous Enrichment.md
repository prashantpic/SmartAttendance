# Specification

# 1. Sequence Design Overview

- **Sequence_Diagram:**
  ### . User Attendance Check-in (Online and Asynchronous Enrichment)
  Shows the complete flow when a subordinate marks their attendance while online. This includes capturing client-side data, writing it to Firestore, and the subsequent asynchronous, event-driven backend processes for data enrichment and supervisor notification.

  #### .4. Purpose
  To document the primary user activity and the core event-driven architecture pattern of the system.

  #### .5. Type
  UserJourney

  #### .6. Participant Repository Ids
  
  - REPO-001-CLIENT
  - REPO-016-SECURITY-APPCHECK
  - REPO-003-DB
  - REPO-004-SVC-PROCESS
  - REPO-015-EXT-GMAPS
  - REPO-005-SVC-NOTIFY
  
  #### .7. Key Interactions
  
  - User initiates check-in on the mobile app.
  - App captures GPS location and timestamp.
  - App sends the attendance record to Firestore, verified by App Check.
  - Firestore 'onCreate' trigger invokes the Attendance Processing and Notification functions in parallel.
  - Processing function calls Google Maps API for reverse geocoding and computes the approverHierarchy.
  - Processing function updates the attendance record in Firestore with enriched data.
  - Notification function retrieves the supervisor's FCM token and sends a push notification.
  
  #### .8. Related Feature Ids
  
  - 3.4
  - 3.5
  - 6.2.1
  
  #### .9. Domain
  Attendance

  #### .10. Metadata
  
  - **Complexity:** High
  - **Priority:** Critical
  


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


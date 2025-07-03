# Specification

# 1. Sequence Design Overview

- **Sequence_Diagram:**
  ### . Supervisor Attendance Approval Workflow
  Models the process of a supervisor reviewing and acting upon a subordinate's pending attendance request. The supervisor's action updates the record in Firestore, which in turn triggers a notification back to the subordinate.

  #### .4. Purpose
  To illustrate the core approval workflow, a central business process of the application.

  #### .5. Type
  BusinessProcess

  #### .6. Participant Repository Ids
  
  - flutter-mobile-app
  - firestore-db
  - notification-dispatcher-fn
  - fcm-service
  
  #### .7. Key Interactions
  
  - Supervisor queries Firestore for Attendance records where approverHierarchy contains their ID and status is 'Pending'.
  - UI displays the list of pending requests.
  - Supervisor taps 'Approve', providing optional comments.
  - App updates the corresponding Attendance document in Firestore, changing status to 'Approved' and adding approvalDetails.
  - Firestore onUpdate trigger invokes notificationDispatcherFunction.
  - Function reads the subordinate's fcmToken and sends a push notification about the approval.
  - Subordinate's app receives the notification.
  
  #### .8. Related Feature Ids
  
  - 3.5.2
  - 3.5.3
  - 3.5.4
  - 6.1.2
  
  #### .9. Domain
  Attendance & Approvals

  #### .10. Metadata
  
  - **Complexity:** Medium
  - **Priority:** Critical
  - **Frequency:** Frequent
  


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


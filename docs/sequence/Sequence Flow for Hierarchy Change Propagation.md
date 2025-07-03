# Specification

# 1. Sequence Design Overview

- **Sequence_Diagram:**
  ### . Hierarchy Change Propagation
  Shows the reactive data flow when an Admin changes a user's supervisor. The update to the user's supervisorId field in Firestore triggers a Cloud Function that recursively calculates and updates the approverHierarchy array for that user and all their direct and indirect subordinates.

  #### .4. Purpose
  To model the automated maintenance of the denormalized approverHierarchy field, which is critical for efficient supervisor queries.

  #### .5. Type
  DataFlow

  #### .6. Participant Repository Ids
  
  - flutter-mobile-app
  - firestore-db
  - hierarchy-update-fn
  
  #### .7. Key Interactions
  
  - Admin changes User A's supervisor from Supervisor X to Supervisor Y.
  - App writes the change to User A's document in Firestore.
  - An onUpdate trigger on the users collection invokes the hierarchyUpdateFunction.
  - Function detects the supervisorId change for User A.
  - Function reads the new supervisor's hierarchy and updates User A's approverHierarchy.
  - Function then queries for all users whose supervisorId is User A, and recursively updates their approverHierarchy in a batch write.
  
  #### .8. Related Feature Ids
  
  - 3.3.4
  - 5.1.1
  - 2.4.1
  
  #### .9. Domain
  User Management

  #### .10. Metadata
  
  - **Complexity:** High
  - **Priority:** High
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


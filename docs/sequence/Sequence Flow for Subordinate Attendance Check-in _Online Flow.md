# Specification

# 1. Sequence Design Overview

- **Sequence_Diagram:**
  ### . Subordinate Attendance Check-in (Online Flow)
  Details the complete sequence when a user with the 'Subordinate' role marks their attendance while connected to the internet. This includes capturing GPS data, storing the record in Firestore, triggering server-side data enrichment, and notifying the supervisor.

  #### .4. Purpose
  To model the core user journey of daily attendance marking and the subsequent event-driven backend processing.

  #### .5. Type
  UserJourney

  #### .6. Participant Repository Ids
  
  - flutter-mobile-app
  - device-gps-service
  - firebase-app-check
  - firestore-db
  - attendance-processor-fn
  - google-maps-geocoding-api
  - notification-dispatcher-fn
  - fcm-service
  
  #### .7. Key Interactions
  
  - User taps 'Check-in' in the Flutter app.
  - App requests and receives location from the device's GPS service.
  - App writes a new Attendance document to Firestore, passing an App Check token.
  - Firestore onCreate trigger invokes attendanceProcessorFunction.
  - Function calls Google Maps API to reverse-geocode the location to an address.
  - Function reads the user's hierarchy and populates the approverHierarchy array.
  - Function updates the Attendance document with the new data.
  - A parallel Firestore onCreate trigger invokes notificationDispatcherFunction which sends an FCM push notification to the supervisor.
  
  #### .8. Related Feature Ids
  
  - 3.4.1
  - 3.4.2
  - 3.4.4
  - 3.5.4
  - 5.1.1
  - 6.1.1
  
  #### .9. Domain
  Attendance & Approvals

  #### .10. Metadata
  
  - **Complexity:** High
  - **Priority:** Critical
  - **Frequency:** Real-time
  


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


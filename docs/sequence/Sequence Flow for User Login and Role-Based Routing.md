# Specification

# 1. Sequence Design Overview

- **Sequence_Diagram:**
  ### . User Login and Role-Based Routing
  Shows the authentication flow, including the use of Firebase Auth custom claims to securely obtain the user's role and tenant ID for immediate, role-based routing within the app.

  #### .4. Purpose
  To detail the secure and efficient login and authorization process.

  #### .5. Type
  AuthenticationFlow

  #### .6. Participant Repository Ids
  
  - REPO-001-CLIENT
  - REPO-002-AUTH
  
  #### .7. Key Interactions
  
  - User provides credentials and initiates login.
  - App sends credentials to the Firebase Authentication service.
  - Firebase Auth validates credentials and, upon success, returns a user object and an ID token.
  - The ID token contains pre-populated custom claims (tenantId, role, status).
  - App decodes the ID token on the client to get the user's role and tenantId without needing a separate Firestore read.
  - App logic uses the role to navigate the user to the correct dashboard (Subordinate, Supervisor, or Admin).
  
  #### .8. Related Feature Ids
  
  - 3.2
  
  #### .9. Domain
  Authentication

  #### .10. Metadata
  
  - **Complexity:** Medium
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


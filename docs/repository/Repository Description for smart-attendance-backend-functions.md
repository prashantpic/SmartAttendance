# Repository Specification

# 1. Name
smart-attendance-backend-functions


---

# 2. Description
This repository serves as the central 'ApplicationCore' for all server-side logic, encapsulating the entire collection of Firebase Cloud Functions written in TypeScript. It functions as a service orchestrator within the system's event-driven architecture. Instead of a single monolithic backend, this repository contains multiple, independent, and trigger-based functions that handle specific business processes. Key responsibilities include: provisioning new tenants via an HTTP endpoint, augmenting newly created attendance records with server-side data (geocoding, approval hierarchy), dispatching FCM push notifications based on database changes, executing scheduled batch jobs for data export to Google Sheets, processing bulk user data from CSV files uploaded to Cloud Storage, and enforcing data retention policies by archiving old records. This approach ensures that backend logic is modular, scalable, and loosely coupled.


---

# 3. Type
ApplicationCore


---

# 4. Namespace
functions.smartattendance


---

# 5. Output Path
./functions/lib


---

# 6. Framework
Node.js


---

# 7. Language
TypeScript


---

# 8. Technology
Firebase Cloud Functions, Firestore Triggers, Cloud Scheduler, Google Sheets API, FCM


---

# 9. Thirdparty Libraries

- firebase-functions
- firebase-admin
- googleapis


---

# 10. Dependencies



---

# 11. Layer Ids

- backend-functions


---

# 12. Requirements

- **Requirement Id:** 3.1  
- **Requirement Id:** 3.4.4  
- **Requirement Id:** 3.7  
- **Requirement Id:** 4.2  
- **Requirement Id:** 5.1  
- **Requirement Id:** 6.3.2  


---

# 13. Generate Tests
True


---

# 14. Generate Documentation
True


---

# 15. Architecture Style
EventDriven


---

# 16. Id
REPO-02-BKN


---

# 17. Architecture_Map

- backend-functions


---

# 18. Components_Map

- tenantProvisioningFunction
- attendanceAugmentationFunction
- notificationTriggerFunctions
- googleSheetsSyncFunction
- dataArchivalFunction


---

# 19. Requirements_Map

- 3.1
- 3.4.4
- 3.7
- 4.2
- 5.1
- 6.3.2


---


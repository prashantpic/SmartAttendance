# Repository Specification

# 1. Name
DataArchivalEndpoint


---

# 2. Description
A scheduled, idempotent Cloud Function responsible for enforcing data retention policies. It runs daily, querying for attendance records older than the tenant-specific retention period defined in the 'config' collection. It archives these records to a tenant-specific folder in Firebase Storage in NDJSON format and then purges them from the primary Firestore database to manage costs and performance.


---

# 3. Type
ServerlessFunction


---

# 4. Namespace
jobs.scheduled.dataArchival


---

# 5. Output Path
backend/functions/src/admin/archival


---

# 6. Framework
Node.js


---

# 7. Language
TypeScript


---

# 8. Technology
Firebase Cloud Functions (onSchedule), Firestore, Firebase Storage


---

# 9. Thirdparty Libraries



---

# 10. Dependencies

- backend-infrastructure


---

# 11. Layer Ids

- backend-functions


---

# 12. Requirements

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
REPO-008-SVC


---

# 17. Architecture_Map

- backend-functions


---

# 18. Components_Map

- dataArchivalFunction


---

# 19. Requirements_Map

- 6.3.2


---


# Repository Specification

# 1. Name
NotificationDispatchEndpoint


---

# 2. Description
An event-driven Cloud Function triggered by changes to attendance documents in Firestore. It is responsible for the entire push notification workflow. It sends a notification to the relevant supervisor when a new record requires approval, and it notifies the subordinate when their record is approved or rejected. It looks up the target user's FCM token from the 'users' collection and dispatches a tailored message via Firebase Cloud Messaging.


---

# 3. Type
ServerlessFunction


---

# 4. Namespace
events.firestore.attendance.onWrite


---

# 5. Output Path
backend/functions/src/notifications


---

# 6. Framework
Node.js


---

# 7. Language
TypeScript


---

# 8. Technology
Firebase Cloud Functions (onWrite), Firestore, Firebase Cloud Messaging (FCM)


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

- **Requirement Id:** 3.5.4  


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
REPO-005-SVC


---

# 17. Architecture_Map

- backend-functions


---

# 18. Components_Map

- notificationTriggerFunctions


---

# 19. Requirements_Map

- 3.5.4
- 2.1


---


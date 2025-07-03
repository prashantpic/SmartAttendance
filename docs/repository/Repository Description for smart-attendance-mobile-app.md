# Repository Specification

# 1. Name
smart-attendance-mobile-app


---

# 2. Description
This is the master repository for the cross-platform Flutter mobile application, which serves as the primary user interface and entry point for all roles: Administrator, Supervisor, and Subordinate. As a 'MobileFrontend', it coordinates and integrates all client-side functionality into a cohesive user experience. It is responsible for rendering all UI screens, including role-specific dashboards, user management interfaces, attendance history views, and the event calendar. This repository orchestrates the application's business logic using the BLoC pattern, managing state for user sessions, form validations, and data fetching. It also contains the data access layer, implementing the Repository Pattern to communicate with Firebase backend services and manage the offline attendance queue using the local Hive database. It depends on the 'smart-attendance-shared-kernel' repository for common data models, utility functions, and reusable UI components, ensuring consistency across the app. In essence, this repository is the complete, self-contained mobile client.


---

# 3. Type
MobileFrontend


---

# 4. Namespace
com.smartattendance.app


---

# 5. Output Path
./build/app


---

# 6. Framework
Flutter


---

# 7. Language
Dart


---

# 8. Technology
BLoC, Hive, Riverpod, cloud_firestore, firebase_auth


---

# 9. Thirdparty Libraries

- flutter_bloc
- hive
- google_maps_flutter
- firebase_core


---

# 10. Dependencies

- REPO-03-SHD


---

# 11. Layer Ids

- mobile-presentation
- mobile-application
- mobile-data


---

# 12. Requirements

- **Requirement Id:** 1.3  
- **Requirement Id:** 3.2  
- **Requirement Id:** 3.4  
- **Requirement Id:** 3.5  
- **Requirement Id:** 3.6  
- **Requirement Id:** 6.6  


---

# 13. Generate Tests
True


---

# 14. Generate Documentation
True


---

# 15. Architecture Style
CleanArchitecture


---

# 16. Id
REPO-01-MOB


---

# 17. Architecture_Map

- mobile-presentation
- mobile-application
- mobile-data


---

# 18. Components_Map

- AuthScreens
- SubordinateDashboard
- SupervisorDashboard
- AdminDashboard
- SessionManager


---

# 19. Requirements_Map

- 1.3
- 3.2
- 3.4
- 3.5
- 3.6
- 6.6


---


# Specification

# 1. Files

- **Path:** pubspec.yaml  
**Description:** Defines the project's metadata, dependencies, and assets. Includes essential packages like flutter_bloc, get_it, dartz, go_router, cloud_firestore, firebase_auth, hive, google_maps_flutter, and intl.  
**Template:** Flutter Project Template  
**Dependency Level:** 0  
**Name:** pubspec  
**Type:** Configuration  
**Relative Path:** pubspec.yaml  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Project Dependency Management
    - Asset Declaration
    
**Requirement Ids:**
    
    
**Purpose:** To manage all external Dart and Flutter packages required for the application and to declare project assets like fonts and images.  
**Logic Description:** This file contains the main configuration for the Flutter project. Under 'dependencies', list all required packages. Under 'dev_dependencies', list packages for testing and code generation like 'build_runner' and 'mockito'. The 'flutter' section should declare all asset paths for images and fonts, and enable Material Design.  
**Documentation:**
    
    - **Summary:** The core manifest file for the Flutter project, specifying its name, description, version, and dependencies on third-party libraries and local assets.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** lib/main.dart  
**Description:** The main entry point for the Flutter application. Initializes Firebase, sets up dependency injection, configures logging, and runs the root application widget.  
**Template:** Flutter Application Template  
**Dependency Level:** 6  
**Name:** main  
**Type:** ApplicationEntry  
**Relative Path:** main.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** main  
**Parameters:**
    
    
**Return Type:** Future<void>  
**Attributes:** main  
    
**Implemented Features:**
    
    - Application Initialization
    
**Requirement Ids:**
    
    
**Purpose:** To bootstrap the application, performing all necessary initializations before the UI is rendered.  
**Logic Description:** The main function will be async. It must first call WidgetsFlutterBinding.ensureInitialized(). Then, it will initialize Firebase using Firebase.initializeApp(). It will set up the dependency injection container by calling a configuration function (e.g., configureDependencies). Finally, it will run the main application widget using runApp(const SmartAttendanceApp()).  
**Documentation:**
    
    - **Summary:** This file serves as the executable start of the application. It orchestrates the setup of core services and launches the main app view.
    
**Namespace:** com.smartattendance.app  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** lib/app.dart  
**Description:** The root widget of the application. It sets up the material app, defines the theme, and configures the router and global BLoC providers.  
**Template:** Flutter Application Template  
**Dependency Level:** 5  
**Name:** SmartAttendanceApp  
**Type:** Widget  
**Relative Path:** app.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** build  
**Parameters:**
    
    - BuildContext context
    
**Return Type:** Widget  
**Attributes:** override  
    
**Implemented Features:**
    
    - Global App Configuration
    
**Requirement Ids:**
    
    
**Purpose:** To provide the top-level application shell, including theme, localization, and navigation setup, and to host global state providers.  
**Logic Description:** This stateless widget returns a MaterialApp.router. It is wrapped in a MultiBlocProvider to provide the global AuthBloc. The theme property is configured using the AppTheme class. The routerConfig is supplied by the AppRouter instance, which is retrieved from the dependency injection container.  
**Documentation:**
    
    - **Summary:** The SmartAttendanceApp widget is the root of the UI tree, responsible for integrating navigation, theming, and global state management for the entire application.
    
**Namespace:** com.smartattendance.app  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** lib/core/di/injector.dart  
**Description:** Dependency injection setup using the get_it package. Registers all repositories, BLoCs, use cases, and data sources as singletons or factories.  
**Template:** Flutter Service Locator Template  
**Dependency Level:** 4  
**Name:** injector  
**Type:** DependencyInjection  
**Relative Path:** core/di/injector.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    - ServiceLocator
    
**Members:**
    
    - **Name:** sl  
**Type:** GetIt  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** configureDependencies  
**Parameters:**
    
    
**Return Type:** Future<void>  
**Attributes:** global function  
    
**Implemented Features:**
    
    - Dependency Injection
    
**Requirement Ids:**
    
    
**Purpose:** To decouple the application's components by providing a centralized way to manage and access object instances.  
**Logic Description:** The file defines a global GetIt instance 'sl'. The 'configureDependencies' function will register all services. For each feature (auth, user_management, etc.), it will register the BLoC, UseCases, Repository implementation, and Data Source implementation. Repositories and Data Sources are typically registered as lazy singletons, while BLoCs are registered as factories.  
**Documentation:**
    
    - **Summary:** This file initializes the service locator for the entire application, mapping interfaces to their concrete implementations and managing their lifetimes.
    
**Namespace:** com.smartattendance.app.core.di  
**Metadata:**
    
    - **Category:** Application
    
- **Path:** lib/core/navigation/app_router.dart  
**Description:** Configures the application's routing using the go_router package. Defines all routes, including nested routes, and handles redirection based on authentication state.  
**Template:** Flutter Router Template  
**Dependency Level:** 3  
**Name:** AppRouter  
**Type:** Router  
**Relative Path:** core/navigation/app_router.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** router  
**Type:** GoRouter  
**Attributes:** final  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Application Navigation
    
**Requirement Ids:**
    
    
**Purpose:** To manage all navigation and deep linking within the application in a centralized and type-safe manner.  
**Logic Description:** This class creates a GoRouter instance. It defines a list of GoRoute objects for each screen (e.g., '/login', '/dashboard', '/admin/users', '/admin/users/:id'). A 'redirect' logic is implemented to check the authentication state from AuthBloc. If the user is not authenticated and is not on the login page, they are redirected to '/login'. If they are authenticated and on the login page, they are redirected to their role-specific dashboard.  
**Documentation:**
    
    - **Summary:** Centralizes all navigation logic, mapping URL-like paths to specific application screens and handling authentication-based routing rules.
    
**Namespace:** com.smartattendance.app.core.navigation  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** lib/features/user_management/data/datasources/user_management_remote_data_source.dart  
**Description:** Interface for user management data operations against Firestore.  
**Template:** Flutter Abstract Class Template  
**Dependency Level:** 2  
**Name:** UserManagementRemoteDataSource  
**Type:** DataSourceInterface  
**Relative Path:** features/user_management/data/datasources/user_management_remote_data_source.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** getUsers  
**Parameters:**
    
    - int limit
    - DocumentSnapshot? startAfter
    - String? statusFilter
    
**Return Type:** Future<List<UserModel>>  
**Attributes:** abstract  
    - **Name:** updateUserStatus  
**Parameters:**
    
    - String userId
    - String newStatus
    
**Return Type:** Future<void>  
**Attributes:** abstract  
    - **Name:** updateUserProfile  
**Parameters:**
    
    - String userId
    - String name
    - String role
    - String supervisorId
    
**Return Type:** Future<void>  
**Attributes:** abstract  
    
**Implemented Features:**
    
    
**Requirement Ids:**
    
    - 3.2
    - 3.4
    - 3.5
    
**Purpose:** To define the contract for fetching and modifying user data from the remote Firebase Firestore database.  
**Logic Description:** This abstract class will define the method signatures for all user management related data operations. These methods will be implemented in a concrete class that uses the cloud_firestore package to communicate with the backend.  
**Documentation:**
    
    - **Summary:** Provides a strict contract for the user management data source, ensuring that any implementation provides the required methods for user data manipulation.
    
**Namespace:** com.smartattendance.app.features.user_management.data.datasources  
**Metadata:**
    
    - **Category:** Data
    
- **Path:** lib/features/user_management/data/datasources/user_management_remote_data_source_impl.dart  
**Description:** Implementation of UserManagementRemoteDataSource using the cloud_firestore package.  
**Template:** Flutter Class Template  
**Dependency Level:** 3  
**Name:** UserManagementRemoteDataSourceImpl  
**Type:** DataSource  
**Relative Path:** features/user_management/data/datasources/user_management_remote_data_source_impl.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** _firestore  
**Type:** FirebaseFirestore  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** getUsers  
**Parameters:**
    
    - int limit
    - DocumentSnapshot? startAfter
    - String? statusFilter
    
**Return Type:** Future<List<UserModel>>  
**Attributes:** override  
    - **Name:** updateUserStatus  
**Parameters:**
    
    - String userId
    - String newStatus
    
**Return Type:** Future<void>  
**Attributes:** override  
    - **Name:** updateUserProfile  
**Parameters:**
    
    - String userId
    - String name
    - String role
    - String supervisorId
    
**Return Type:** Future<void>  
**Attributes:** override  
    
**Implemented Features:**
    
    - User Data Fetching
    - User Data Modification
    
**Requirement Ids:**
    
    - 3.2
    - 3.4
    - 3.5
    
**Purpose:** To handle direct communication with Firestore for all user management CRUD operations, including pagination and filtering.  
**Logic Description:** This class implements the UserManagementRemoteDataSource interface. The constructor will take a FirebaseFirestore instance. The 'getUsers' method will build a Firestore query, applying '.where()' for the status filter, '.limit()' for pagination, and '.startAfterDocument()' for fetching the next page. The update methods will use the '.doc(userId).update({...})' method on the users collection, making sure to reference the correct tenant path. All methods must wrap Firestore calls in try-catch blocks and throw custom exceptions on failure.  
**Documentation:**
    
    - **Summary:** This data source implementation is responsible for executing queries against the Firestore `/tenants/{tenantId}/users` collection to fetch and modify user data.
    
**Namespace:** com.smartattendance.app.features.user_management.data.datasources  
**Metadata:**
    
    - **Category:** Data
    
- **Path:** lib/features/user_management/data/models/user_model.dart  
**Description:** Data Transfer Object (DTO) for a User, including fromJson and toJson methods for Firestore serialization.  
**Template:** Flutter Model Template  
**Dependency Level:** 2  
**Name:** UserModel  
**Type:** Model  
**Relative Path:** features/user_management/data/models/user_model.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** id  
**Type:** String  
**Attributes:** final  
    - **Name:** name  
**Type:** String  
**Attributes:** final  
    - **Name:** email  
**Type:** String  
**Attributes:** final  
    - **Name:** role  
**Type:** String  
**Attributes:** final  
    - **Name:** status  
**Type:** String  
**Attributes:** final  
    - **Name:** supervisorId  
**Type:** String?  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** fromFirestore  
**Parameters:**
    
    - DocumentSnapshot doc
    
**Return Type:** UserModel  
**Attributes:** factory  
    - **Name:** toEntity  
**Parameters:**
    
    
**Return Type:** User  
**Attributes:**   
    
**Implemented Features:**
    
    - Data Serialization
    
**Requirement Ids:**
    
    
**Purpose:** To provide a structured representation of user data as it exists in Firestore and facilitate its conversion to and from domain entities.  
**Logic Description:** This class extends the domain 'User' entity. It includes a factory constructor 'fromFirestore' that takes a Firestore DocumentSnapshot and populates the model's fields. It should handle data type conversions, especially for Timestamps. A 'toEntity' method will convert this data model into a pure 'User' domain entity. This model represents the raw data structure from the database.  
**Documentation:**
    
    - **Summary:** Defines the data structure for users that mirrors the Firestore document schema, handling serialization logic.
    
**Namespace:** com.smartattendance.app.features.user_management.data.models  
**Metadata:**
    
    - **Category:** Data
    
- **Path:** lib/features/user_management/data/repositories/user_management_repository_impl.dart  
**Description:** Implementation of the UserManagementRepository interface. It coordinates data from the remote data source and handles error mapping.  
**Template:** Flutter Repository Template  
**Dependency Level:** 4  
**Name:** UserManagementRepositoryImpl  
**Type:** Repository  
**Relative Path:** features/user_management/data/repositories/user_management_repository_impl.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** _remoteDataSource  
**Type:** UserManagementRemoteDataSource  
**Attributes:** final  
    - **Name:** _networkInfo  
**Type:** NetworkInfo  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** getUsers  
**Parameters:**
    
    - int limit
    - DocumentSnapshot? startAfter
    - String? statusFilter
    
**Return Type:** Future<Either<Failure, List<User>>>  
**Attributes:** override  
    - **Name:** updateUserStatus  
**Parameters:**
    
    - String userId
    - String newStatus
    
**Return Type:** Future<Either<Failure, void>>  
**Attributes:** override  
    - **Name:** updateUserProfile  
**Parameters:**
    
    - String userId
    - String name
    - String role
    - String supervisorId
    
**Return Type:** Future<Either<Failure, void>>  
**Attributes:** override  
    
**Implemented Features:**
    
    - User Data Management Logic
    
**Requirement Ids:**
    
    - 3.2
    - 3.4
    - 3.5
    
**Purpose:** To abstract the origin of user data from the domain layer and provide a simple, reliable API for user management operations.  
**Logic Description:** This class implements the domain repository. Each method first checks for network connectivity using the 'NetworkInfo' helper. If offline, it returns a NetworkFailure. If online, it calls the corresponding method on the remote data source, wrapping the call in a try-catch block. On success, it converts the returned UserModel list to a User entity list and wraps it in a 'Right'. On failure (e.g., FirestoreException), it catches the exception and returns a specific 'ServerFailure' wrapped in a 'Left'.  
**Documentation:**
    
    - **Summary:** The concrete repository for user management, which handles fetching data from remote sources, managing network state, and transforming data models into domain entities.
    
**Namespace:** com.smartattendance.app.features.user_management.data.repositories  
**Metadata:**
    
    - **Category:** Data
    
- **Path:** lib/features/user_management/domain/entities/user.dart  
**Description:** The pure domain entity representing a User. It is part of the core business logic and is independent of any framework or data source.  
**Template:** Flutter Entity Template  
**Dependency Level:** 1  
**Name:** User  
**Type:** Entity  
**Relative Path:** features/user_management/domain/entities/user.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** id  
**Type:** String  
**Attributes:** final  
    - **Name:** name  
**Type:** String  
**Attributes:** final  
    - **Name:** email  
**Type:** String  
**Attributes:** final  
    - **Name:** role  
**Type:** UserRole  
**Attributes:** final  
    - **Name:** status  
**Type:** UserStatus  
**Attributes:** final  
    
**Methods:**
    
    
**Implemented Features:**
    
    
**Requirement Ids:**
    
    
**Purpose:** To define the business object for a User, containing only the properties and logic relevant to the domain.  
**Logic Description:** This is a simple data class, likely using Equatable for value equality. It defines the core attributes of a user. It contains no serialization logic (like fromJson/toJson). It will use enums for 'role' and 'status' (e.g., UserRole.admin, UserStatus.active) for type safety.  
**Documentation:**
    
    - **Summary:** Represents the core User entity within the application's domain layer.
    
**Namespace:** com.smartattendance.app.features.user_management.domain.entities  
**Metadata:**
    
    - **Category:** Domain
    
- **Path:** lib/features/user_management/domain/repositories/user_management_repository.dart  
**Description:** The abstract contract for the user management repository, defining the methods that the domain layer can use to interact with user data.  
**Template:** Flutter Abstract Class Template  
**Dependency Level:** 2  
**Name:** UserManagementRepository  
**Type:** RepositoryInterface  
**Relative Path:** features/user_management/domain/repositories/user_management_repository.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    
**Methods:**
    
    - **Name:** getUsers  
**Parameters:**
    
    - int limit
    - DocumentSnapshot? startAfter
    - String? statusFilter
    
**Return Type:** Future<Either<Failure, List<User>>>  
**Attributes:** abstract  
    - **Name:** updateUserStatus  
**Parameters:**
    
    - String userId
    - String newStatus
    
**Return Type:** Future<Either<Failure, void>>  
**Attributes:** abstract  
    - **Name:** updateUserProfile  
**Parameters:**
    
    - String userId
    - String name
    - String role
    - String supervisorId
    
**Return Type:** Future<Either<Failure, void>>  
**Attributes:** abstract  
    
**Implemented Features:**
    
    
**Requirement Ids:**
    
    - 3.2
    - 3.4
    - 3.5
    
**Purpose:** To decouple the domain layer from the data layer by providing a stable interface for data operations.  
**Logic Description:** This abstract class defines the methods for user management. The return types are wrapped in 'Either<Failure, T>' from the 'dartz' package to handle success and failure cases explicitly, preventing the use of try-catch blocks in the domain and presentation layers.  
**Documentation:**
    
    - **Summary:** Defines the contract that any user management data repository must adhere to, ensuring a consistent API for the application's use cases.
    
**Namespace:** com.smartattendance.app.features.user_management.domain.repositories  
**Metadata:**
    
    - **Category:** Domain
    
- **Path:** lib/features/user_management/domain/usecases/get_users.dart  
**Description:** Use case for fetching a paginated and filtered list of users.  
**Template:** Flutter UseCase Template  
**Dependency Level:** 3  
**Name:** GetUsers  
**Type:** UseCase  
**Relative Path:** features/user_management/domain/usecases/get_users.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** _repository  
**Type:** UserManagementRepository  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** call  
**Parameters:**
    
    - GetUsersParams params
    
**Return Type:** Future<Either<Failure, List<User>>>  
**Attributes:**   
    
**Implemented Features:**
    
    - Fetch User List Logic
    
**Requirement Ids:**
    
    - 3.4
    
**Purpose:** To encapsulate the single business rule of retrieving a list of users, abstracting it away from the presentation layer.  
**Logic Description:** This class has a single public method, 'call', which takes a parameter object ('GetUsersParams') containing pagination and filter info. It simply calls the 'getUsers' method on the repository and returns the result. This encapsulates the interaction with the repository for this specific action.  
**Documentation:**
    
    - **Summary:** A use case that retrieves a list of users by interacting with the UserManagementRepository.
    
**Namespace:** com.smartattendance.app.features.user_management.domain.usecases  
**Metadata:**
    
    - **Category:** Domain
    
- **Path:** lib/features/user_management/domain/usecases/update_user_status.dart  
**Description:** Use case for deactivating or reactivating a user.  
**Template:** Flutter UseCase Template  
**Dependency Level:** 3  
**Name:** UpdateUserStatus  
**Type:** UseCase  
**Relative Path:** features/user_management/domain/usecases/update_user_status.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** _repository  
**Type:** UserManagementRepository  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** call  
**Parameters:**
    
    - UpdateUserStatusParams params
    
**Return Type:** Future<Either<Failure, void>>  
**Attributes:**   
    
**Implemented Features:**
    
    - User Status Update Logic
    
**Requirement Ids:**
    
    - 3.2
    
**Purpose:** To encapsulate the business logic for changing a user's active status.  
**Logic Description:** This class has a 'call' method that takes parameters for userId and the new status. It calls the 'updateUserStatus' method on the repository. This action will trigger backend logic for audit logging (REQ-UHM-006).  
**Documentation:**
    
    - **Summary:** A use case responsible for changing a user's status (e.g., to 'Active' or 'Deactivated') via the repository.
    
**Namespace:** com.smartattendance.app.features.user_management.domain.usecases  
**Metadata:**
    
    - **Category:** Domain
    
- **Path:** lib/features/user_management/domain/usecases/update_user_profile.dart  
**Description:** Use case for editing a user's profile details.  
**Template:** Flutter UseCase Template  
**Dependency Level:** 3  
**Name:** UpdateUserProfile  
**Type:** UseCase  
**Relative Path:** features/user_management/domain/usecases/update_user_profile.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** _repository  
**Type:** UserManagementRepository  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** call  
**Parameters:**
    
    - UpdateUserProfileParams params
    
**Return Type:** Future<Either<Failure, void>>  
**Attributes:**   
    
**Implemented Features:**
    
    - User Profile Update Logic
    
**Requirement Ids:**
    
    - 3.5
    
**Purpose:** To encapsulate the business logic for modifying a user's core profile information.  
**Logic Description:** This class's 'call' method takes parameters for userId, name, role, and supervisorId. It invokes the 'updateUserProfile' method on the repository. This action will also trigger backend logic for audit logging (REQ-UHM-006).  
**Documentation:**
    
    - **Summary:** A use case for updating user profile details like name, role, and supervisor assignment.
    
**Namespace:** com.smartattendance.app.features.user_management.domain.usecases  
**Metadata:**
    
    - **Category:** Domain
    
- **Path:** lib/features/user_management/presentation/bloc/user_list_bloc.dart  
**Description:** BLoC for managing the state of the user list screen, including fetching, pagination, and filtering.  
**Template:** Flutter BLoC Template  
**Dependency Level:** 4  
**Name:** UserListBloc  
**Type:** BLoC  
**Relative Path:** features/user_management/presentation/bloc/user_list_bloc.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    - BLoC
    
**Members:**
    
    - **Name:** _getUsers  
**Type:** GetUsers  
**Attributes:** final  
    
**Methods:**
    
    
**Implemented Features:**
    
    - User List State Management
    
**Requirement Ids:**
    
    - 3.4
    
**Purpose:** To handle all business logic and state for the user management dashboard, separating it from the UI.  
**Logic Description:** This BLoC will handle events like 'FetchUsersRequested', 'FilterChanged', and 'FetchNextPage'. On 'FetchUsersRequested', it calls the 'GetUsers' use case and emits 'UserListLoadInProgress', followed by 'UserListLoadSuccess' with the user list or 'UserListLoadFailure'. It manages the current list of users, the pagination cursor (last document snapshot), and whether there are more users to fetch.  
**Documentation:**
    
    - **Summary:** Manages the state for the user list, handling data fetching, pagination, filtering, and error states.
    
**Namespace:** com.smartattendance.app.features.user_management.presentation.bloc  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** lib/features/user_management/presentation/bloc/user_detail_bloc.dart  
**Description:** BLoC for managing the state of the user detail/edit screen.  
**Template:** Flutter BLoC Template  
**Dependency Level:** 4  
**Name:** UserDetailBloc  
**Type:** BLoC  
**Relative Path:** features/user_management/presentation/bloc/user_detail_bloc.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    - BLoC
    
**Members:**
    
    - **Name:** _updateUserStatus  
**Type:** UpdateUserStatus  
**Attributes:** final  
    - **Name:** _updateUserProfile  
**Type:** UpdateUserProfile  
**Attributes:** final  
    
**Methods:**
    
    
**Implemented Features:**
    
    - User Detail State Management
    
**Requirement Ids:**
    
    - 3.2
    - 3.5
    
**Purpose:** To manage the state and business logic for viewing and editing a single user's details.  
**Logic Description:** This BLoC handles events like 'UserStatusChangeRequested' and 'UserProfileUpdateSubmitted'. When an event is received, it calls the corresponding use case ('UpdateUserStatus' or 'UpdateUserProfile'). It emits states to indicate loading ('UserUpdateInProgress') and the result ('UserUpdateSuccess' or 'UserUpdateFailure'). On success, it might trigger a refresh of the user list.  
**Documentation:**
    
    - **Summary:** Handles the logic and state for updating a user's profile information and status.
    
**Namespace:** com.smartattendance.app.features.user_management.presentation.bloc  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** lib/features/user_management/presentation/screens/user_management_dashboard_page.dart  
**Description:** The main screen for administrators to view, filter, and manage all users within their tenant.  
**Template:** Flutter Screen Template  
**Dependency Level:** 5  
**Name:** UserManagementDashboardPage  
**Type:** Screen  
**Relative Path:** features/user_management/presentation/screens/user_management_dashboard_page.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** build  
**Parameters:**
    
    - BuildContext context
    
**Return Type:** Widget  
**Attributes:** override  
    
**Implemented Features:**
    
    - User List Display
    - User Filtering UI
    
**Requirement Ids:**
    
    - 3.4
    
**Purpose:** To provide the user interface for an admin to manage the organization's users.  
**Logic Description:** This is a StatefulWidget that provides the UserListBloc to its widget tree. It uses a BlocBuilder to react to states from the UserListBloc. When the state is 'loading', it shows a progress indicator. On 'success', it displays a ListView of users. The list uses a scroll controller to detect when the user reaches the end, at which point it adds a 'FetchNextPage' event to the BLoC for infinite scrolling. It also contains UI elements for filtering by status.  
**Documentation:**
    
    - **Summary:** This screen presents a paginated and filterable list of all users, allowing an administrator to oversee their organization.
    
**Namespace:** com.smartattendance.app.features.user_management.presentation.screens  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** lib/features/user_management/presentation/screens/user_detail_page.dart  
**Description:** Screen for viewing and editing the details of a single user.  
**Template:** Flutter Screen Template  
**Dependency Level:** 5  
**Name:** UserDetailPage  
**Type:** Screen  
**Relative Path:** features/user_management/presentation/screens/user_detail_page.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** build  
**Parameters:**
    
    - BuildContext context
    
**Return Type:** Widget  
**Attributes:** override  
    
**Implemented Features:**
    
    - User Profile Editing UI
    - User Status Change UI
    
**Requirement Ids:**
    
    - 3.2
    - 3.5
    
**Purpose:** To allow an administrator to modify a user's role, supervisor, and status, and view their profile.  
**Logic Description:** This page receives a user object as an argument. It provides a UserDetailBloc. The UI consists of a form with fields for the user's name, role (dropdown), and supervisor (dropdown). There are also buttons to 'Deactivate' or 'Reactivate' the user. On form submission or button press, the appropriate event is added to the UserDetailBloc. A BlocListener is used to show snackbars for success or failure messages and to navigate back on success.  
**Documentation:**
    
    - **Summary:** Provides the interface for an admin to perform detailed modifications to a single user's account.
    
**Namespace:** com.smartattendance.app.features.user_management.presentation.screens  
**Metadata:**
    
    - **Category:** Presentation
    
- **Path:** lib/core/widgets/graceful_map_view.dart  
**Description:** A reusable widget that displays a Google Map but degrades gracefully if the Maps API is unavailable.  
**Template:** Flutter Widget Template  
**Dependency Level:** 2  
**Name:** GracefulMapView  
**Type:** Widget  
**Relative Path:** core/widgets/graceful_map_view.dart  
**Repository Id:** REPO-01-MOB  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** location  
**Type:** LatLng  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** build  
**Parameters:**
    
    - BuildContext context
    
**Return Type:** Widget  
**Attributes:** override  
    
**Implemented Features:**
    
    - Graceful Degradation
    
**Requirement Ids:**
    
    - 6.6
    
**Purpose:** To ensure application stability by handling failures from the non-critical Google Maps service.  
**Logic Description:** This widget attempts to build a GoogleMap widget. It will be wrapped in a component that can catch platform-specific exceptions related to Google Maps service availability. If an error is caught during the map initialization, instead of crashing, it will display a placeholder container with an icon and a message like 'Map preview unavailable'. Core app functionality (like the check-in button on the same screen) will remain enabled.  
**Documentation:**
    
    - **Summary:** A specialized map view component that prevents application crashes by providing a fallback UI when the underlying map service fails to load.
    
**Namespace:** com.smartattendance.app.core.widgets  
**Metadata:**
    
    - **Category:** Presentation
    


---

# 2. Configuration

- **Feature Toggles:**
  
  - enableGoogleSheetsExport
  - enableBulkUserImport
  - enableMultiLevelApproval
  
- **Database Configs:**
  
  - firebaseProjectId
  - firebaseApiKey
  - firebaseAppId
  


---


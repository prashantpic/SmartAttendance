# Software Design Specification (SDS) for Smart Attendance Mobile App

## 1. Introduction

### 1.1. Purpose
This document provides a detailed software design for the `smart-attendance-mobile-app`, the primary client-side application for the Smart Attendance System. It serves as a technical blueprint for developers and AI code generators, detailing the application's architecture, components, data flows, and feature implementations.

### 1.2. Scope
This SDS covers the entire Flutter-based mobile application, which caters to three user roles: Subordinate, Supervisor, and Administrator. The scope includes user authentication, role-specific dashboards, attendance tracking with offline capabilities, attendance approval workflows, user and event management, and all supporting infrastructure such as navigation, state management, and data access.

## 2. Core Concepts & Architecture

The application will adhere to the principles of **Clean Architecture** to ensure a separation of concerns, maintainability, and testability. The architecture is divided into three primary layers: Presentation, Domain, and Data.

### 2.1. Architectural Layers

*   **Presentation Layer:** (lib/features/**/presentation)
    *   **Responsibility:** Renders the UI and handles user input. Contains Widgets, Screens, and BLoCs. It is the only layer with a dependency on the Flutter framework.
    *   **Components:**
        *   **Screens/Pages:** Stateful or Stateless widgets representing full application screens.
        *   **Widgets:** Reusable UI components.
        *   **BLoCs (Business Logic Components):** Manages the state of a screen or feature. It receives events from the UI, interacts with Use Cases, and emits new states back to the UI.

*   **Domain Layer:** (lib/features/**/domain)
    *   **Responsibility:** Contains the core business logic of the application. This layer is independent of any UI or data-access frameworks.
    *   **Components:**
        *   **Entities:** Pure Dart objects representing the core business models (e.g., `User`, `Attendance`).
        *   **Repositories (Abstract):** Defines the contracts (interfaces) for data operations. The domain layer depends on these abstractions, not on their concrete implementations.
        *   **Use Cases:** Encapsulates a single, specific business rule or user action (e.g., `GetUsers`, `MarkAttendance`). They orchestrate data flow from repositories to the BLoCs.

*   **Data Layer:** (lib/features/**/data)
    *   **Responsibility:** Implements the repository contracts defined in the domain layer. It handles all communication with data sources, both remote (Firestore) and local (Hive).
    *   **Components:**
        *   **Models (DTOs):** Data Transfer Objects that represent the data structure of the data sources (e.g., a Firestore document). They contain logic for serialization/deserialization (`fromJson`, `toJson`).
        *   **Repositories (Implementation):** Concrete implementations of the repository interfaces. They coordinate data from one or more data sources.
        *   **Data Sources (Abstract & Implementation):** Interfaces and concrete classes responsible for direct communication with a single data source (e.g., `UserManagementRemoteDataSourceImpl` for Firestore, `AttendanceLocalDataSourceImpl` for Hive).

### 2.2. State Management
**BLoC (Business Logic Component)** pattern will be the primary state management solution for all features.
*   **Library:** `flutter_bloc`.
*   **Structure:** Each feature will have one or more BLoCs. Each BLoC consists of `Events`, `States`, and the `Bloc` class itself.
*   **Data Flow:** UI widgets dispatch `Events` to the BLoC. The BLoC processes the event, calls the appropriate `UseCase`, and `emits` a new `State`. UI widgets rebuild in response to state changes using `BlocBuilder` or `BlocListener`.

### 2.3. Dependency Injection
A **Service Locator** pattern will be used for dependency injection.
*   **Library:** `get_it`.
*   **Implementation:** A central `injector.dart` file will be responsible for registering all dependencies (BLoCs, Use Cases, Repositories, Data Sources). This decouples classes from their concrete dependencies, simplifying testing and maintenance.
    *   **Repositories & Data Sources:** Registered as lazy singletons.
    *   **BLoCs & Use Cases:** Registered as factories to ensure a new instance is created each time it's needed.

### 2.4. Navigation
Client-side routing will be managed centrally.
*   **Library:** `go_router`.
*   **Implementation:** `AppRouter` class will define all named routes and their corresponding screens. It will implement a `redirect` logic that listens to the `AuthBloc`'s state to protect routes and automatically navigate users based on their authentication status and role.

### 2.5. Error Handling
A functional approach to error handling will be used to avoid widespread `try-catch` blocks in the UI and business logic.
*   **Library:** `dartz`.
*   **Implementation:** All repository and use case methods that can fail will return `Future<Either<Failure, SuccessType>>`.
    *   `Left<Failure>`: Represents a failure case (e.g., `ServerFailure`, `CacheFailure`, `NetworkFailure`).
    *   `Right<SuccessType>`: Represents a successful operation, containing the expected data.
    BLoCs will handle the `Either` result and map it to appropriate failure or success states for the UI.

## 3. Cross-Cutting Concerns

### 3.1. Authentication & Authorization
*   **Session Management:** The `AuthBloc` will be the single source of truth for the user's authentication state. It will be provided at the root of the widget tree.
*   **Role-Based Access:** Upon successful login, the user's `role` and `tenantId` will be fetched and stored within the `AuthBloc`'s state. This information will be used by `AppRouter` for navigation and by the Data Layer to construct tenant-specific Firestore paths.

### 3.2. Offline Support & Data Synchronization
*   **Strategy:** Key functionalities, especially attendance marking, will be available offline.
*   **Local Storage:** **Hive** will be used for local persistence.
    *   **Attendance Queue:** A dedicated Hive box (`attendance_queue`) will store `AttendanceModel` objects created while offline. Each object will have a `syncStatus` of `'Queued'`.
*   **Repository Logic:** The `AttendanceRepositoryImpl` will be responsible for the offline strategy.
    *   **Write Operation:** When marking attendance, the record is *always* written to the local Hive queue first.
    *   **Synchronization:** A `syncOfflineRecords()` method will be triggered on app startup (if network is available) and upon network connectivity changes. This method will:
        1.  Read all records with `syncStatus: 'Queued'` from Hive.
        2.  Attempt to write each record to the `AttendanceRemoteDataSource` (Firestore).
        3.  On successful write, update the record's `syncStatus` to `'Synced'` in Hive, or remove it from the queue.
        4.  On failure, update the status to `'Failed'` and log the error.
*   **Read Operation:** When fetching attendance history, the repository will first return data from the local cache (a separate Hive box for synced data), then fetch from the remote source and update the cache.

### 3.3. Accessibility (a11y) & Internationalization (i18n)
*   **Accessibility:** All widgets must be developed with accessibility in mind, conforming to WCAG 2.1 AA. This includes:
    *   Using `Semantics` widgets for custom controls.
    *   Providing meaningful labels for all interactive elements (`tooltip`, `semanticLabel`).
    *   Ensuring sufficient color contrast.
    *   Supporting dynamic font sizes.
*   **Internationalization:**
    *   All user-facing strings must be externalized into `.arb` files (`lib/l10n`).
    *   The application will use the `flutter_localizations` package and the `intl` library.
    *   The initial release will only contain `app_en.arb`, but the architecture will fully support adding other languages.

## 4. Feature-Specific Design

This section details the design for each major feature, broken down by architectural layer.

### 4.1. User & Hierarchy Management (Admin)
*   **Presentation Layer (`lib/features/user_management/presentation`)**
    *   **`UserListBloc`:** Manages state for fetching, paginating, and filtering the user list.
        *   **States:** `UserListInitial`, `UserListLoadInProgress`, `UserListLoadSuccess`, `UserListLoadFailure`.
        *   **Events:** `FetchUsersRequested`, `FilterChanged`, `FetchNextPage`.
    *   **`UserDetailBloc`:** Manages state for updating a single user.
        *   **States:** `UserDetailInitial`, `UserUpdateInProgress`, `UserUpdateSuccess`, `UserUpdateFailure`.
        *   **Events:** `UserStatusChangeRequested` (deactivate/reactivate), `UserProfileUpdateSubmitted`.
    *   **`UserManagementDashboardPage`:** Displays a paginated list of users using a `BlocBuilder` on `UserListBloc`. Implements infinite scrolling by adding `FetchNextPage` event when the user scrolls to the bottom. Contains filter UI (e.g., dropdown for status).
    *   **`UserDetailPage`:** A form for editing user details (name, role, supervisor). Uses `BlocListener` on `UserDetailBloc` to show snackbars and navigate on success/failure.
*   **Domain Layer (`lib/features/user_management/domain`)**
    *   **Entities:** `User` (id, name, email, role, status).
    *   **Repositories:** `UserManagementRepository` interface with methods: `getUsers`, `updateUserStatus`, `updateUserProfile`.
    *   **Use Cases:** `GetUsers`, `UpdateUserStatus`, `UpdateUserProfile`, each calling a single method on the repository.
*   **Data Layer (`lib/features/user_management/data`)**
    *   **Models:** `UserModel` extends `User` and includes `fromFirestore` factory and `toJson` methods.
    *   **Data Source:** `UserManagementRemoteDataSource` interface and `UserManagementRemoteDataSourceImpl` implementation using `cloud_firestore`.
        *   `getUsers` will construct a Firestore query using the current user's `tenantId`, and apply `.where()`, `.orderBy()`, `.limit()`, and `.startAfterDocument()` for filtering and pagination.
    *   **Repository:** `UserManagementRepositoryImpl` implements the domain interface, handles error mapping from `FirebaseException` to `ServerFailure`, and converts `UserModel` to `User` entity.

### 4.2. Graceful Map View
*   **Presentation Layer (`lib/core/widgets`)**
    *   **`GracefulMapView.dart`:** A `StatefulWidget` that attempts to render a `GoogleMap`.
    *   **Logic:** Inside its `build` method, it will be designed to handle potential `PlatformException`s that can be thrown by the `GoogleMap` widget if Google Play services are unavailable or fail. A `try-catch` block around the map widget or a stateful error handling mechanism will be used. If an error is caught, it will display a fallback `Container` with an icon and a user-friendly message (e.g., "Map preview unavailable"). This ensures that the parent screen (e.g., the attendance check-in page) does not crash and remains functional.

## 5. File-by-File Implementation Plan

This section provides specific implementation details for the files defined in the repository structure.

---

**File: `pubspec.yaml`**
*   **Dependencies:**
    *   `flutter_bloc`: For BLoC state management.
    *   `get_it`: For dependency injection.
    *   `go_router`: For application navigation.
    *   `dartz`: For functional error handling with `Either`.
    *   `equatable`: For value equality in entities and BLoC states.
    *   `firebase_core`: Required for Firebase initialization.
    *   `cloud_firestore`: For interacting with Firestore.
    *   `firebase_auth`: For Firebase Authentication.
    *   `hive`, `hive_flutter`: For local database/offline queue.
    *   `google_maps_flutter`: For map display.
    *   `intl`: For internationalization.
*   **Dev Dependencies:**
    *   `build_runner`: For running code generators.
    *   `mockito`: For creating mock objects in tests.
    *   `bloc_test`: For testing BLoCs.
    *   `hive_generator`: For Hive model generation.
*   **Assets:** Declare paths for any images (e.g., `assets/images/`) and fonts.

**File: `lib/main.dart`**
*   **Logic:**
    dart
    Future<void> main() async {
      WidgetsFlutterBinding.ensureInitialized();
      await Firebase.initializeApp();
      await configureDependencies(); // From injector.dart
      // Setup logging here if needed
      runApp(const SmartAttendanceApp());
    }
    

**File: `lib/app.dart`**
*   **Logic:**
    dart
    class SmartAttendanceApp extends StatelessWidget {
      const SmartAttendanceApp({super.key});

      @override
      Widget build(BuildContext context) {
        return MultiBlocProvider(
          providers: [
            BlocProvider<AuthBloc>(
              create: (context) => sl<AuthBloc>()..add(AuthCheckRequested()),
            ),
          ],
          child: MaterialApp.router(
            title: 'Smart Attendance',
            theme: AppTheme.lightTheme, // Define in a separate theme file
            routerConfig: sl<AppRouter>().router,
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: AppLocalizations.supportedLocales,
          ),
        );
      }
    }
    

**File: `lib/core/di/injector.dart`**
*   **Logic:**
    *   Define `final sl = GetIt.instance;`.
    *   `configureDependencies` will call feature-specific injection methods (e.g., `initUserManagement()`).
    *   `initUserManagement()` will register:
        *   `sl.registerFactory(() => UserListBloc(getUsers: sl()));`
        *   `sl.registerLazySingleton(() => GetUsers(sl()));`
        *   `sl.registerLazySingleton<UserManagementRepository>(() => UserManagementRepositoryImpl(remoteDataSource: sl(), networkInfo: sl()));`
        *   `sl.registerLazySingleton<UserManagementRemoteDataSource>(() => UserManagementRemoteDataSourceImpl(firestore: sl()));`
    *   Register shared dependencies like `sl.registerLazySingleton(() => FirebaseFirestore.instance);` and a `NetworkInfo` implementation.

**File: `lib/core/navigation/app_router.dart`**
*   **Logic:**
    *   Create a `GoRouter` instance.
    *   The `redirect` callback will access `sl<AuthBloc>().state`.
    *   If state is `Unauthenticated` and the current route is not `/login`, redirect to `/login`.
    *   If state is `Authenticated` and the current route is `/login`, redirect to the user's role-based home (`/`, `/supervisor`, or `/admin`).
    *   Define `GoRoute` objects for all screens, e.g., `/admin/users` and `/admin/users/:userId`.

**File: `lib/features/user_management/data/datasources/user_management_remote_data_source_impl.dart`**
*   **`getUsers(...)` method logic:**
    1.  Get `tenantId` from the current authenticated user session (passed in or retrieved from a session service).
    2.  Create a base query: `_firestore.collection('tenants').doc(tenantId).collection('users')`.
    3.  Apply filters: `if (statusFilter != null) query = query.where('status', isEqualTo: statusFilter);`.
    4.  Apply pagination: `if (startAfter != null) query = query.startAfterDocument(startAfter);`.
    5.  Execute query: `final snapshot = await query.limit(limit).get();`.
    6.  Map documents to `UserModel.fromFirestore(doc)`.
    7.  Return the list of models.
    8.  Wrap the entire logic in a `try-catch` block, re-throwing a custom `ServerException` on `FirebaseException`.

**File: `lib/features/user_management/data/repositories/user_management_repository_impl.dart`**
*   **`getUsers(...)` method logic:**
    dart
    // In some method of the repository implementation
    if (await networkInfo.isConnected) {
      try {
        final remoteUsers = await remoteDataSource.getUsers(...);
        return Right(remoteUsers.map((model) => model.toEntity()).toList());
      } on ServerException catch (e) {
        return Left(ServerFailure(message: e.message));
      }
    } else {
      return Left(NetworkFailure());
    }
    

**File: `lib/features/user_management/presentation/screens/user_management_dashboard_page.dart`**
*   **Logic:**
    *   Use a `ScrollController` attached to the `ListView.builder`.
    *   Add a listener to the controller: if `_scrollController.position.pixels == _scrollController.position.maxScrollExtent`, then `context.read<UserListBloc>().add(FetchNextPage());`.
    *   The `BlocBuilder` should handle rendering the list and a loading indicator at the bottom when fetching the next page.

**File: `lib/core/widgets/graceful_map_view.dart`**
*   **Logic:**
    *   The widget will hold a state variable, e.g., `bool _isMapAvailable = true;`.
    *   The `build` method will check this flag: `if (_isMapAvailable) return GoogleMap(...); else return _buildFallbackUI();`.
    *   The `GoogleMap` widget's `onMapCreated` callback will be used. However, errors on some platforms (like web without proper headers) can happen before this. A better approach is to use a `FutureBuilder` or similar mechanism that attempts to verify service availability, or more simply, wrap the UI in a way that catches platform exceptions. For mobile, a `StatefulWidget` that sets its state in `initState` after a brief check, or catches an error during the build phase, is viable. The simplest robust solution is often a `StatefulWidget` that renders the `GoogleMap` and has a `try-catch` within its build method that can set a state variable `_mapLoadFailed = true` and trigger a rebuild to show the fallback UI.
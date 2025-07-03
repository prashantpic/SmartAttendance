# Specification

# 1. Files

- **Path:** mobile/lib/data/repositories/auth/auth_repository.dart  
**Description:** Defines the abstract contract for authentication operations. This interface decouples the application logic from the concrete implementation of the authentication service (Firebase Auth), enabling easier testing and maintenance.  
**Template:** Dart Abstract Class Template  
**Dependency Level:** 0  
**Name:** auth_repository  
**Type:** RepositoryInterface  
**Relative Path:** data/repositories/auth/auth_repository.dart  
**Repository Id:** REPO-002-DAT  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    
**Methods:**
    
    - **Name:** onAuthStateChanged  
**Parameters:**
    
    
**Return Type:** Stream<AuthUser?>  
**Attributes:** get  
    - **Name:** currentUser  
**Parameters:**
    
    
**Return Type:** AuthUser?  
**Attributes:** get  
    - **Name:** signInWithEmailAndPassword  
**Parameters:**
    
    - String email
    - String password
    
**Return Type:** Future<void>  
**Attributes:** abstract  
    - **Name:** verifyPhoneNumber  
**Parameters:**
    
    - String phoneNumber
    - Future<void> Function(PhoneAuthCredential) verificationCompleted
    - Future<void> Function(FirebaseAuthException) verificationFailed
    - Future<void> Function(String, int?) codeSent
    - Future<void> Function(String) codeAutoRetrievalTimeout
    
**Return Type:** Future<void>  
**Attributes:** abstract  
    - **Name:** signInWithPhoneCredential  
**Parameters:**
    
    - PhoneAuthCredential credential
    
**Return Type:** Future<void>  
**Attributes:** abstract  
    - **Name:** sendPasswordResetEmail  
**Parameters:**
    
    - String email
    
**Return Type:** Future<void>  
**Attributes:** abstract  
    - **Name:** signOut  
**Parameters:**
    
    
**Return Type:** Future<void>  
**Attributes:** abstract  
    - **Name:** refreshUser  
**Parameters:**
    
    
**Return Type:** Future<AuthUser?>  
**Attributes:** abstract  
    
**Implemented Features:**
    
    - Authentication Contract Definition
    
**Requirement Ids:**
    
    - 3.2
    
**Purpose:** To provide a technology-agnostic interface for all authentication-related functionalities, ensuring the application layer depends on abstractions, not concrete implementations.  
**Logic Description:** This file will contain an abstract class 'AuthRepository' with method signatures for signing in, signing out, password reset, and observing authentication state changes. It should not contain any implementation logic.  
**Documentation:**
    
    - **Summary:** This abstract class serves as the single source of truth for the authentication contract in the application. Any BLoC or Cubit that needs to perform authentication will interact with this interface.
    
**Namespace:** app.data.auth  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** mobile/lib/data/repositories/auth/firebase_auth_repository.dart  
**Description:** The concrete implementation of AuthRepository using the Firebase Authentication SDK. It handles all direct communication with the Firebase backend for user authentication tasks, including token and custom claim management.  
**Template:** Dart Class Template  
**Dependency Level:** 1  
**Name:** firebase_auth_repository  
**Type:** RepositoryImplementation  
**Relative Path:** data/repositories/auth/firebase_auth_repository.dart  
**Repository Id:** REPO-002-DAT  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** _firebaseAuth  
**Type:** FirebaseAuth  
**Attributes:** final|private  
    - **Name:** _cache  
**Type:** CacheClient  
**Attributes:** final|private  
    
**Methods:**
    
    - **Name:** onAuthStateChanged  
**Parameters:**
    
    
**Return Type:** Stream<AuthUser?>  
**Attributes:** override  
    - **Name:** currentUser  
**Parameters:**
    
    
**Return Type:** AuthUser?  
**Attributes:** override|get  
    - **Name:** signInWithEmailAndPassword  
**Parameters:**
    
    - String email
    - String password
    
**Return Type:** Future<void>  
**Attributes:** override  
    - **Name:** verifyPhoneNumber  
**Parameters:**
    
    - String phoneNumber
    - Future<void> Function(PhoneAuthCredential) verificationCompleted
    - Future<void> Function(FirebaseAuthException) verificationFailed
    - Future<void> Function(String, int?) codeSent
    - Future<void> Function(String) codeAutoRetrievalTimeout
    
**Return Type:** Future<void>  
**Attributes:** override  
    - **Name:** signInWithPhoneCredential  
**Parameters:**
    
    - PhoneAuthCredential credential
    
**Return Type:** Future<void>  
**Attributes:** override  
    - **Name:** sendPasswordResetEmail  
**Parameters:**
    
    - String email
    
**Return Type:** Future<void>  
**Attributes:** override  
    - **Name:** signOut  
**Parameters:**
    
    
**Return Type:** Future<void>  
**Attributes:** override  
    - **Name:** refreshUser  
**Parameters:**
    
    
**Return Type:** Future<AuthUser?>  
**Attributes:** override  
    - **Name:** _userFromFirebase  
**Parameters:**
    
    - firebase_auth.User? firebaseUser
    
**Return Type:** Future<AuthUser?>  
**Attributes:** private  
    
**Implemented Features:**
    
    - Firebase Email-Password Authentication
    - Firebase Phone OTP Authentication
    - Firebase Password Reset
    - User Session Management
    - Custom Claims Handling
    
**Requirement Ids:**
    
    - 3.2
    - 3.2.2
    - 3.2.3
    
**Purpose:** To implement the AuthRepository contract using Firebase, handling all API calls, error translation, and mapping between Firebase user objects and the application's domain user.  
**Logic Description:** This class will implement AuthRepository. It will hold an instance of FirebaseAuth. The 'onAuthStateChanged' stream will be mapped to a stream of the app's 'AuthUser' entity, which includes fetching and decoding custom claims from the ID token. Sign-in methods will wrap FirebaseAuth calls in try-catch blocks, converting FirebaseAuthException into custom application exceptions. The refreshUser method will force-refresh the ID token to get the latest custom claims like 'role' and 'status' and verify the user is not deactivated before allowing access.  
**Documentation:**
    
    - **Summary:** This file is the bridge between the application's authentication logic and the Firebase Authentication service. It encapsulates all Firebase-specific code and provides a clean, domain-centric API to the rest of the app.
    
**Namespace:** app.data.auth  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** mobile/lib/data/repositories/auth/auth_providers.dart  
**Description:** Contains Riverpod providers for dependency injecting the authentication repository and providing convenient access to the authentication state stream and current user throughout the application.  
**Template:** Dart DI Template  
**Dependency Level:** 2  
**Name:** auth_providers  
**Type:** DependencyInjection  
**Relative Path:** data/repositories/auth/auth_providers.dart  
**Repository Id:** REPO-002-DAT  
**Pattern Ids:**
    
    - DependencyInjection
    
**Members:**
    
    - **Name:** authRepositoryProvider  
**Type:** Provider<AuthRepository>  
**Attributes:** final  
    - **Name:** authStateChangesProvider  
**Type:** StreamProvider<AuthUser?>  
**Attributes:** final  
    - **Name:** authControllerProvider  
**Type:** StateNotifierProvider<AuthController, AuthState>  
**Attributes:** final  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Repository Dependency Injection
    - Auth State Streaming
    
**Requirement Ids:**
    
    - 3.2
    
**Purpose:** To decouple the rest of the application from the concrete implementation of the AuthRepository, facilitating easy testing and swapping of implementations.  
**Logic Description:** This file defines several Riverpod providers. 'authRepositoryProvider' will instantiate and provide the 'FirebaseAuthRepository'. 'authStateChangesProvider' will watch the 'onAuthStateChanged' stream from the repository provider, allowing the UI to reactively update based on login state. An 'authControllerProvider' might also be defined here to encapsulate auth logic, though that often lives in the application layer.  
**Documentation:**
    
    - **Summary:** This file is the central point for accessing authentication services and state within the Flutter application using the Riverpod state management library.
    
**Namespace:** app.data.auth.providers  
**Metadata:**
    
    - **Category:** DI
    
- **Path:** mobile/lib/data/repositories/auth/exceptions/auth_exceptions.dart  
**Description:** Defines custom, application-specific exception classes for authentication failures. This prevents leaking Firebase-specific exceptions into the application and business logic layers, providing clearer and more controlled error handling.  
**Template:** Dart Exception Template  
**Dependency Level:** 0  
**Name:** auth_exceptions  
**Type:** Exception  
**Relative Path:** data/repositories/auth/exceptions/auth_exceptions.dart  
**Repository Id:** REPO-002-DAT  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** message  
**Type:** String  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** LogInWithEmailAndPasswordFailure.fromCode  
**Parameters:**
    
    - String code
    
**Return Type:** LogInWithEmailAndPasswordFailure  
**Attributes:** factory  
    
**Implemented Features:**
    
    - Custom Authentication Exception Handling
    
**Requirement Ids:**
    
    - 3.2
    - 3.2.2
    - 3.2.3
    
**Purpose:** To create a clear contract for authentication errors, allowing the UI and application logic to handle specific failures gracefully without needing to know about Firebase-specific error codes.  
**Logic Description:** This file will contain a base abstract class 'AuthFailure' and several concrete exception classes that implement it, such as 'LogInWithEmailAndPasswordFailure', 'LogInWithPhoneFailure', and 'PasswordResetFailure'. A factory constructor will be implemented on these classes to map known 'FirebaseAuthException.code' strings to a user-friendly error message, centralizing error message logic.  
**Documentation:**
    
    - **Summary:** Provides a set of custom exceptions for handling various authentication-related errors in a structured and type-safe manner.
    
**Namespace:** app.data.auth.exceptions  
**Metadata:**
    
    - **Category:** DataAccess
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  


---


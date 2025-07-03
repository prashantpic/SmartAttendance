# Specification

# 1. Files

- **Path:** package.json  
**Description:** Defines the Node.js project, scripts for building and deploying, and lists all dependencies required for the Cloud Function, such as 'firebase-functions', 'firebase-admin', and 'typescript'.  
**Template:** Node.js Package Template  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** package.json  
**Repository Id:** REPO-001-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Dependency Management
    
**Requirement Ids:**
    
    
**Purpose:** To manage all project dependencies and define project metadata and scripts.  
**Logic Description:** This file will list 'firebase-functions', 'firebase-admin' as dependencies. It will also include devDependencies like 'typescript', '@typescript-eslint/parser', and 'eslint'. Scripts for 'build', 'serve', 'deploy', and 'lint' will be defined here.  
**Documentation:**
    
    - **Summary:** Standard npm package manifest. It is the central piece for managing third-party libraries and defining project scripts.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** tsconfig.json  
**Description:** TypeScript compiler configuration file. Specifies the root files and the compiler options required to compile the project, such as target ECMAScript version, module system, and source map generation.  
**Template:** TypeScript Configuration Template  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** tsconfig.json  
**Repository Id:** REPO-001-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation
    
**Requirement Ids:**
    
    
**Purpose:** To configure the TypeScript compiler for transpiling TypeScript code into JavaScript that can run in the Node.js environment of Cloud Functions.  
**Logic Description:** The configuration will set 'module' to 'commonjs', 'target' to 'es2019' or similar, 'outDir' to 'lib', and 'rootDir' to 'src'. It will enable 'sourceMap' for debugging and 'strict' for strong type-checking.  
**Documentation:**
    
    - **Summary:** This file governs how TypeScript code is compiled. It ensures type safety and modern JavaScript features are correctly transpiled for the execution environment.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** src/config/tenant.defaults.ts  
**Description:** Contains constant values for the default configuration settings that are applied to every new tenant upon creation.  
**Template:** TypeScript Constant Template  
**Dependency Level:** 0  
**Name:** tenant.defaults  
**Type:** Configuration  
**Relative Path:** config/tenant.defaults  
**Repository Id:** REPO-001-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** DEFAULT_DATA_RETENTION_DAYS  
**Type:** number  
**Attributes:** export const  
    - **Name:** DEFAULT_APPROVAL_LEVELS  
**Type:** number  
**Attributes:** export const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Default Tenant Configuration
    
**Requirement Ids:**
    
    - 5.3.2
    
**Purpose:** To centralize and provide default policy values for new tenants, ensuring consistency and adherence to business rules.  
**Logic Description:** This file will export constants. DEFAULT_DATA_RETENTION_DAYS will be set to 365. DEFAULT_APPROVAL_LEVELS will be set to 1.  
**Documentation:**
    
    - **Summary:** Provides immutable default settings for new tenant configurations, specifically data retention and approval levels. This ensures all new organizations start with a standard baseline.
    
**Namespace:** api.v1.onboarding.config  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/dtos/provision-tenant.dto.ts  
**Description:** Defines the data transfer objects (DTOs) for the tenant provisioning process. This includes the structure of the request data sent from the client.  
**Template:** TypeScript DTO Template  
**Dependency Level:** 0  
**Name:** provision-tenant.dto  
**Type:** Model  
**Relative Path:** dtos/provision-tenant.dto  
**Repository Id:** REPO-001-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** organizationName  
**Type:** string  
**Attributes:** readonly  
    - **Name:** adminFullName  
**Type:** string  
**Attributes:** readonly  
    - **Name:** adminEmail  
**Type:** string  
**Attributes:** readonly  
    - **Name:** adminPassword  
**Type:** string  
**Attributes:** readonly  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Tenant Provisioning Data Contract
    
**Requirement Ids:**
    
    - 3.1
    - 3.1.1
    
**Purpose:** To establish a strict contract for the data required to provision a new tenant, ensuring type safety and clear communication between client and function.  
**Logic Description:** This file will export a single TypeScript interface named ProvisionTenantRequest containing the organization name, and the initial admin user's full name, email, and password.  
**Documentation:**
    
    - **Summary:** Defines the input contract for the tenant provisioning onCall function. It specifies all necessary information to create a new organization and its first administrator.
    
**Namespace:** api.v1.onboarding.dtos  
**Metadata:**
    
    - **Category:** Model
    
- **Path:** src/infrastructure/auth.adapter.ts  
**Description:** An adapter that encapsulates all interactions with the Firebase Authentication service.  
**Template:** TypeScript Service Template  
**Dependency Level:** 2  
**Name:** auth.adapter  
**Type:** Service  
**Relative Path:** infrastructure/auth.adapter  
**Repository Id:** REPO-001-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** auth  
**Type:** admin.auth.Auth  
**Attributes:** private readonly  
    
**Methods:**
    
    - **Name:** createAuthUser  
**Parameters:**
    
    - email: string
    - password: string
    - fullName: string
    
**Return Type:** Promise<admin.auth.UserRecord>  
**Attributes:** public async  
    - **Name:** setAdminClaims  
**Parameters:**
    
    - userId: string
    - tenantId: string
    
**Return Type:** Promise<void>  
**Attributes:** public async  
    
**Implemented Features:**
    
    - User Account Creation
    - Custom Claims Assignment
    
**Requirement Ids:**
    
    - 3.1.1
    - 3.1.2
    
**Purpose:** To abstract the Firebase Authentication SDK, providing clear, testable methods for creating users and setting their custom claims.  
**Logic Description:** The constructor will take an instance of the Firebase Admin Auth service. The createAuthUser method will call 'admin.auth().createUser()'. The setAdminClaims method will call 'admin.auth().setCustomUserClaims()' to embed the tenantId and an 'Admin' role into the user's auth token.  
**Documentation:**
    
    - **Summary:** Provides an interface to Firebase Authentication. It handles the creation of new user accounts and the critical step of setting custom claims which are used for security rules.
    
**Namespace:** api.v1.onboarding.infrastructure  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/infrastructure/firestore.repository.ts  
**Description:** A repository to handle all data persistence logic for the tenant provisioning process within Firestore.  
**Template:** TypeScript Repository Template  
**Dependency Level:** 2  
**Name:** firestore.repository  
**Type:** Repository  
**Relative Path:** infrastructure/firestore.repository  
**Repository Id:** REPO-001-SVC  
**Pattern Ids:**
    
    - RepositoryPattern
    
**Members:**
    
    - **Name:** db  
**Type:** admin.firestore.Firestore  
**Attributes:** private readonly  
    
**Methods:**
    
    - **Name:** provisionNewTenant  
**Parameters:**
    
    - tenantId: string
    - orgName: string
    - adminUserId: string
    - adminName: string
    - adminEmail: string
    
**Return Type:** Promise<void>  
**Attributes:** public async  
    - **Name:** doesUserExistInAnyTenant  
**Parameters:**
    
    - email: string
    
**Return Type:** Promise<boolean>  
**Attributes:** public async  
    
**Implemented Features:**
    
    - Atomic Tenant Creation
    - User Existence Check
    
**Requirement Ids:**
    
    - 3.1.1
    - 3.1.2
    - 5.3.2
    
**Purpose:** To provide an atomic, transactional method for creating all necessary Firestore documents for a new tenant, ensuring data consistency.  
**Logic Description:** The provisionNewTenant method will use a Firestore batched write. It will create the main tenant document at `/tenants/{tenantId}`. It will then create the initial admin user document at `/tenants/{tenantId}/users/{userId}` with 'Admin' role and 'Active' status. Finally, it will create the default config document at `/tenants/{tenantId}/config/default` using the imported defaults. The entire batch will be committed atomically. The doesUserExist method will perform a root-level collection group query on 'users' to check for email uniqueness across all tenants.  
**Documentation:**
    
    - **Summary:** Handles atomic creation of a new tenant's data in Firestore. It uses a batched write to ensure that the tenant document, the first user document, and the default configuration document are all created successfully, or none are.
    
**Namespace:** api.v1.onboarding.infrastructure  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** src/application/provisioning.service.ts  
**Description:** The application service that orchestrates the entire tenant provisioning workflow, coordinating between authentication and database services.  
**Template:** TypeScript Service Template  
**Dependency Level:** 3  
**Name:** provisioning.service  
**Type:** Service  
**Relative Path:** application/provisioning.service  
**Repository Id:** REPO-001-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** authAdapter  
**Type:** AuthAdapter  
**Attributes:** private readonly  
    - **Name:** firestoreRepo  
**Type:** FirestoreRepository  
**Attributes:** private readonly  
    
**Methods:**
    
    - **Name:** provisionNewTenant  
**Parameters:**
    
    - request: ProvisionTenantRequest
    
**Return Type:** Promise<{ tenantId: string; userId: string; }>  
**Attributes:** public async  
    
**Implemented Features:**
    
    - Tenant Provisioning Orchestration
    - Idempotency Check
    
**Requirement Ids:**
    
    - 3.1.1
    - 3.1.2
    - 5.3.2
    
**Purpose:** To encapsulate the business logic for creating a new tenant, ensuring all steps are executed in the correct order and that the operation is idempotent.  
**Logic Description:** This service's provisionNewTenant method will first call the Firestore repository to check if a user with the given email already exists across any tenant, throwing an error if so to ensure idempotency. It will then generate a new unique ID for the tenant. Next, it will call the AuthAdapter to create the user in Firebase Authentication. With the new user ID, it will call the AuthAdapter again to set admin custom claims. Finally, it will call the Firestore repository's batched write method to create all necessary documents in Firestore. It will return the new tenant and user IDs upon success.  
**Documentation:**
    
    - **Summary:** Orchestrates the creation of a new tenant. It validates input, checks for existing users, coordinates with the authentication and database services, and ensures the entire process is atomic and idempotent.
    
**Namespace:** api.v1.onboarding.application  
**Metadata:**
    
    - **Category:** BusinessLogic
    
- **Path:** src/index.ts  
**Description:** The main entry point for the Firebase Cloud Function. It defines the 'onCall' HTTPS function, handles request/response, and invokes the application service.  
**Template:** Firebase Function Handler Template  
**Dependency Level:** 4  
**Name:** index  
**Type:** Controller  
**Relative Path:** index  
**Repository Id:** REPO-001-SVC  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** provisionTenant  
**Parameters:**
    
    
**Return Type:** functions.https.HttpsCallable  
**Attributes:** export const  
    
**Implemented Features:**
    
    - HTTPS onCall Endpoint
    
**Requirement Ids:**
    
    - 3.1
    
**Purpose:** To expose the tenant provisioning logic as a secure, callable HTTPS endpoint and handle all infrastructure-level concerns like App Check verification.  
**Logic Description:** This file will initialize the firebase-admin SDK. It will export a constant 'provisionTenant' which is an 'onCall' function. The function will be configured with 'enforceAppCheck: true'. Inside the handler, it will instantiate the adapters and the provisioning service. It will parse and validate the incoming data against the ProvisionTenantRequest DTO, then call the provisioning service. It will handle any errors thrown by the service and return a proper success or error response to the client.  
**Documentation:**
    
    - **Summary:** Defines the public-facing 'provisionTenant' onCall function. It is responsible for receiving the client request, enforcing App Check security, calling the core application logic to perform the provisioning, and returning the result.
    
**Namespace:** api.v1.onboarding  
**Metadata:**
    
    - **Category:** Presentation
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  


---


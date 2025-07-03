# Specification

# 1. Files

- **Path:** firestore.rules  
**Description:** Declarative security rules for the Firestore database. This file defines all access control logic, including multi-tenant data isolation, role-based permissions (Admin, Supervisor, Subordinate), and hierarchical data access.  
**Template:** Firebase Security Rules Template  
**Dependency Level:** 0  
**Name:** firestore  
**Type:** Configuration  
**Relative Path:** firestore.rules  
**Repository Id:** REPO-009-CFG  
**Pattern Ids:**
    
    - Multi-Tenancy (Siloed Data Model)
    
**Members:**
    
    
**Methods:**
    
    - **Name:** Helper Functions  
**Parameters:**
    
    
**Return Type:** Boolean/Object  
**Attributes:** private  
**Logic Description:** A collection of reusable functions to simplify and clarify the main rule definitions. Functions include isLoggedIn() to check for an authenticated user, isUserInTenant(tenantId) to verify the user's custom claim tenantId matches the path, isRole(role) to check the user's custom claim role, isOwner(userId) to compare request auth UID with a document's userId, and composite functions like isAdmin(tenantId) and isSupervisor(tenantId) that combine these checks.  
    - **Name:** match /tenants/{tenantId}  
**Parameters:**
    
    - tenantId
    
**Return Type:** Rules  
**Attributes:** public  
**Logic Description:** Defines rules for the top-level tenant document. Reading is allowed only for users belonging to that tenant (verified via isUserInTenant function). Writing is disallowed for all clients, as tenants are provisioned by a trusted backend function.  
    - **Name:** match /tenants/{tenantId}/users/{userId}  
**Parameters:**
    
    - tenantId
    - userId
    
**Return Type:** Rules  
**Attributes:** public  
**Logic Description:** Defines access rules for user profile documents. Read is allowed for the document owner, any Supervisor within the tenant, or any Admin within the tenant. Create, Update, and Delete operations are restricted to Admins only, to maintain hierarchy integrity. An exception allows users to update their own non-sensitive fields like 'name' or 'fcmToken'.  
    - **Name:** match /tenants/{tenantId}/attendance/{recordId}  
**Parameters:**
    
    - tenantId
    - recordId
    
**Return Type:** Rules  
**Attributes:** public  
**Logic Description:** Defines access for attendance records, the core of the hierarchical security model. Read is allowed for the record's owner, Admins, and any supervisor whose userId is present in the record's 'approverHierarchy' array. Create is allowed only for the owner of the record. Update is restricted; a Supervisor can only modify 'status' and 'approvalDetails', while Admins have broader update rights. Delete is disallowed for all clients.  
    - **Name:** match /tenants/{tenantId}/events/{eventId}  
**Parameters:**
    
    - tenantId
    - eventId
    
**Return Type:** Rules  
**Attributes:** public  
**Logic Description:** Defines access for event documents. Read is allowed for Admins, Supervisors, and any user whose userId is in the 'assignedTo' array. Write (create, update, delete) is restricted to Admins and Supervisors only.  
    - **Name:** match /tenants/{tenantId}/config/{configId}  
**Parameters:**
    
    - tenantId
    - configId
    
**Return Type:** Rules  
**Attributes:** public  
**Logic Description:** Defines access for tenant configuration. Read is allowed for any user within the tenant. Write is restricted to Admins only.  
    - **Name:** match /tenants/{tenantId}/auditLogs/{logId}  
**Parameters:**
    
    - tenantId
    - logId
    
**Return Type:** Rules  
**Attributes:** public  
**Logic Description:** Defines access for the immutable audit trail. Read is restricted to Admins only. Write is disallowed for all clients, as logs are created exclusively by trusted backend functions.  
    - **Name:** match /tenants/{tenantId}/linkedSheets/{sheetId}  
**Parameters:**
    
    - tenantId
    - sheetId
    
**Return Type:** Rules  
**Attributes:** public  
**Logic Description:** Defines access for Google Sheets integration metadata. Read and write operations are restricted to Admins only.  
    - **Name:** match /tenants/{tenantId}/userLegalAcceptance/{acceptanceId}  
**Parameters:**
    
    - tenantId
    - acceptanceId
    
**Return Type:** Rules  
**Attributes:** public  
**Logic Description:** Defines access for legal acceptance records. A user can create and read their own record. Admins can read any record for compliance verification. No updates or deletes are allowed from the client to ensure immutability.  
    
**Implemented Features:**
    
    - Multi-tenant Data Isolation
    - Role-Based Access Control
    - Hierarchical Data Access
    
**Requirement Ids:**
    
    - 6.2
    - 2.2
    
**Purpose:** To define and enforce all data access and security rules for the Firestore database. It is the single source of truth for data security, ensuring users can only access data they are authorized to see.  
**Logic Description:** The file begins by defining a set of helper functions to check for authentication, tenant membership, user roles, and data ownership. These functions rely on custom claims (tenantId, role) embedded in the user's authentication token. The main body consists of a series of nested 'match' blocks, one for each collection in the data model. Each block uses the helper functions to specify 'allow' rules for read, write, create, update, and delete operations, strictly enforcing the principle of least privilege for every user role.  
**Documentation:**
    
    - **Summary:** This file implements the security model for Firestore. It takes no direct inputs but evaluates every incoming database request against the defined rules. Its output is a binary decision to either allow or deny the requested operation based on the request's authentication context and the target data.
    
**Namespace:** firebase.firestore.security  
**Metadata:**
    
    - **Category:** Infrastructure
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  


---


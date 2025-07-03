# Software Design Specification (SDS) for NotificationDispatchEndpoint

## 1. Introduction

### 1.1. Purpose

This document provides a detailed software design specification for the `NotificationDispatchEndpoint` repository (`REPO-005-SVC`). This repository contains a single, event-driven Firebase Cloud Function responsible for dispatching push notifications related to attendance record status changes. It is triggered by `onWrite` events in the Firestore `attendance` collection.

### 1.2. Scope

The scope of this document is limited to the design and implementation of the TypeScript Cloud Function within this repository. It covers the function trigger, business logic for notification routing, data access for user information, and interaction with the Firebase Cloud Messaging (FCM) service.

### 1.3. Audience

This document is intended for software developers and architects involved in the development, testing, and maintenance of the Smart Attendance System's backend services.

## 2. System Overview

The `NotificationDispatchEndpoint` is a serverless function that operates within an event-driven architecture. It acts as a listener for any create, update, or delete operations on documents located at the Firestore path `/tenants/{tenantId}/attendance/{attendanceId}`.

The primary workflows handled are:
1.  **New Pending Request:** When a new attendance record is created with a `Pending` status, a notification is sent to the employee's direct supervisor.
2.  **Request Actioned:** When an existing `Pending` attendance record is updated to `Approved` or `Rejected`, a notification is sent to the employee who submitted the record.

The function is designed to be stateless, idempotent, and secure, running with elevated privileges within the Firebase trusted server environment.

## 3. Architectural Design

The function follows a clean, layered architecture to promote separation of concerns, testability, and maintainability.

-   **Handler (`handler.ts`):** The outermost layer containing the Firebase Function trigger. Its sole responsibility is to receive the Firestore event, parse the context, and delegate the processing to the Application Service layer.
-   **Application Service (`notification.service.ts`):** This layer contains the core business logic. It orchestrates the notification workflow by determining the event type, identifying the recipient(s), and using infrastructure services to fetch data and send messages.
-   **Infrastructure (`user.repository.ts`, `fcm.service.ts`):** This layer provides concrete implementations for interacting with external services like Firestore and FCM. It abstracts the details of these services from the application logic.
-   **Domain (`notification.ts`, `user.ts`):** Contains the core data models (entities) of the bounded context.
-   **Interfaces/DTOs (`attendance.dto.ts`):** Defines the data contracts for data moving between layers, ensuring type safety.
-   **Configuration (`notification.templates.ts`):** Centralizes user-facing strings and templates.


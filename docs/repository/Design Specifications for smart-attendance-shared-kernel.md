# Software Design Specification for `smart-attendance-shared-kernel`

## 1. Introduction

This document provides a detailed software design specification for the `smart-attendance-shared-kernel` repository. This repository is a shared Flutter package designed to provide common, reusable code for the main `smart-attendance-mobile-app`. It centralizes data models, utility functions, theme definitions, and common widgets to ensure consistency and maintainability across the application.

## 2. Global Configuration

### 2.1. `pubspec.yaml`

**Purpose:** Configures the Flutter package, its dependencies, and scripts for code generation.

**Implementation Details:**
-   **Package Name:** `smart_attendance_shared`
-   **Dependencies:**
    -   `flutter`: For core Flutter SDK components.
    -   `equatable`: For value-based equality in data models.
    -   `json_annotation`: For annotations used by `json_serializable`.
    -   `cloud_firestore`: Required for `Timestamp` and `GeoPoint` types.
    -   `intl`: For date and time formatting utilities.
-   **Dev Dependencies:**
    -   `build_runner`: To run code generators.
    -   `json_serializable`: To generate `fromJson`/`toJson` methods for models.
    -   `flutter_lints`: To enforce code style and best practices.

**Code Structure:**
yaml
name: smart_attendance_shared
description: A shared kernel for the Smart Attendance mobile application, containing common models, widgets, and utilities.
version: 1.0.0
publish_to: 'none'

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: ">=1.17.0"

dependencies:
  flutter:
    sdk: flutter
  
  # Models & Logic
  equatable: ^2.0.5
  json_annotation: ^4.8.1
  cloud_firestore: ^4.9.0 # For Timestamp and GeoPoint types
  
  # Utilities
  intl: ^0.18.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  
  # Code Generation
  build_runner: ^2.4.6
  json_serializable: ^6.7.1

  # Linting
  flutter_lints: ^2.0.0

flutter:
  # No assets or fonts are defined here. They belong to the main app.


## 3. Data Models

All data models will be immutable, extend `Equatable` for easy comparison, and use `json_serializable` for Firestore data conversion. They will be located in the `lib/src/models/` directory.

### 3.1. `lib/src/models/user.dart`

**Purpose:** Defines the data structure for a user account.

**Implementation Details:**
-   Create a `User` class extending `Equatable`.
-   All properties must be `final`.
-   Use `@JsonSerializable(explicitToJson: true)` annotation.
-   Include `part 'user.g.dart';` for the generated code.
-   Use `TimestampConverter` and `NullableTimestampConverter` for `DateTime` fields.

**Code Structure:**
dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import '../utils/json_converters.dart';

part 'user.g.dart';

@JsonSerializable(explicitToJson: true)
class User extends Equatable {
  final String userId;
  final String tenantId;
  final String name;
  final String email;
  final String role;
  final String status;
  final String? supervisorId;
  final String? fcmToken;
  @NullableTimestampConverter()
  final DateTime? lastLoginTimestamp;
  @TimestampConverter()
  final DateTime createdAt;
  @TimestampConverter()
  final DateTime updatedAt;

  const User({
    required this.userId,
    required this.tenantId,
    required this.name,
    required this.email,
    required this.role,
    required this.status,
    this.supervisorId,
    this.fcmToken,
    this.lastLoginTimestamp,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);

  Map<String, dynamic> toJson() => _$UserToJson(this);

  @override
  List<Object?> get props => [userId, tenantId, name, email, role, status, supervisorId, fcmToken, lastLoginTimestamp, createdAt, updatedAt];
}


### 3.2. `lib/src/models/attendance.dart`

**Purpose:** Defines the data structure for an attendance record.

**Implementation Details:**
-   Create an `Attendance` class extending `Equatable`.
-   Use `@JsonSerializable(explicitToJson: true)`.
-   Include `part 'attendance.g.dart';`.
-   Use `TimestampConverter`, `NullableTimestampConverter`, and `GeoPointConverter` for Firestore-specific types.

**Code Structure:**
dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import '../utils/json_converters.dart';

part 'attendance.g.dart';

@JsonSerializable(explicitToJson: true)
class Attendance extends Equatable {
  final String attendanceId;
  final String userId;
  final String userName;
  final String? eventId;

  @TimestampConverter()
  final DateTime clientCheckInTimestamp;
  @NullableTimestampConverter()
  final DateTime? clientCheckOutTimestamp;
  @TimestampConverter()
  final DateTime serverSyncTimestamp;

  @GeoPointConverter()
  final GeoPoint checkInLocation;
  @NullableGeoPointConverter()
  final GeoPoint? checkOutLocation;

  final double checkInAccuracy;
  final double? checkOutAccuracy;

  final String? checkInAddress;
  final String? checkOutAddress;

  final String status; // 'Pending', 'Approved', 'Rejected'
  final bool isOutsideGeofence;
  final Map<String, dynamic> deviceInfo;
  final Map<String, dynamic>? approvalDetails;
  final List<String> approverHierarchy;

  const Attendance({
    required this.attendanceId,
    required this.userId,
    required this.userName,
    this.eventId,
    required this.clientCheckInTimestamp,
    this.clientCheckOutTimestamp,
    required this.serverSyncTimestamp,
    required this.checkInLocation,
    this.checkOutLocation,
    required this.checkInAccuracy,
    this.checkOutAccuracy,
    this.checkInAddress,
    this.checkOutAddress,
    required this.status,
    required this.isOutsideGeofence,
    required this.deviceInfo,
    this.approvalDetails,
    required this.approverHierarchy,
  });

  factory Attendance.fromJson(Map<String, dynamic> json) => _$AttendanceFromJson(json);

  Map<String, dynamic> toJson() => _$AttendanceToJson(this);

  @override
  List<Object?> get props => [attendanceId, userId];
}


### 3.3. `lib/src/models/event.dart`

**Purpose:** Defines the data structure for a scheduled event.

**Implementation Details:**
-   Create an `Event` class extending `Equatable`.
-   Use `@JsonSerializable(explicitToJson: true)`.
-   Include `part 'event.g.dart';`.
-   Use `TimestampConverter` for `eventDate`.

**Code Structure:**
dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import '../utils/json_converters.dart';

part 'event.g.dart';

@JsonSerializable(explicitToJson: true)
class Event extends Equatable {
  final String eventId;
  final String title;
  final String? description;
  @TimestampConverter()
  final DateTime eventDate;
  final List<String> assignedTo;
  final String createdBy;

  const Event({
    required this.eventId,
    required this.title,
    this.description,
    required this.eventDate,
    required this.assignedTo,
    required this.createdBy,
  });

  factory Event.fromJson(Map<String, dynamic> json) => _$EventFromJson(json);

  Map<String, dynamic> toJson() => _$EventToJson(this);

  @override
  List<Object?> get props => [eventId, title, eventDate];
}


### 3.4. `lib/src/models/models.dart`

**Purpose:** A barrel file to simplify model imports.

**Code Structure:**
dart
export 'user.dart';
export 'attendance.dart';
export 'event.dart';


## 4. Utilities

### 4.1. `lib/src/utils/json_converters.dart`

**Purpose:** Provides `JsonConverter` implementations to handle non-standard JSON types from Firestore (`Timestamp`, `GeoPoint`).

**Implementation Details:**
-   Create a converter for `Timestamp` to `DateTime`.
-   Create a converter for nullable `Timestamp` to nullable `DateTime`.
-   Create converters for `GeoPoint`. Firestore SDKs handle `GeoPoint` natively, so these converters will simply pass the type through, ensuring type safety with `json_serializable`.

**Code Structure:**
dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:json_annotation/json_annotation.dart';

class TimestampConverter implements JsonConverter<DateTime, Timestamp> {
  const TimestampConverter();

  @override
  DateTime fromJson(Timestamp timestamp) {
    return timestamp.toDate();
  }

  @override
  Timestamp toJson(DateTime date) => Timestamp.fromDate(date);
}

class NullableTimestampConverter implements JsonConverter<DateTime?, Timestamp?> {
  const NullableTimestampConverter();

  @override
  DateTime? fromJson(Timestamp? timestamp) {
    return timestamp?.toDate();
  }

  @override
  Timestamp? toJson(DateTime? date) => date == null ? null : Timestamp.fromDate(date);
}

class GeoPointConverter implements JsonConverter<GeoPoint, GeoPoint> {
  const GeoPointConverter();

  @override
  GeoPoint fromJson(GeoPoint geoPoint) {
    return geoPoint;
  }

  @override
  GeoPoint toJson(GeoPoint geoPoint) => geoPoint;
}

class NullableGeoPointConverter implements JsonConverter<GeoPoint?, GeoPoint?> {
  const NullableGeoPointConverter();
  
  @override
  GeoPoint? fromJson(GeoPoint? geoPoint) {
    return geoPoint;
  }

  @override
  GeoPoint? toJson(GeoPoint? geoPoint) => geoPoint;
}


### 4.2. `lib/src/utils/validators.dart`

**Purpose:** Centralizes form field validation logic.

**Implementation Details:**
-   Create a class `Validators` with static methods.
-   Each method should accept a `String?` and return `String?` (an error message or `null` if valid), making them compatible with `TextFormField.validator`.
-   `email`: Use a robust RegExp for validation.
-   `password`: Check for minimum length (e.g., 8 characters).
-   `notEmpty`: Check if the value is not null and not empty after trimming whitespace.

**Code Structure:**
dart
class Validators {
  // A private constructor to prevent instantiation
  Validators._();

  static String? email(String? value) {
    if (value == null || value.isEmpty) {
      return 'Email is required.';
    }
    final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Please enter a valid email address.';
    }
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required.';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    return null;
  }
  
  static String? notEmpty(String? value, String fieldName) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName cannot be empty.';
    }
    return null;
  }
}


### 4.3. `lib/src/utils/date_formatter.dart`

**Purpose:** Provides consistent date and time formatting.

**Implementation Details:**
-   Create a class `DateFormatter` with static methods.
-   Use the `intl` package's `DateFormat` class for formatting logic.

**Code Structure:**
dart
import 'package:intl/intl.dart';

class DateFormatter {
  DateFormatter._();

  static String toFriendlyDate(DateTime date) {
    return DateFormat('MMM d, yyyy').format(date);
  }

  static String toTimeOfDay(DateTime date) {
    return DateFormat('h:mm a').format(date);
  }

  static String toDateTime(DateTime date) {
    return DateFormat('MMM d, yyyy h:mm a').format(date);
  }
}


## 5. Theme

### 5.1. `lib/src/theme/app_colors.dart`

**Purpose:** Defines the application's color palette.

**Implementation Details:**
-   Create a class `AppColors` with `static const Color` fields.

**Code Structure:**
dart
import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color primary = Color(0xFF0D47A1); // Deep Blue
  static const Color secondary = Color(0xFF1976D2); // Lighter Blue
  static const Color accent = Color(0xFF42A5F5); // Accent Blue
  static const Color background = Color(0xFFF5F5F5); // Light Grey
  static const Color scaffoldBackground = Colors.white;
  static const Color textPrimary = Color(0xFF212121); // Dark Grey
  static const Color textSecondary = Color(0xFF757575); // Medium Grey
  static const Color error = Color(0xFFD32F2F);
  static const Color success = Color(0xFF388E3C);
  static const Color warning = Color(0xFFFFA000);
}


### 5.2. `lib/src/theme/app_typography.dart`

**Purpose:** Defines the application's text styles.

**Implementation Details:**
-   Create a class `AppTypography` with `static const TextStyle` fields.

**Code Structure:**
dart
import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTypography {
  AppTypography._();

  static const TextStyle headline1 = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle headline2 = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );

  static const TextStyle bodyText1 = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    color: AppColors.textPrimary,
  );
  
  static const TextStyle bodyText2 = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
  );
  
  static const TextStyle button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  );
}


### 5.3. `lib/src/theme/app_theme.dart`

**Purpose:** Composes a `ThemeData` object for the application.

**Implementation Details:**
-   Create a class `AppTheme` with a static getter `lightTheme`.
-   Instantiate `ThemeData` using `AppColors` and `AppTypography`.
-   Define themes for common widgets like `ElevatedButton`, `InputDecoration`, and `AppBar`.

**Code Structure:**
dart
import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_typography.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.scaffoldBackground,
      fontFamily: 'Roboto', // Assuming a font is defined in the main app
      
      appBarTheme: const AppBarTheme(
        color: AppColors.primary,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.white),
        titleTextStyle: AppTypography.headline2.copyWith(color: Colors.white),
      ),
      
      textTheme: const TextTheme(
        headline1: AppTypography.headline1,
        headline2: AppTypography.headline2,
        bodyText1: AppTypography.bodyText1,
        bodyText2: AppTypography.bodyText2,
        button: AppTypography.button,
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          primary: AppColors.primary,
          onPrimary: Colors.white,
          textStyle: AppTypography.button,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 24),
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.textSecondary),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        labelStyle: AppTypography.bodyText2,
      ),
    );
  }
}


## 6. Shared Widgets

### 6.1. `lib/src/widgets/primary_button.dart`

**Purpose:** A reusable, consistently styled primary button with a loading state.

**Implementation Details:**
-   Create a `StatelessWidget` named `PrimaryButton`.
-   It should accept `text`, `onPressed`, and an optional `isLoading` boolean.
-   When `isLoading` is true, display a `CircularProgressIndicator` and disable the button.

**Code Structure:**
dart
import 'package:flutter/material.dart';

class PrimaryButton extends StatelessWidget {
  const PrimaryButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
  }) : super(key: key);

  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      child: isLoading
          ? const SizedBox(
              height: 24,
              width: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
          : Text(text),
    );
  }
}


### 6.2. `lib/src/widgets/loading_indicator.dart`

**Purpose:** A reusable, centered loading spinner.

**Implementation Details:**
-   Create a `StatelessWidget` named `LoadingIndicator`.
-   It should return a `Center` widget containing a `CircularProgressIndicator`.
-   The indicator should use the theme's primary color.

**Code Structure:**
dart
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class LoadingIndicator extends StatelessWidget {
  const LoadingIndicator({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
      ),
    );
  }
}


## 7. Public API

### 7.1. `lib/smart_attendance_shared.dart`

**Purpose:** Defines the public API for the package by exporting all necessary components.

**Implementation Details:**
-   This barrel file should export the models, theme, key utilities, and all shared widgets.

**Code Structure:**
dart
// Models
export 'src/models/models.dart';

// Theme
export 'src/theme/app_colors.dart';
export 'src/theme/app_typography.dart';
export 'src/theme/app_theme.dart';

// Utils
export 'src/utils/date_formatter.dart';
export 'src/utils/validators.dart';
export 'src/utils/json_converters.dart';

// Widgets
export 'src/widgets/primary_button.dart';
export 'src/widgets/loading_indicator.dart';

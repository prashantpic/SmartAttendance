# Specification

# 1. Files

- **Path:** pubspec.yaml  
**Description:** Defines the Dart package for the shared kernel library. It specifies the package name, description, version, and dependencies required for models, theming, and utilities.  
**Template:** Dart Package Definition  
**Dependency Level:** 0  
**Name:** pubspec  
**Type:** Configuration  
**Relative Path:** ../pubspec.yaml  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Package Definition
    - Dependency Management
    
**Requirement Ids:**
    
    
**Purpose:** To configure the shared kernel as a reusable Flutter package and declare its external dependencies like equatable, json_annotation, and flutter material.  
**Logic Description:** This file contains YAML configuration. It will list dependencies such as 'equatable' for model comparisons, 'json_serializable' and 'json_annotation' for model serialization, and the Flutter SDK for UI components.  
**Documentation:**
    
    - **Summary:** The pubspec.yaml file is the metadata and configuration hub for the 'smart_attendance_shared' package. It controls how the package interacts with the Dart/Flutter ecosystem.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** lib/src/models/user.dart  
**Description:** Data model representing a user account within a tenant. Includes properties for user profile, role, status, and hierarchy. Provides fromJson/toJson for Firestore serialization.  
**Template:** Dart Data Class  
**Dependency Level:** 0  
**Name:** User  
**Type:** Model  
**Relative Path:** src/models/user.dart  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** userId  
**Type:** String  
**Attributes:** final  
    - **Name:** tenantId  
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
    - **Name:** fcmToken  
**Type:** String?  
**Attributes:** final  
    - **Name:** lastLoginTimestamp  
**Type:** DateTime?  
**Attributes:** final  
    - **Name:** createdAt  
**Type:** DateTime  
**Attributes:** final  
    - **Name:** updatedAt  
**Type:** DateTime  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** User  
**Parameters:**
    
    - required this.userId
    - required this.tenantId
    - required this.name
    - etc.
    
**Return Type:** User  
**Attributes:** const  
    - **Name:** fromJson  
**Parameters:**
    
    - Map<String, dynamic> json
    
**Return Type:** User  
**Attributes:** factory  
    - **Name:** toJson  
**Parameters:**
    
    
**Return Type:** Map<String, dynamic>  
**Attributes:**   
    
**Implemented Features:**
    
    - User Data Modeling
    - JSON Serialization
    
**Requirement Ids:**
    
    - 2.4.1
    
**Purpose:** To provide a type-safe representation of the User entity as stored in Firestore, facilitating data handling between the app and the backend.  
**Logic Description:** The class will extend Equatable to allow for value-based comparisons. It will use the json_serializable package to auto-generate fromJson and toJson methods. Fields will be final to promote immutability. Nullable fields will be handled appropriately.  
**Documentation:**
    
    - **Summary:** Defines the User data structure. Input is a JSON map from Firestore, output is a Dart User object or a JSON map for writing to Firestore.
    
**Namespace:** com.smartattendance.shared.models  
**Metadata:**
    
    - **Category:** DataModels
    
- **Path:** lib/src/models/attendance.dart  
**Description:** Data model representing a single attendance record, including check-in/out details, location, status, and approval information. Provides fromJson/toJson for Firestore serialization.  
**Template:** Dart Data Class  
**Dependency Level:** 0  
**Name:** Attendance  
**Type:** Model  
**Relative Path:** src/models/attendance.dart  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** attendanceId  
**Type:** String  
**Attributes:** final  
    - **Name:** userId  
**Type:** String  
**Attributes:** final  
    - **Name:** userName  
**Type:** String  
**Attributes:** final  
    - **Name:** clientCheckInTimestamp  
**Type:** DateTime  
**Attributes:** final  
    - **Name:** clientCheckOutTimestamp  
**Type:** DateTime?  
**Attributes:** final  
    - **Name:** checkInLocation  
**Type:** GeoPoint  
**Attributes:** final  
    - **Name:** status  
**Type:** String  
**Attributes:** final  
    - **Name:** isOutsideGeofence  
**Type:** bool  
**Attributes:** final  
    - **Name:** approverHierarchy  
**Type:** List<String>  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** Attendance  
**Parameters:**
    
    - required this.attendanceId
    - etc.
    
**Return Type:** Attendance  
**Attributes:** const  
    - **Name:** fromJson  
**Parameters:**
    
    - Map<String, dynamic> json
    
**Return Type:** Attendance  
**Attributes:** factory  
    - **Name:** toJson  
**Parameters:**
    
    
**Return Type:** Map<String, dynamic>  
**Attributes:**   
    
**Implemented Features:**
    
    - Attendance Data Modeling
    - JSON Serialization
    
**Requirement Ids:**
    
    
**Purpose:** To provide a type-safe representation of the Attendance entity, centralizing the structure for attendance records used throughout the application.  
**Logic Description:** The class will extend Equatable. It will use json_serializable for serialization. It needs a custom converter for the GeoPoint type from the cloud_firestore package, as it's not a standard JSON type.  
**Documentation:**
    
    - **Summary:** Defines the Attendance record structure. Handles conversion between Firestore documents and Dart objects.
    
**Namespace:** com.smartattendance.shared.models  
**Metadata:**
    
    - **Category:** DataModels
    
- **Path:** lib/src/models/event.dart  
**Description:** Data model for a scheduled event or task assigned to users. Includes properties for title, date, and assigned users. Provides fromJson/toJson for Firestore serialization.  
**Template:** Dart Data Class  
**Dependency Level:** 0  
**Name:** Event  
**Type:** Model  
**Relative Path:** src/models/event.dart  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** eventId  
**Type:** String  
**Attributes:** final  
    - **Name:** title  
**Type:** String  
**Attributes:** final  
    - **Name:** description  
**Type:** String?  
**Attributes:** final  
    - **Name:** eventDate  
**Type:** DateTime  
**Attributes:** final  
    - **Name:** assignedTo  
**Type:** List<String>  
**Attributes:** final  
    - **Name:** createdBy  
**Type:** String  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** Event  
**Parameters:**
    
    - required this.eventId
    - etc.
    
**Return Type:** Event  
**Attributes:** const  
    - **Name:** fromJson  
**Parameters:**
    
    - Map<String, dynamic> json
    
**Return Type:** Event  
**Attributes:** factory  
    - **Name:** toJson  
**Parameters:**
    
    
**Return Type:** Map<String, dynamic>  
**Attributes:**   
    
**Implemented Features:**
    
    - Event Data Modeling
    - JSON Serialization
    
**Requirement Ids:**
    
    - 6.7
    
**Purpose:** To define a structured, type-safe representation for assigned events, used in calendars and for linking attendance records.  
**Logic Description:** The class will extend Equatable. It will use the json_serializable package to handle JSON conversion. All fields are final to ensure immutability of the model objects.  
**Documentation:**
    
    - **Summary:** Defines the Event data structure. Handles conversion between Firestore documents and Dart objects.
    
**Namespace:** com.smartattendance.shared.models  
**Metadata:**
    
    - **Category:** DataModels
    
- **Path:** lib/src/models/models.dart  
**Description:** Barrel file that exports all data models from the models directory. This allows consumers of the package to import all models from a single file.  
**Template:** Dart Barrel File  
**Dependency Level:** 1  
**Name:** models  
**Type:** Export  
**Relative Path:** src/models/models.dart  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Module Export
    
**Requirement Ids:**
    
    
**Purpose:** To simplify imports for the consumer application by providing a single entry point for all shared data models.  
**Logic Description:** This file will contain a series of 'export' statements, one for each model file in the directory (e.g., export 'user.dart'; export 'attendance.dart';).  
**Documentation:**
    
    - **Summary:** Provides a convenient, single import for all shared data models.
    
**Namespace:** com.smartattendance.shared.models  
**Metadata:**
    
    - **Category:** DataModels
    
- **Path:** lib/src/utils/validators.dart  
**Description:** A collection of static utility functions for form field validation. Includes functions for validating email formats, password strength, and non-empty fields.  
**Template:** Dart Utility Class  
**Dependency Level:** 0  
**Name:** Validators  
**Type:** Utility  
**Relative Path:** src/utils/validators.dart  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** isValidEmail  
**Parameters:**
    
    - String email
    
**Return Type:** bool  
**Attributes:** static  
    - **Name:** isValidPassword  
**Parameters:**
    
    - String password
    
**Return Type:** bool  
**Attributes:** static  
    - **Name:** isNotEmpty  
**Parameters:**
    
    - String value
    
**Return Type:** bool  
**Attributes:** static  
    
**Implemented Features:**
    
    - Input Validation
    
**Requirement Ids:**
    
    
**Purpose:** To centralize and standardize input validation logic across the application, ensuring consistency and reusability.  
**Logic Description:** This will be a class with only static methods. The isValidEmail method will use a regular expression to check the email format. isValidPassword will enforce minimum length and character type requirements.  
**Documentation:**
    
    - **Summary:** Provides reusable functions for common input validation tasks.
    
**Namespace:** com.smartattendance.shared.utils  
**Metadata:**
    
    - **Category:** Utilities
    
- **Path:** lib/src/utils/date_formatter.dart  
**Description:** A utility class that provides static methods for formatting DateTime objects into various human-readable string formats for display in the UI.  
**Template:** Dart Utility Class  
**Dependency Level:** 0  
**Name:** DateFormatter  
**Type:** Utility  
**Relative Path:** src/utils/date_formatter.dart  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** toFriendlyDate  
**Parameters:**
    
    - DateTime date
    
**Return Type:** String  
**Attributes:** static  
    - **Name:** toTimeOfDay  
**Parameters:**
    
    - DateTime date
    
**Return Type:** String  
**Attributes:** static  
    - **Name:** toDateTime  
**Parameters:**
    
    - DateTime date
    
**Return Type:** String  
**Attributes:** static  
    
**Implemented Features:**
    
    - Date Formatting
    
**Requirement Ids:**
    
    
**Purpose:** To provide a consistent and localized way of displaying dates and times throughout the application, abstracting the `intl` package.  
**Logic Description:** This class will use the 'intl' package internally to handle date and time formatting. Methods will expose common formats like 'MMM d, yyyy' or 'h:mm a'.  
**Documentation:**
    
    - **Summary:** Provides a set of reusable date and time formatting functions.
    
**Namespace:** com.smartattendance.shared.utils  
**Metadata:**
    
    - **Category:** Utilities
    
- **Path:** lib/src/theme/app_colors.dart  
**Description:** Defines the application's color palette as a set of static constants. This includes primary, secondary, accent, background, and error colors.  
**Template:** Dart Constants  
**Dependency Level:** 0  
**Name:** AppColors  
**Type:** Configuration  
**Relative Path:** src/theme/app_colors.dart  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** primary  
**Type:** Color  
**Attributes:** static|const  
    - **Name:** secondary  
**Type:** Color  
**Attributes:** static|const  
    - **Name:** background  
**Type:** Color  
**Attributes:** static|const  
    - **Name:** error  
**Type:** Color  
**Attributes:** static|const  
    - **Name:** success  
**Type:** Color  
**Attributes:** static|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Color Palette Definition
    
**Requirement Ids:**
    
    
**Purpose:** To provide a single source of truth for all colors used in the application, making it easy to maintain a consistent look and feel and to implement theme changes.  
**Logic Description:** This file will contain a class with static const Color fields. Each color will be defined by its hex value (e.g., const Color(0xFF42A5F5)).  
**Documentation:**
    
    - **Summary:** Centralizes all color constants for the application theme.
    
**Namespace:** com.smartattendance.shared.theme  
**Metadata:**
    
    - **Category:** Theme
    
- **Path:** lib/src/theme/app_typography.dart  
**Description:** Defines the application's typography styles, such as headline, body text, and button text, as a set of static constants.  
**Template:** Dart Constants  
**Dependency Level:** 0  
**Name:** AppTypography  
**Type:** Configuration  
**Relative Path:** src/theme/app_typography.dart  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** headline1  
**Type:** TextStyle  
**Attributes:** static|const  
    - **Name:** bodyText1  
**Type:** TextStyle  
**Attributes:** static|const  
    - **Name:** button  
**Type:** TextStyle  
**Attributes:** static|const  
    
**Methods:**
    
    
**Implemented Features:**
    
    - Typography Definition
    
**Requirement Ids:**
    
    
**Purpose:** To centralize text styles, ensuring typographic consistency across all screens and widgets in the application.  
**Logic Description:** This will be a class containing static const TextStyle fields. Each style will define properties like fontSize, fontWeight, and fontFamily.  
**Documentation:**
    
    - **Summary:** Centralizes all TextStyle constants for the application theme.
    
**Namespace:** com.smartattendance.shared.theme  
**Metadata:**
    
    - **Category:** Theme
    
- **Path:** lib/src/theme/app_theme.dart  
**Description:** Combines the color palette, typography, and other visual properties into a complete ThemeData object for the application.  
**Template:** Dart Utility Class  
**Dependency Level:** 1  
**Name:** AppTheme  
**Type:** Configuration  
**Relative Path:** src/theme/app_theme.dart  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** lightTheme  
**Parameters:**
    
    
**Return Type:** ThemeData  
**Attributes:** static  
    - **Name:** darkTheme  
**Parameters:**
    
    
**Return Type:** ThemeData  
**Attributes:** static  
    
**Implemented Features:**
    
    - Theme Composition
    
**Requirement Ids:**
    
    
**Purpose:** To provide a single, easy-to-use ThemeData object that can be applied to the root of the Flutter application, ensuring all child widgets inherit the correct theme.  
**Logic Description:** This file will define a class with a static getter that returns a ThemeData object. It will instantiate ThemeData, populating its properties using the constants from AppColors and AppTypography. It will define themes for components like AppBar, Button, and input fields.  
**Documentation:**
    
    - **Summary:** Constructs and provides the main ThemeData for the application by composing colors and text styles.
    
**Namespace:** com.smartattendance.shared.theme  
**Metadata:**
    
    - **Category:** Theme
    
- **Path:** lib/src/widgets/primary_button.dart  
**Description:** A reusable, custom-styled button widget that enforces the application's primary button style. It abstracts the underlying ElevatedButton or TextButton.  
**Template:** Flutter Widget  
**Dependency Level:** 1  
**Name:** PrimaryButton  
**Type:** Widget  
**Relative Path:** src/widgets/primary_button.dart  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    - **Name:** text  
**Type:** String  
**Attributes:** final  
    - **Name:** onPressed  
**Type:** VoidCallback?  
**Attributes:** final  
    - **Name:** isLoading  
**Type:** bool  
**Attributes:** final  
    
**Methods:**
    
    - **Name:** build  
**Parameters:**
    
    - BuildContext context
    
**Return Type:** Widget  
**Attributes:** @override  
    
**Implemented Features:**
    
    - Reusable Button Widget
    
**Requirement Ids:**
    
    
**Purpose:** To ensure all primary call-to-action buttons have a consistent look and feel, and to simplify their implementation on various screens.  
**Logic Description:** This will be a StatelessWidget that takes text and an onPressed callback as parameters. It will return a styled ElevatedButton, using colors and text styles from the shared AppTheme. It will also handle a loading state, showing a progress indicator instead of text when isLoading is true.  
**Documentation:**
    
    - **Summary:** A standardized primary button for the application, with built-in styling and loading state management.
    
**Namespace:** com.smartattendance.shared.widgets  
**Metadata:**
    
    - **Category:** Widgets
    
- **Path:** lib/src/widgets/loading_indicator.dart  
**Description:** A reusable loading indicator widget, typically a centered circular progress indicator, to be shown during data fetching or processing.  
**Template:** Flutter Widget  
**Dependency Level:** 1  
**Name:** LoadingIndicator  
**Type:** Widget  
**Relative Path:** src/widgets/loading_indicator.dart  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** build  
**Parameters:**
    
    - BuildContext context
    
**Return Type:** Widget  
**Attributes:** @override  
    
**Implemented Features:**
    
    - Reusable Loading Widget
    
**Requirement Ids:**
    
    
**Purpose:** To provide a consistent visual indicator for loading states across the app.  
**Logic Description:** This StatelessWidget will return a Center widget containing a CircularProgressIndicator. The indicator's color will be set to the theme's primary color from AppColors.  
**Documentation:**
    
    - **Summary:** A simple, centered, and consistently styled loading indicator.
    
**Namespace:** com.smartattendance.shared.widgets  
**Metadata:**
    
    - **Category:** Widgets
    
- **Path:** lib/smart_attendance_shared.dart  
**Description:** The main library file for the package. It exports all public-facing models, utilities, theme configurations, and widgets so they can be accessed with a single import.  
**Template:** Dart Barrel File  
**Dependency Level:** 2  
**Name:** smart_attendance_shared  
**Type:** Export  
**Relative Path:** smart_attendance_shared.dart  
**Repository Id:** REPO-03-SHD  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Package Public API
    
**Requirement Ids:**
    
    
**Purpose:** To define the public API of the shared kernel package, simplifying its consumption by the main mobile application.  
**Logic Description:** This file will contain export statements for the barrel files of each submodule, such as 'export 'src/models/models.dart';', 'export 'src/theme/app_theme.dart';', 'export 'src/widgets/primary_button.dart';', and so on for all public components.  
**Documentation:**
    
    - **Summary:** The single entry point for consuming the shared library's features.
    
**Namespace:** com.smartattendance.shared  
**Metadata:**
    
    - **Category:** Export
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  


---


import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:smart_attendance_mobile_app/app.dart';
import 'package:smart_attendance_mobile_app/core/di/injector.dart';

/// The main entry point for the application.
///
/// This function is responsible for performing essential initializations before
/// running the Flutter application. It ensures that Flutter bindings are ready,
//  initializes Firebase services, and sets up the dependency injection container.
Future<void> main() async {
  // Ensure that the Flutter binding is initialized before calling any platform-specific code.
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase. This must be done before using any Firebase services.
  await Firebase.initializeApp();

  // Configure all application dependencies (services, repositories, BLoCs, etc.).
  await configureDependencies();

  // Run the main application widget.
  runApp(const SmartAttendanceApp());
}
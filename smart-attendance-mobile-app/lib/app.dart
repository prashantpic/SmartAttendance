import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:smart_attendance_mobile_app/core/di/injector.dart';
import 'package:smart_attendance_mobile_app/core/navigation/app_router.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

// --- Placeholder for AuthBloc ---
// This would be in lib/features/auth/presentation/bloc/auth_bloc.dart
class AuthEvent {}
class AuthCheckRequested extends AuthEvent {}
class AuthState {}
class AuthInitial extends AuthState {}
class Authenticated extends AuthState {
  // final User user;
  // Authenticated(this.user);
}
class Unauthenticated extends AuthState {}
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitial()) {
    // In a real app, this would check a repository for auth status
    on<AuthCheckRequested>((event, emit) async {
       await Future.delayed(const Duration(seconds: 1));
       // For demonstration, assume unauthenticated
       emit(Unauthenticated());
    });
  }
}
// --- End Placeholder ---

/// The root widget of the Smart Attendance application.
///
/// This widget sets up the global context for the app, including:
/// - Providing the global [AuthBloc] for session management.
/// - Configuring [MaterialApp.router] to use `go_router` for navigation.
/// - Defining the application's theme.
/// - Setting up localization delegates for internationalization.
class SmartAttendanceApp extends StatelessWidget {
  const SmartAttendanceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        // Provides the AuthBloc to the entire widget tree.
        // It's created here and immediately dispatches an event to check
        // the current authentication status.
        BlocProvider<AuthBloc>(
          create: (context) => sl<AuthBloc>()..add(AuthCheckRequested()),
        ),
      ],
      child: MaterialApp.router(
        title: 'Smart Attendance',
        
        // Define a simple light theme. A more complex theme would be in a separate file.
        theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
          ),
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),

        // The router configuration is retrieved from the dependency injector.
        routerConfig: sl<AppRouter>().router,

        // Setup for internationalization (i18n).
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
      ),
    );
  }
}
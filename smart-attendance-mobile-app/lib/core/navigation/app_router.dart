import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:smart_attendance_mobile_app/app.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/entities/user.dart';
import 'package:smart_attendance_mobile_app/features/user_management/presentation/screens/user_detail_page.dart';
import 'package:smart_attendance_mobile_app/features/user_management/presentation/screens/user_management_dashboard_page.dart';

// --- Placeholder Pages ---
class LoginPage extends StatelessWidget {
  const LoginPage({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Login Page')));
}

class SubordinateDashboardPage extends StatelessWidget {
  const SubordinateDashboardPage({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Subordinate Dashboard')));
}

class SupervisorDashboardPage extends StatelessWidget {
  const SupervisorDashboardPage({super.key});
  @override
  Widget build(BuildContext context) => const Scaffold(body: Center(child: Text('Supervisor Dashboard')));
}

class AdminDashboardPage extends StatelessWidget {
  const AdminDashboardPage({super.key});
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Admin Dashboard')),
    body: Center(
      child: ElevatedButton(
        onPressed: () => context.go('/admin/users'),
        child: const Text('Manage Users'),
      ),
    ),
  );
}
// --- End Placeholder Pages ---

/// Manages application navigation using the `go_router` package.
///
/// This class defines all named routes and implements redirection logic
/// based on the user's authentication state, which is provided by the [AuthBloc].
class AppRouter {
  final AuthBloc _authBloc;
  late final GoRouter router;

  AppRouter(this._authBloc) {
    router = GoRouter(
      // The router listens to the AuthBloc for state changes to trigger redirects.
      refreshListenable: GoRouterRefreshStream(_authBloc.stream),
      initialLocation: '/login',
      routes: _routes,
      redirect: _redirect,
    );
  }

  /// Defines all application routes.
  List<GoRoute> get _routes => [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginPage(),
    ),
    GoRoute(
      path: '/',
      builder: (context, state) => const SubordinateDashboardPage(),
    ),
    GoRoute(
      path: '/supervisor',
      builder: (context, state) => const SupervisorDashboardPage(),
    ),
    GoRoute(
      path: '/admin',
      builder: (context, state) => const AdminDashboardPage(),
      routes: [
        GoRoute(
          path: 'users',
          builder: (context, state) => const UserManagementDashboardPage(),
          routes: [
            GoRoute(
              // The :userId parameter is captured from the path.
              path: ':userId',
              builder: (context, state) {
                final userId = state.pathParameters['userId']!;
                // In a real app, you would pass the full user object or fetch it.
                // For now, we'll just pass the ID.
                return UserDetailPage(userId: userId);
              },
            ),
          ],
        ),
      ],
    ),
  ];

  /// Implements redirection logic based on authentication state.
  String? _redirect(BuildContext context, GoRouterState state) {
    final authState = _authBloc.state;
    final location = state.matchedLocation;

    // While authentication is being checked, don't redirect.
    if (authState is AuthInitial) {
      return null;
    }

    final isLoggedIn = authState is Authenticated;
    final isAtLoginPage = location == '/login';

    // If the user is not logged in and not on the login page, redirect to login.
    if (!isLoggedIn && !isAtLoginPage) {
      return '/login';
    }

    // If the user is logged in and on the login page, redirect to their home.
    if (isLoggedIn && isAtLoginPage) {
      // In a real app, the user role would be extracted from the Authenticated state.
      // For demonstration, we'll default to the admin dashboard.
      const role = UserRole.admin; // Example role
      switch (role) {
        case UserRole.admin:
          return '/admin';
        case UserRole.supervisor:
          return '/supervisor';
        case UserRole.subordinate:
          return '/';
      }
    }
    
    // In all other cases, allow navigation.
    return null;
  }
}

/// A utility class to make GoRouter listen to a BLoC's stream.
class GoRouterRefreshStream extends ChangeNotifier {
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }

  late final Stream<dynamic> _subscription;

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
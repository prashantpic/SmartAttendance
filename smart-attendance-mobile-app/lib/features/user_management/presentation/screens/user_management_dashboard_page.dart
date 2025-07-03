import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:smart_attendance_mobile_app/core/di/injector.dart';
import 'package:smart_attendance_mobile_app/features/user_management/presentation/bloc/user_list_bloc.dart';

/// The main screen for administrators to view, filter, and manage all users.
///
/// This widget provides the [UserListBloc] to its child [_UserManagementDashboardView]
/// and triggers the initial data fetch.
class UserManagementDashboardPage extends StatelessWidget {
  const UserManagementDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) =>
          sl<UserListBloc>()..add(const FetchUsersRequested()),
      child: const _UserManagementDashboardView(),
    );
  }
}

/// The view component that handles the UI and user interactions.
class _UserManagementDashboardView extends StatefulWidget {
  const _UserManagementDashboardView();

  @override
  State<_UserManagementDashboardView> createState() =>
      __UserManagementDashboardViewState();
}

class __UserManagementDashboardViewState
    extends State<_UserManagementDashboardView> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('User Management'),
        actions: [
          // Placeholder for a filter button
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // TODO: Implement filter dialog
            },
          ),
        ],
      ),
      body: BlocBuilder<UserListBloc, UserListState>(
        builder: (context, state) {
          if (state is UserListInitial ||
              (state is UserListLoadInProgress && state.users.isEmpty)) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is UserListLoadFailure) {
            return Center(child: Text('Failed to load users: ${state.message}'));
          }
          if (state is UserListLoadSuccess) {
            if (state.users.isEmpty) {
              return const Center(child: Text('No users found.'));
            }
            return ListView.builder(
              controller: _scrollController,
              itemCount:
                  state.hasReachedMax ? state.users.length : state.users.length + 1,
              itemBuilder: (context, index) {
                if (index >= state.users.length) {
                  return const Center(child: CircularProgressIndicator());
                }
                final user = state.users[index];
                return ListTile(
                  leading: CircleAvatar(child: Text(user.name.substring(0, 1))),
                  title: Text(user.name),
                  subtitle: Text(user.email),
                  trailing: Text(user.role.name),
                  onTap: () => context.go('/admin/users/${user.id}'),
                );
              },
            );
          }
          return const Center(child: Text('Something went wrong.'));
        },
      ),
    );
  }

  @override
  void dispose() {
    _scrollController
      ..removeListener(_onScroll)
      ..dispose();
    super.dispose();
  }

  /// Listener for the scroll controller to detect when to fetch the next page.
  void _onScroll() {
    if (_isBottom) {
      context.read<UserListBloc>().add(FetchNextPage());
    }
  }

  /// Checks if the user has scrolled to the bottom of the list.
  bool get _isBottom {
    if (!_scrollController.hasClients) return false;
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.offset;
    // Trigger fetch a little before the end
    return currentScroll >= (maxScroll * 0.9);
  }
}
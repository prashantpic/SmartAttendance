import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:smart_attendance_mobile_app/core/di/injector.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/entities/user.dart';
import 'package:smart_attendance_mobile_app/features/user_management/presentation/bloc/user_detail_bloc.dart';

/// Screen for viewing and editing the details of a single user.
///
/// This widget receives a `userId` and is responsible for providing the
/// [UserDetailBloc] and handling UI interactions to update user data.
class UserDetailPage extends StatelessWidget {
  final String userId;

  const UserDetailPage({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<UserDetailBloc>(),
      child: _UserDetailView(userId: userId),
    );
  }
}

class _UserDetailView extends StatefulWidget {
  final String userId;
  const _UserDetailView({required this.userId});

  @override
  State<_UserDetailView> createState() => _UserDetailViewState();
}

class _UserDetailViewState extends State<_UserDetailView> {
  // In a real app, you would fetch the user object first.
  // For this example, we'll use placeholder data.
  final _nameController = TextEditingController(text: 'John Doe');
  final _emailController = TextEditingController(text: 'john.doe@example.com');
  UserRole _selectedRole = UserRole.subordinate;
  UserStatus _currentStatus = UserStatus.active;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<UserDetailBloc, UserDetailState>(
      listener: (context, state) {
        if (state is UserUpdateInProgress) {
          // Optionally show a loading dialog
        } else if (state is UserUpdateSuccess) {
          ScaffoldMessenger.of(context)
            ..hideCurrentSnackBar()
            ..showSnackBar(SnackBar(content: Text(state.message)));
          // Navigate back on success
          context.pop();
        } else if (state is UserUpdateFailure) {
          ScaffoldMessenger.of(context)
            ..hideCurrentSnackBar()
            ..showSnackBar(SnackBar(
                content: Text('Error: ${state.message}'),
                backgroundColor: Theme.of(context).colorScheme.error));
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('User Profile'),
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Full Name'),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(labelText: 'Email'),
                enabled: false, // Email is usually not editable
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<UserRole>(
                value: _selectedRole,
                decoration: const InputDecoration(labelText: 'Role'),
                items: UserRole.values
                    .map((role) => DropdownMenuItem(
                          value: role,
                          child: Text(role.name),
                        ))
                    .toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      _selectedRole = value;
                    });
                  }
                },
              ),
              const SizedBox(height: 32),
              _buildActionButtons(context),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Column(
      children: [
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(double.infinity, 48),
          ),
          onPressed: () {
            context.read<UserDetailBloc>().add(UserProfileUpdateSubmitted(
                  userId: widget.userId,
                  data: {
                    'name': _nameController.text,
                    'role': _selectedRole.name,
                  },
                ));
          },
          child: const Text('Save Changes'),
        ),
        const SizedBox(height: 16),
        if (_currentStatus == UserStatus.active)
          TextButton(
            style: TextButton.styleFrom(
              foregroundColor: Theme.of(context).colorScheme.error,
              minimumSize: const Size(double.infinity, 48),
            ),
            onPressed: () {
              context.read<UserDetailBloc>().add(UserStatusChangeRequested(
                    userId: widget.userId,
                    newStatus: UserStatus.deactivated.name,
                  ));
            },
            child: const Text('Deactivate User'),
          )
        else
          TextButton(
            style: TextButton.styleFrom(
              foregroundColor: Colors.green,
              minimumSize: const Size(double.infinity, 48),
            ),
            onPressed: () {
              context.read<UserDetailBloc>().add(UserStatusChangeRequested(
                    userId: widget.userId,
                    newStatus: UserStatus.active.name,
                  ));
            },
            child: const Text('Reactivate User'),
          ),
      ],
    );
  }
}
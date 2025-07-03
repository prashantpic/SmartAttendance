import 'dart:async';
import 'package:bloc/bloc.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/repositories/user_management_repository_impl.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/entities/user.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/usecases/get_users.dart';

part 'user_list_event.dart';
part 'user_list_state.dart';

const _pageSize = 20;

/// BLoC for managing the state of the user list screen.
///
/// Handles all business logic for fetching, paginating, and filtering the user list,
/// separating this logic from the UI.
class UserListBloc extends Bloc<UserListEvent, UserListState> {
  final GetUsers _getUsers;

  UserListBloc({required GetUsers getUsers})
      : _getUsers = getUsers,
        super(UserListInitial()) {
    on<FetchUsersRequested>(_onFetchUsersRequested);
    on<FetchNextPage>(_onFetchNextPage);
  }

  /// Handles the initial fetch or a filtered fetch of users.
  Future<void> _onFetchUsersRequested(
    FetchUsersRequested event,
    Emitter<UserListState> emit,
  ) async {
    emit(UserListLoadInProgress());
    final result = await _getUsers(GetUsersParams(
      limit: _pageSize,
      statusFilter: event.statusFilter,
    ));

    result.fold(
      (failure) => emit(UserListLoadFailure(message: failure.message)),
      (users) {
        final lastDoc = users.isNotEmpty ? (users.last as dynamic).doc : null;
        emit(UserListLoadSuccess(
          users: users,
          hasReachedMax: users.length < _pageSize,
          lastDocument: lastDoc,
        ));
      },
    );
  }

  /// Handles fetching the next page of users for infinite scrolling.
  Future<void> _onFetchNextPage(
    FetchNextPage event,
    Emitter<UserListState> emit,
  ) async {
    // Ensure we are in a success state and haven't reached the end.
    if (state is! UserListLoadSuccess) return;
    final currentState = state as UserListLoadSuccess;
    if (currentState.hasReachedMax) return;

    final result = await _getUsers(GetUsersParams(
      limit: _pageSize,
      startAfter: currentState.lastDocument,
      // Pass the existing filter from the current state if available
    ));

    result.fold(
      (failure) => emit(UserListLoadFailure(message: failure.message)),
      (newUsers) {
        final lastDoc = newUsers.isNotEmpty ? (newUsers.last as dynamic).doc : null;
        emit(UserListLoadSuccess(
          users: currentState.users + newUsers,
          hasReachedMax: newUsers.length < _pageSize,
          lastDocument: lastDoc,
        ));
      },
    );
  }
}

// Separate files for event and state for better organization in larger features.

part of 'user_list_bloc.dart';

abstract class UserListEvent extends Equatable {
  const UserListEvent();
  @override
  List<Object?> get props => [];
}

/// Event to fetch the first page of users, with an optional filter.
class FetchUsersRequested extends UserListEvent {
  final String? statusFilter;

  const FetchUsersRequested({this.statusFilter});

  @override
  List<Object?> get props => [statusFilter];
}

/// Event to fetch the next page of users for pagination.
class FetchNextPage extends UserListEvent {}


part of 'user_list_bloc.dart';

abstract class UserListState extends Equatable {
  const UserListState();
  @override
  List<Object?> get props => [];
}

/// Initial state before any fetching has begun.
class UserListInitial extends UserListState {}

/// State indicating that users are currently being fetched.
class UserListLoadInProgress extends UserListState {}

/// State representing a successful fetch of users.
class UserListLoadSuccess extends UserListState {
  final List<User> users;
  final bool hasReachedMax;
  final DocumentSnapshot? lastDocument;

  const UserListLoadSuccess({
    required this.users,
    required this.hasReachedMax,
    this.lastDocument,
  });

  @override
  List<Object?> get props => [users, hasReachedMax, lastDocument];
}

/// State representing a failure during user fetching.
class UserListLoadFailure extends UserListState {
  final String message;

  const UserListLoadFailure({required this.message});

  @override
  List<Object?> get props => [message];
}
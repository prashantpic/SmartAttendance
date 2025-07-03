import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/usecases/update_user_profile.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/usecases/update_user_status.dart';

part 'user_detail_event.dart';
part 'user_detail_state.dart';

/// BLoC for managing the state of the user detail/edit screen.
///
/// It handles the business logic for submitting updates to a user's profile
/// or status, interacting with the corresponding use cases.
class UserDetailBloc extends Bloc<UserDetailEvent, UserDetailState> {
  final UpdateUserProfile _updateUserProfile;
  final UpdateUserStatus _updateUserStatus;

  UserDetailBloc({
    required UpdateUserProfile updateUserProfile,
    required UpdateUserStatus updateUserStatus,
  })  : _updateUserProfile = updateUserProfile,
        _updateUserStatus = updateUserStatus,
        super(UserDetailInitial()) {
    on<UserProfileUpdateSubmitted>(_onProfileUpdateSubmitted);
    on<UserStatusChangeRequested>(_onStatusChangeRequested);
  }

  /// Handles the submission of user profile updates.
  Future<void> _onProfileUpdateSubmitted(
    UserProfileUpdateSubmitted event,
    Emitter<UserDetailState> emit,
  ) async {
    emit(UserUpdateInProgress());
    final result = await _updateUserProfile(
      UpdateUserProfileParams(userId: event.userId, data: event.data),
    );
    result.fold(
      (failure) => emit(UserUpdateFailure(message: failure.message)),
      (_) => emit(const UserUpdateSuccess(message: 'Profile updated successfully!')),
    );
  }

  /// Handles the request to change a user's status.
  Future<void> _onStatusChangeRequested(
    UserStatusChangeRequested event,
    Emitter<UserDetailState> emit,
  ) async {
    emit(UserUpdateInProgress());
    final result = await _updateUserStatus(
      UpdateUserStatusParams(userId: event.userId, newStatus: event.newStatus),
    );
    result.fold(
      (failure) => emit(UserUpdateFailure(message: failure.message)),
      (_) => emit(const UserUpdateSuccess(message: 'Status updated successfully!')),
    );
  }
}


part of 'user_detail_bloc.dart';

abstract class UserDetailEvent extends Equatable {
  const UserDetailEvent();

  @override
  List<Object> get props => [];
}

/// Event dispatched when the user profile form is submitted.
class UserProfileUpdateSubmitted extends UserDetailEvent {
  final String userId;
  final Map<String, dynamic> data;

  const UserProfileUpdateSubmitted({required this.userId, required this.data});

  @override
  List<Object> get props => [userId, data];
}

/// Event dispatched to change a user's status (e.g., deactivate/reactivate).
class UserStatusChangeRequested extends UserDetailEvent {
  final String userId;
  final String newStatus;

  const UserStatusChangeRequested({required this.userId, required this.newStatus});

  @override
  List<Object> get props => [userId, newStatus];
}


part of 'user_detail_bloc.dart';

abstract class UserDetailState extends Equatable {
  const UserDetailState();

  @override
  List<Object> get props => [];
}

/// The initial state of the user detail screen.
class UserDetailInitial extends UserDetailState {}

/// State indicating that an update operation is in progress.
class UserUpdateInProgress extends UserDetailState {}

/// State representing a successful update operation.
class UserUpdateSuccess extends UserDetailState {
  final String message;

  const UserUpdateSuccess({required this.message});

  @override
  List<Object> get props => [message];
}

/// State representing a failed update operation.
class UserUpdateFailure extends UserDetailState {
  final String message;

  const UserUpdateFailure({required this.message});

  @override
  List<Object> get props => [message];
}
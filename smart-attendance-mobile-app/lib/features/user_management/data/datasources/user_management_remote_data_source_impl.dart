import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/datasources/user_management_remote_data_source.dart';
import 'package:smart_attendance_mobile_app/features/user_management/data/models/user_model.dart';

// --- Placeholder for ServerException ---
// This would be in lib/core/error/exceptions.dart
class ServerException implements Exception {
  final String message;
  ServerException(this.message);
}
// --- End Placeholder ---

/// Implementation of [UserManagementRemoteDataSource] that uses Firebase Firestore.
///
/// This class handles all direct communication with the Firestore backend for
/// user management related CRUD operations.
class UserManagementRemoteDataSourceImpl
    implements UserManagementRemoteDataSource {
  final FirebaseFirestore _firestore;

  UserManagementRemoteDataSourceImpl({required FirebaseFirestore firestore})
      : _firestore = firestore;

  @override
  Future<List<UserModel>> getUsers({
    required String tenantId,
    required int limit,
    DocumentSnapshot? startAfter,
    String? statusFilter,
  }) async {
    try {
      // Construct the base query pointing to the users subcollection of a tenant.
      Query query = _firestore
          .collection('tenants')
          .doc(tenantId)
          .collection('users')
          .orderBy('name'); // Default sorting

      // Apply status filter if provided.
      if (statusFilter != null && statusFilter.isNotEmpty) {
        query = query.where('status', isEqualTo: statusFilter);
      }

      // Apply pagination cursor if provided.
      if (startAfter != null) {
        query = query.startAfterDocument(startAfter);
      }

      // Apply the limit to the number of documents fetched.
      final snapshot = await query.limit(limit).get();

      // Map the Firestore documents to UserModel instances.
      return snapshot.docs
          .map((doc) => UserModel.fromFirestore(doc))
          .toList();
    } on FirebaseException catch (e) {
      // Catch Firestore-specific exceptions and re-throw a custom ServerException.
      throw ServerException(e.message ?? 'An unknown Firestore error occurred.');
    } catch (e) {
      // Catch any other unexpected errors.
      throw ServerException('An unexpected error occurred: $e');
    }
  }

  @override
  Future<void> updateUserProfile({
    required String tenantId,
    required String userId,
    required Map<String, dynamic> data,
  }) async {
    try {
      await _firestore
          .collection('tenants')
          .doc(tenantId)
          .collection('users')
          .doc(userId)
          .update(data);
    } on FirebaseException catch (e) {
      throw ServerException(e.message ?? 'An unknown Firestore error occurred.');
    } catch (e) {
      throw ServerException('An unexpected error occurred: $e');
    }
  }

  @override
  Future<void> updateUserStatus({
    required String tenantId,
    required String userId,
    required String newStatus,
  }) async {
    try {
      await _firestore
          .collection('tenants')
          .doc(tenantId)
          .collection('users')
          .doc(userId)
          .update({'status': newStatus});
    } on FirebaseException catch (e) {
      throw ServerException(e.message ?? 'An unknown Firestore error occurred.');
    } catch (e) {
      throw ServerException('An unexpected error occurred: $e');
    }
  }
}
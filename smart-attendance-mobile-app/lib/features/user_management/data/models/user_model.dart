import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:smart_attendance_mobile_app/features/user_management/domain/entities/user.dart';

/// Data Transfer Object (DTO) for a User.
///
/// This class represents the data structure of a user document as it is stored
/// in Firestore. It extends the domain [User] entity to inherit its properties
/// and adds logic for serialization and deserialization from/to Firestore.
class UserModel extends User {
  const UserModel({
    required super.id,
    required super.name,
    required super.email,
    required super.role,
    required super.status,
  });

  /// Creates a [UserModel] instance from a Firestore [DocumentSnapshot].
  ///
  /// This factory constructor handles the mapping of Firestore document fields
  /// to the model's properties, including converting string representations
  /// of enums back to their typed enum values.
  factory UserModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return UserModel(
      id: doc.id,
      name: data['name'] ?? '',
      email: data['email'] ?? '',
      role: UserRole.values.firstWhere(
        (e) => e.name == data['role'],
        orElse: () => UserRole.subordinate, // Default value on parsing error
      ),
      status: UserStatus.values.firstWhere(
        (e) => e.name == data['status'],
        orElse: () => UserStatus.invited, // Default value on parsing error
      ),
    );
  }

  /// Converts a [UserModel] instance to a JSON map for Firestore.
  ///
  /// This method is used when creating or updating user documents in Firestore.
  /// It converts enum values to their string names for storage.
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'role': role.name,
      'status': status.name,
      // Note: 'id' is not included as it's the document ID.
    };
  }
}
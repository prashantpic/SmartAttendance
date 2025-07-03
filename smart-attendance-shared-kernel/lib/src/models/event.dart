import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';
import '../utils/json_converters.dart';

part 'event.g.dart';

@JsonSerializable(explicitToJson: true)
class Event extends Equatable {
  final String eventId;
  final String title;
  final String? description;
  @TimestampConverter()
  final DateTime eventDate;
  final List<String> assignedTo;
  final String createdBy;

  const Event({
    required this.eventId,
    required this.title,
    this.description,
    required this.eventDate,
    required this.assignedTo,
    required this.createdBy,
  });

  factory Event.fromJson(Map<String, dynamic> json) => _$EventFromJson(json);

  Map<String, dynamic> toJson() => _$EventToJson(this);

  @override
  List<Object?> get props => [eventId, title, eventDate];
}
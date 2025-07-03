import 'package:intl/intl.dart';

class DateFormatter {
  DateFormatter._();

  static String toFriendlyDate(DateTime date) {
    return DateFormat('MMM d, yyyy').format(date);
  }

  static String toTimeOfDay(DateTime date) {
    return DateFormat('h:mm a').format(date);
  }

  static String toDateTime(DateTime date) {
    return DateFormat('MMM d, yyyy h:mm a').format(date);
  }
}
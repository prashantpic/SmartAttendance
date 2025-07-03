import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

/// A reusable widget that displays a Google Map but degrades gracefully if the
/// Maps service is unavailable or fails to load.
///
/// This ensures that a non-critical feature like a map preview does not crash
/// the entire application, for instance, on devices without Google Play Services
/// or due to intermittent platform errors.
class GracefulMapView extends StatefulWidget {
  final LatLng location;

  const GracefulMapView({super.key, required this.location});

  @override
  State<GracefulMapView> createState() => _GracefulMapViewState();
}

class _GracefulMapViewState extends State<GracefulMapView> {
  bool _mapLoadFailed = false;

  @override
  Widget build(BuildContext context) {
    if (_mapLoadFailed) {
      return _buildFallbackUI();
    }

    try {
      return GoogleMap(
        initialCameraPosition: CameraPosition(
          target: widget.location,
          zoom: 15,
        ),
        markers: {
          Marker(
            markerId: const MarkerId('location_marker'),
            position: widget.location,
          ),
        },
        myLocationButtonEnabled: false,
        zoomControlsEnabled: false,
      );
    } catch (e) {
      // Catching potential PlatformExceptions or other errors during build.
      // We schedule a state update for after the current frame to avoid
      // calling setState during a build, which is illegal.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() {
            _mapLoadFailed = true;
          });
        }
      });
      // Return the fallback UI immediately for this build cycle.
      return _buildFallbackUI();
    }
  }

  /// Builds the fallback UI to be displayed when the map fails to load.
  Widget _buildFallbackUI() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: Colors.grey[400]!),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.map_outlined,
              color: Colors.grey[600],
              size: 40,
            ),
            const SizedBox(height: 8),
            Text(
              'Map preview unavailable',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
      ),
    );
  }
}
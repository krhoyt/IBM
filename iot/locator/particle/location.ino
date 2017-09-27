#include <google-maps-device-locator.h>

// Google Maps
GoogleMapsDeviceLocator locator;

// Setup
void setup() {
  // Scan for visible networks
  // Publish to the cloud every thirty seconds
  locator.withSubscribe( locationCallback ).withLocatePeriodic( 30 );
}

void locationCallback( float lat, float lng, float accuracy ) {
  // Do stuff if you want
}

// Loop
void loop() {
  // Keep on looping
  locator.loop();
}

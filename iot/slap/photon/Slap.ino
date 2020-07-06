#include "ZX_Sensor.h"

GestureType gesture;
uint8_t     speed;
ZX_Sensor   sensor = ZX_Sensor( 0x10 );

void setup() {
  // Initialize sensor
  sensor.init();
}

void loop() {
  char content[255];

  // Data available
  if( sensor.gestureAvailable() ) {

    // Read
    gesture = sensor.readGesture();
    speed = sensor.readGestureSpeed();

    // What just happened
    switch( gesture ) {
      case NO_GESTURE:
        sprintf( content, "-1,%u", speed );
        break;

      case RIGHT_SWIPE:
        sprintf( content, "0,%u", speed );
        break;

      case LEFT_SWIPE:
        sprintf( content, "1,%u", speed );
        break;

      case UP_SWIPE:
        sprintf( content, "3,%u", speed );
        break;

    }

    // Publish event
    Particle.publish( "slap", content, PRIVATE );
  }
}

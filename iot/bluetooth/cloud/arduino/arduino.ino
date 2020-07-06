// Reporting rate
unsigned long last = 0;
int rate = 1000;

// Setup
void setup() {
  // Debug
  Serial.begin( 9600 );

	// Make sure LED is off
	// Save battery
  Bean.setLed( 0, 0, 0 );

  // Deep sleep until needed
  Bean.enableWakeOnConnect( true );
}

// Loop
void loop() {
  unsigned long now = 0;
  uint8_t scratch[20];
  
  // Connected to a device
  if( Bean.getConnectionState() ) {
    // Show connection
    Bean.setLed( 0, 255, 0 );    
    
    // Get clock
    now = millis();
    
    // Check timer
    if( ( now - last ) >= rate ) {
      // Update clock
      last = now;
      
      // Set sensor values
      output();      
    }
  } else {
    // Nobody connected
    // Turn off LED
    Bean.setLed( 0, 0, 0 );    
    
    // Deep sleep
    Bean.sleep( 0xFFFFFFFF );   
  }
}

// Sensor values on characteristic
void output() {
  AccelerationReading acceleration;
  char content[20];
  uint8_t scratch[20];

  // Read accelerometer
  acceleration = Bean.getAcceleration();

  // Format values as string
  sprintf(
    content,
    "%d,%d,%d,%d",
    acceleration.xAxis,
    acceleration.yAxis,
    acceleration.zAxis,		
    Bean.getTemperature()
  );

  // Debug
  Serial.println( content );

  // Put string into scratch format
  for( int i = 0; i < strlen( content ); i++ ) {
    scratch[i] = content[i];
  }

  // Set scratch data for various sensors
  Bean.setScratchData( 1, scratch, strlen( content ) );
}

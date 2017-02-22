// Setup
void setup() {
  // Debug
  Serial.begin( 9600 );

  // Deep sleep until needed
  Bean.enableWakeOnConnect( true );
}

// Loop
void loop() {
  AccelerationReading acceleration;
  char content[20];
  uint8_t scratch[20];

  // Connected to a device
  if( Bean.getConnectionState() ) {
    // Read accelerometer
    acceleration = Bean.getAcceleration();

    // Format values as string
    sprintf(
      content,
      "%d,%d,%d",
      acceleration.xAxis,
      acceleration.yAxis,
      acceleration.zAxis
    );

    // Debug
    Serial.println( content );

    // Put string into scratch format
    for( int i = 0; i < strlen( content ); i++ ) {
      scratch[i] = content[i];
    }

    // Set scratch data
    Bean.setScratchData( 1, scratch, strlen( content ) );    
    
    // Any desired delay (ms)
    // Bean.sleep( 1000 );    
  } else {
    // Nobody connected
    // Deep sleep
    Bean.sleep( 0xFFFFFFFF );   
  }
}


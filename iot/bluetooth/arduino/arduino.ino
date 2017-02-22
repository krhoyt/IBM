// Setup
void setup() {
  // Debug
  Serial.begin( 9600 );

  // Deep sleep until needed
  Bean.enableWakeOnConnect( true );
}

// Loop
void loop() {
  // Connected to a device
  if( Bean.getConnectionState() ) {
    // Set sensor values
    // Read LED color
    output();
    input();
    
    // Any desired delay (ms)
    // Bean.sleep( 1000 );    
  } else {
    // Nobody connected
    // Turn of LED
    // Deep sleep
    Bean.setLed( 0, 0, 0 );
    Bean.sleep( 0xFFFFFFFF );   
  }
}

// Desired LED color
void input() {
  ScratchData scratch;
  String content;
  int comma;

  // Get scratch data for LED
  scratch = Bean.readScratchData( 2 );

  // Set respective values
  // Easy inside uint range
  Bean.setLed(
    scratch.data[0],
    scratch.data[1],
    scratch.data[2]
  );
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



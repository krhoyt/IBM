// Reporting rate
unsigned long last = 0;
int rate = 100;

// Setup
void setup() {
  // Debug
  Serial.begin( 9600 );

  // Deep sleep until needed
  Bean.enableWakeOnConnect( true );
}

// Loop
void loop() {
  unsigned long now = 0;
  uint8_t scratch[20];
  
  // Connected to a device
  if( Bean.getConnectionState() ) {
    // Get clock
    now = millis();
    
    // Check timer
    if( ( now - last ) >= rate ) {
      // Set sensor values
      output();      
    }

    // Read LED color    
    input();
  } else {
    // Nobody connected
    // Turn of LED
    Bean.setLed( 0, 0, 0 );

    // Set scratch to black
    scratch[0] = 0;
    scratch[1] = 0;
    scratch[2] = 0;
    Bean.setScratchData( 2, scratch, 20 );

    // Deep sleep
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
    "%d,%d,%d",
    acceleration.xAxis,
    acceleration.yAxis,
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


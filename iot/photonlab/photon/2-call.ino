// Pin reference
// In case we move it around
int LED = D1;

// Setup
void setup() {
  // Serial port
  Serial.begin( 9600 );

  // Digital output
  pinMode( LED, OUTPUT );

  // Expose LED control
  Spark.function( "led", led );
}

// Loop
void loop() {;}

// Control LED
// Expect 0 or 1 for off or on
// Per documentation:
// Requires string input
// Requires integer output
int led( String value ) {
  int state;

  // Convert to integer
  state = value.toInt();

  // Validate input
  // Return error or control LED
  if ( state == 0 || state == 1 ) {
    digitalWrite( LED, state );
  } else {
    state = -1;
  }

  return state;
}

// Pin reference
// In case we move them around
int LED = D1;
int PHOTOCELL = A0;

// Update rate to send event
// Per documentation:
// No faster than one per second
int UPDATE_RATE = 1;

// Delay without blocking
long last;

// Latest light reading
int light = 0;

// Setup
void setup() {
  // Serial port
  Serial.begin( 9600 );

  // Wait for clock to update
  // Seed delay
  do {
    last = Time.now();
    delay( 10 );
  } while ( last < 1000000 && millis() < 20000 );

  // Analog input
  pinMode( PHOTOCELL, INPUT );

  // Digital output
  pinMode( LED, OUTPUT );

  // Expose light reading
  // Expose LED control
  Spark.variable( "light", &light, INT );
  Spark.function( "led", led );
}

// Loop
void loop() {
  long now;

  // Current time in seconds
  now = Time.now();

  // Delay without blocking
  if ( ( now - last ) > UPDATE_RATE ) {
    // Update for next delay
    last = now;

    // Get the photocell value
    // With 10k Ohm
    // At 3.3V
    // 3300 == dark
    // 0 == light
    light = analogRead( PHOTOCELL );

    // Dislpay in serial monitor
    Serial.println( light );

    // Send cloud event
    Spark.publish( "photocell", String( light ) );
  }
}

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

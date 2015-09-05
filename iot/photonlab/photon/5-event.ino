// Pin reference
// In case we move it around
int PHOTOCELL = A0;

// Update rate to send event
// Per documentation:
// No faster than one per second
int UPDATE_RATE = 4;

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

  // Register light reading as variable
  // Exposed through GET
  // CLI: particle get DEVICE light
  Spark.variable( "light", &light, INT );

  // Analog input
  pinMode( PHOTOCELL, INPUT );
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

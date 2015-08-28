// Pin reference
// In case we move it around
int LED = D1;

// Setup
void setup() {
  // Serial port
  Serial.begin( 9600 );

  // Set pin to output mode
  pinMode( LED, OUTPUT );

  // Set to off initially
  digitalWrite( LED, LOW );
}

// Loop
void loop() {
  // Toggle LED state
  if ( digitalRead( LED ) == LOW ) {
    Serial.println( "Turning on." );
    digitalWrite( LED, HIGH );
  } else {
    Serial.println( "Turning off." );
    digitalWrite( LED, LOW );
  }

  // Wait a second
  delay( 1000 );
}

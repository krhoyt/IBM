// Pin reference
// In case we move it around
int PHOTOCELL = A0;

// Light value
// Broader scope
int light = 0;

// Setup
void setup() {
  // Serial port
  Serial.begin( 9600 );

  // Register light reading as variable
  // Exposed through GET
  // CLI: particle get DEVICE light
  Spark.variable( "light", &light, INT );

  // Analog input
  pinMode( PHOTOCELL, INPUT );
}

// Loop
void loop() {
  // Get the photocell value
  // With 10k Ohm
  // At 3.3V
  // 3300 == dark
  // 0 == light
  light = analogRead( PHOTOCELL );

  // Dislpay in serial monitor
  Serial.println( light );

  // Wait a second
  delay( 1000 );
}

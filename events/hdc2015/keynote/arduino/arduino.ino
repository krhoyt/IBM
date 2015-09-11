// Constants
const int DELAY = 1000;
const int LED_OFF = 48;
const int LED_ON = 49;
const int LED_PIN = 7;
const int PHOTOCELL = 0;

// Last update
long last = 0;

// Setup the Arduino
void setup()
{  
  // Use designated pin as an output
  // Set to off initially
  pinMode( LED_PIN, OUTPUT );
  digitalWrite( LED_PIN, LOW );  

  // Analog input for photocell
  pinMode( PHOTOCELL, INPUT );
  
  // Enable serial communication
  Serial.begin( 9600 ); 
}

// Loop
void loop()
{
  int  incoming = 0;
  int  light = 0;
  long now = millis();

  // Delay without blocking
  if( now > ( last + DELAY ) ) 
  {
    // Update timestamp
    last = now;
    
    // Get photocell reading
    light = analogRead( PHOTOCELL );      
    Serial.println( light );    
  }
  
  // Check for serial data
  if( Serial.available() )
  {
    // Read available serial data
    incoming = Serial.read();
    
    // Turn on or off LED based on incoming value
    if( incoming == LED_OFF )
    {
      // Off
      digitalWrite( LED_PIN, LOW );  
    } else if( incoming == LED_ON ) {
      // On
      digitalWrite( LED_PIN, HIGH );
    }
  }  
}

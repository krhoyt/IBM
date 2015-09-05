// Counter
// Wave form
bool    up = true;
int     count = 0;

// Setup
void setup() {
    // Serial output
    Serial.begin( 9600 );        
}

// Loop
void loop() {
    // Change at peak
    if( count == 100 ) {
        up = false;
    } else if( count == 1 ) {
        up = true;
    }
    
    // Increment
    if( up ) {
        count = count + 1;
    } else {
        count = count - 1;
    }
    
    // Serial output
    Serial.println( count, DEC );
    
    // Slight delay
    delay( 1000 );
}


#include "Constants.h"
#include "MQTT/MQTT.h"

// Debug
// #define SERIAL_DEBUG

// Light relay
const int PIN_LIGHT = D4;

// Watson device user name
// Devices use token authentication
char *IOT_USERNAME = "use-token-auth";

// Watson connectivity
MQTT client( Constants::IOT_HOST, 1883, callback );

// Setup
void setup() {
    // External check of firmware update
    Particle.variable( "version", "0.0.2" );    
    
    // Debug
    #ifdef SERIAL_DEBUG
        // Serial output
        Serial.begin( 9600 );

        // Hold until serial input
        while( !Serial.available() ) {
            Particle.process();
        }    
        
        Serial.println( "Here we go ..." );
    #endif    
    
    // Light pin for output
    pinMode( PIN_LIGHT, OUTPUT );   
    
    // Connect to Watson IoT
    client.connect( 
        Constants::IOT_CLIENT, 
        IOT_USERNAME, 
        Constants::IOT_PASSWORD 
    );

    // Connected to Watson
    if( client.isConnected() ) {
        // Debug
        #ifdef SERIAL_DEBUG
            Serial.println( "Connected." );
        #endif        
        
        // Subscribe to topic
        client.subscribe( Constants::TOPIC_HDC );
    }
}

// Loop
void loop() {
    // Process MQTT stream
    if( client.isConnected() ) {
        client.loop();
    }
}

// Reference for handing messages
// Toggle light pin (relay)
void callback( char* topic, byte* payload, unsigned int length ) {
    char p[length + 1];
    
    memcpy( p, payload, length );
    p[length] = NULL;
    
    // Bytes to String
    String message( p );
    
    // Find light value
    // Parsing raw can be easier than making JSON
    int light = message.indexOf( "light\":" ) + 7;
    light = message.substring( light, light + 1 ).toInt();
    
    // Set light
    if( light == 0 ) {
        digitalWrite( PIN_LIGHT, LOW );
    } else if( light == 1 ) {
        digitalWrite( PIN_LIGHT, HIGH );
    }
    
    // Debug
    #ifdef SERIAL_DEBUG    
        // Whole message
        Serial.print( "Message: " );
        Serial.println( message );
        
        // Value
        Serial.print( "Value: " );
        Serial.println( light );        
    #endif
}

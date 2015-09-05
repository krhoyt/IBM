#include "PubSubClient.h"

void callback( char* topic, byte* payload, unsigned int length ) {
  Serial.print( "Message arrived [" );
  Serial.print( topic );
  Serial.print( "] " );
  
  for( int i = 0; i < length; i++ ) {
    Serial.print( ( char )payload[i] );
  }
  
  Serial.println();
}

TCPClient    photon;
PubSubClient client( photon );

void reconnect() {
  // Loop until connected
  while ( !client.connected() ) {
    Serial.print( "Attempting connection ..." );
    
    // Attempt to connect
    // if (client.connect("d:wkqwsd:Photon:PubSubClient", "use-token-auth", "UDcMbB28*SYjDdwe_s")) {
    if( client.connect( "d:wkqwsd:Photon:PubSubClient" ) ) {
      Serial.println( " connected." );

      // IoT Foundation
      // client.subscribe( "iot-2/cmd/testing/fmt/json" );      
      // client.publish( "iot-2/evt/testing/fmt/json","{\"d\": \"hello world\"}" );      
      
      // Eclipse Sandbox
      // client.subscribe( "my/silly/topic" );
      // client.publish( "my/silly/topic", "hello" );
    } else {
      Serial.print( " failed (rc = " );
      Serial.print( client.state() );
      Serial.println( "). Trying again in 5 seconds." );
      
      delay( 5000 );
    }
  }
}

void setup() {
  Serial.begin( 9600 );

  // IoT Foundation
  // client.setServer( "wkqwsd.messaging.internetofthings.ibmcloud.com", 1883 );
  
  // Eclipse Sandbox
  client.setServer( "iot.eclipse.org", 1883 );
  
  client.setCallback( callback );
}

void loop() {
  if( !client.connected() ) {
    reconnect();
  }
  
  client.loop();
}

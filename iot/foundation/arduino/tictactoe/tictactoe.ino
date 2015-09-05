#include <Adafruit_NeoPixel.h>
#include <Bridge.h>
#include <PubSubClient.h>
#include <YunClient.h>

#define NEOPIXEL_COUNT 9
#define NEOPIXEL_PIN 8

YunClient         client;
Adafruit_NeoPixel pixels = Adafruit_NeoPixel( NEOPIXEL_COUNT, NEOPIXEL_PIN, NEO_RGB + NEO_KHZ800 );
PubSubClient      mqtt( "wkqwsd.messaging.internetofthings.ibmcloud.com", 1883, client );

void setup() {
  Bridge.begin();
  
  // Console.begin();
  // while( !Console ) {;}

  pixels.begin();
  pixels.show();

  if( mqtt.connect( "d:wkqwsd:Yun:TicTacToe", "use-token-auth", "j12BeG!+BkIp!@9KaD" ) ) {
    // Console.println( "Connected." );
    mqtt.setCallback( callback );
    mqtt.subscribe( "iot-2/cmd/tictactoe/fmt/json" );
    ready();
  }
}

void loop() {
  mqtt.loop();
}

void callback( char* topic, byte* payload, unsigned int length ) {
  char*   json;
  int     blue;
  int     end;
  int     led;
  int     green;
  int     red;
  int     start;
  String  change;
  String  data;

  json = ( char* )malloc( length + 1 );
  memcpy( json, payload, length );
  json[length] = '\0';

  data = String( json );
  Console.println( data );  

  start = data.indexOf( "\":\"" ) + 3;
  end = data.indexOf( "\"", start );
  change = data.substring( start, end );
  // Console.println( change );

  // Parse message parts
  // LED and color
  led = getValue( change, 0, "," ).toInt();
  red = getValue( change, 1, "," ).toInt();
  green = getValue( change, 2, "," ).toInt();
  blue = getValue( change, 3, "," ).toInt();  

  pixels.setPixelColor( led - 1, green, red, blue );
  pixels.show();
}

// Get a specific section of a string
// Based on delimeters
// Used to replace lack of split
String getValue( String content, int part, String delimeter )
{
  int    end;
  int    start = 0;
  String result;

  // Iterate past unwanted values
  for( int count = 0; count < part; count++ )
  {
    end = content.indexOf( delimeter, start );
    start = end + 1;
  }
  
  // Get next occurance of delimeter
  // May return -1 if not found
  end = content.indexOf( delimeter, start );
  
  // If no more occurances
  if( end == -1 )
  {
    // Must be last value in content
    // Parse out remainder
    result = content.substring( start );
  } else {
    // Otherwise parse out segment of content
    result = content.substring( start, end );
  }
  
  // Return resulting content
  return result;
}

void ready()
{
  for( int p = 0; p < NEOPIXEL_COUNT; p++ ) {
    pixels.setPixelColor( p, 0, 0, 255 );
    pixels.show();
    delay( 500 );
  }

  for( int p = 0; p < NEOPIXEL_COUNT; p++ ) {
    pixels.setPixelColor( p, 0, 0, 0 );
  }

  pixels.show();
}


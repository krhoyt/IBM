// HIH library
#include "HIH61XX/HIH61XX.h"

// Debug
#define SERIAL_DEBUG

// Constants
const char *BLUEMIX_PATH = "/iot-weather/v1/apps/c02e7aae-bf7d-417f-85df-5a605de208d3/reading";
const int   BLUEMIX_PORT = 80;
const char *BLUEMIX_URL = "iot-weather.mybluemix.net";
const char *SENSOR_VERSION = "0.0.1";
const int   UPDATE_RATE = 10000;

// Variables
float     celcius;
float     fahrenheit;
float     humidity;
float     voltage;
HIH61XX   hih( 0x27, D3 );
String    device;
TCPClient client;

// Setup
void setup()
{
  long reset;

  // Wait for clock to update
  do {
    reset = Time.now();
    delay( 10 );
  } while ( reset < 1000000 && millis() < 20000 );

  // I2C
  Wire.begin();

  // Debug
  #ifdef SERIAL_DEBUG
  Serial.begin( 9600 );
  #endif
}

// Loop
void loop()
{
  // Device identification
  device = System.deviceID();

  // Start HIH
  hih.start();
  
  // Update HIH
  hih.update();

  // Sensor values
  celcius = hih.temperature();
  fahrenheit = ( celcius * 1.8 ) + 32;
  humidity = hih.humidity() * 100;

  // Voltage value
  voltage = 3.30;

  // Connect to server
  // Send sensor data
  if( client.connect( BLUEMIX_URL, BLUEMIX_PORT ) )
  {
     request();
     wait();
     response();
  }

  // Delay
  delay( UPDATE_RATE );
}

// Request
void request()
{
  char    content[255];
  char    photon[50];

  char    c[6];
  char    f[6];
  char    h[6];  
  char    v[6];

  // Get values as character arrays
  device.toCharArray( photon, 50 );
  String( celcius, 2 ).toCharArray( c, 6 );
  String( fahrenheit, 2 ).toCharArray( f, 6 );
  String( humidity, 2 ).toCharArray( h, 6 );
  String( voltage, 2 ).toCharArray( v, 6 );

  // Format JSON request body
  sprintf(
    content,
    "{ \"sensor\": \"%s\", \"celcius\": %s, \"fahrenheit\": %s, \"humidity\": %s, \"voltage\": %s, \"timestamp\": %lu, \"version\": \"%s\" }",
    photon,
    c,
    f,
    h,
    v,
    Time.now(),
    SENSOR_VERSION
  );

  // Debug
  #ifdef SERIAL_DEBUG
  Serial.println( content );
  #endif

  // Make request to server
  // Send sensor data as JSON
  client.print( "POST " );
  client.print( BLUEMIX_PATH );
  client.println( " HTTP/1.1" );
  client.println( "User-Agent: Particle Photon" );
  client.print( "Host: " );
  client.println( BLUEMIX_URL );
  client.println( "Content-Type: application/json" );
  client.print( "Content-Length: " );
  client.println( strlen( content ) );
  client.println( "Cache-Control: no-cache" );
  client.println();
  client.print( content );
}

// Response
void response()
{
  char  c;

  // Response from the server
  // Do nothing with response
  while( client.available() )
  {
    c = client.read();

    // Debug
    #ifdef SERIAL_DEBUG
    Serial.print( c );
    #endif
  }

  // Close connection
  client.stop();
}

// Wait
void wait()
{
  // Wait for server response
  while( !client.available() )
  {
    delay( 100 );
  }
}

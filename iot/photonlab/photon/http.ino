// Constants
const char *BLUEMIX_PATH = "/api/photon";
const int   BLUEMIX_PORT = 80;
const char *BLUEMIX_URL = "photon-lab.mybluemix.net";
const int   UPDATE_RATE = 1000;
const int   VALUE_MAXIMUM = 3300;

// Variables
int       reading;
String    device;
TCPClient client;

// Setup
void setup() {;}

// Loop
void loop() {
  // Device identification
  device = System.deviceID();

  // Sensor value
  reading = random( VALUE_MAXIMUM );

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
  // All content
  // Needed for HTTP request
  char    content[255];

  // Device ID as character array
  char    photon[50];

  // Reading as character array
  // Plus one for null terminator
  char    r[5];

  // Get values as character arrays
  device.toCharArray( photon, 50 );
  String( reading ).toCharArray( r, 5 );

  // Format JSON request body
  sprintf(
    content,
    "{ \"device\": \"%s\", \"reading\": %s }",
    photon,
    r
  );

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

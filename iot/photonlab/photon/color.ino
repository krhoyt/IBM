void setup() {
    Serial.begin( 9600 );

    Spark.function( "color", color );
}

void loop() {;}

int color( String value ) {
    int     blue;
    int     end;
    int     green;
    int     start;
    int     red;
    String  part;

    // Here is what we got
    Serial.println( value );

    // Red value
    start = 0;
    end = value.indexOf( "," );
    part = value.substring( start, end );
    red = part.toInt();

    // Green value
    start = end + 1;
    end = value.indexOf( ",", start );
    part = value.substring( start, end );
    green = part.toInt();

    // Blue value
    start = end + 1;
    part = value.substring( start );
    blue = part.toInt();

    // Take over LED
    RGB.control( true );

    // Set color
    RGB.color( red, green, blue );

    // Wait a few seconds
    delay( 5000 );

    // Return control to Photon
    RGB.control( false );

    return 1;
}

local content = "";

function initUart() {
    hardware.configure( UART_57 );
    arduino.configure( 19200, 8, PARITY_NONE, 1, NO_CTSRTS, serialRead );
}

function parseAndSend( content ) {
    local groups = split( content, "," );
    local key;
    local value;
    local parts;
    local station = {};
    
    foreach( pair in groups ) {
        if( pair.find( "=" ) != null ) {
            parts = split( pair, "=" );
            key = parts[0];
            value = parts[1];
            station[key] <- value.tofloat();
        }
    }
    
    station["timestamp"] <- time();
    
    agent.send( "station", station );                
}

function serialRead() {
    local c = arduino.read();

    while( c != -1 ) {
        if( c.tochar() == "$" ) {
            content = "";
            content = content + c.tochar();
        } else if( c.tochar() == "#" ) {
            content = content + c.tochar();
            parseAndSend( content );
            server.log( content );
            content = "";
        } else {
            content = content + c.tochar();
        }

        c = arduino.read();
    }
}

arduino <- hardware.uart57;
initUart();

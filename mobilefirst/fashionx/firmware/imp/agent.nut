const FASHION_URL = "http://foundation.mybluemix.net/api/station";

device.on( "station", function( station ) {
    local parse = http.post( 
        FASHION_URL,
        {
            "Content-Type":"application/json"
        },
        http.jsonencode( station ) 
    ).sendasync(
        function( response ) {
            server.log( response.body );
        } 
    );
} );

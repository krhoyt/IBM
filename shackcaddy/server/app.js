var express = require( 'express' );
var imf = require( 'imf-oauth-user-sdk' );
var ImfBackendStrategy = require( 'passport-imf-token-validation' ).ImfBackendStrategy;
var jsonfile = require( 'jsonfile' );
var passport = require( 'passport' );
var request = require( 'request' );

var ESRI_GEOCODE = 'find';
var ESRI_REVERSE = 'reverseGeocode';
var ESRI_URI = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer';
var LANGUAGE = 'en-US';
var UNITS = 'e';
var WEATHER_CURRENT = 'api/weather/v2/observations/current';
var WEATHER_FORECAST = 'api/weather/v2/forecast/daily/10day';

if( process.env.VCAP_SERVICES ) {
    var environment = JSON.parse( process.env.VCAP_SERVICES );
    var credentials = environment['weatherinsights'][0].credentials;    
} else {
    var credentials = jsonfile.readFileSync( 'configuration.json' );
}

passport.use( new ImfBackendStrategy() );

var app = express();
app.use( passport.initialize() );

// Root redirects to public content
app.get( '/', function( req, res ) {
	res.sendfile( 'public/index.html' );
} );

// Public static content
app.use( '/public', express.static( __dirname + '/public' ) );

// Protected static content
app.use( '/protected', passport.authenticate( 'imf-backend-strategy', {session: false } ) );
app.use( '/protected', express.static( __dirname + '/protected' ) );

// Public services
app.get( '/api/geocode/find', function( req, res ) {
    var url = 
        ESRI_URI + '/' + 
        ESRI_GEOCODE + '?' +
        'text=' + req.query.place + 
        '&f=json';    

    request( url, function( error, response, body ) {
        res.send( 200, body );
    } );
} );

app.get( '/api/test', function( req, res ) {
    res.send( 200, 'Successfully accessed public backend endpoint.' );
} );

app.get( '/api/token', function( req, res ) {
    imf.getAuthorizationHeader().then( function( token ) {
        res.send( 200, token );
    }, function( error ) {
        console.log( error );
    } );    
} );

// Protected services
app.get( '/papi/geocode/find', passport.authenticate( 'imf-backend-strategy', {session: false} ),
    function( req, res ) {
        var url = 
            ESRI_URI + '/' + 
            ESRI_GEOCODE + '?' +
            'text=' + req.query.place + 
            '&f=json';    
    
        request( url, function( error, response, body ) {
            res.send( 200, body );
        } );
    }
);

app.get( '/papi/geocode/reverse', passport.authenticate( 'imf-backend-strategy', {session: false} ),
    function( req, res ) {
        var url = 
            ESRI_URI + '/' +
            ESRI_REVERSE + '?' +
            'location=' + req.query.longitude + ',' + req.query.latitude +
            '&f=json';    
    
        request( url, function( error, response, body ) {
            res.send( 200, body );
        } );
    }
);

app.get( '/papi/golf', passport.authenticate( 'imf-backend-strategy', {session: false} ),
    function( req, res ) {
        var url = ESRI_URI + '/' + ESRI_GEOCODE + '?' + 'text=' + req.query.place + '&f=json';

        request( url, function( error, response, geocode ) {
            var data = JSON.parse( geocode );
            var geometry = data.locations[0].feature.geometry;

            var latitude = geometry.y;
            var longitude = geometry.x;
            var url = 
                credentials.url + '/' + 
                WEATHER_FORECAST + '?' +
                'geocode=' + latitude + ',' + longitude + '&' +
                'format=json' + '&' +
                'language=' + LANGUAGE + '&' +
                'units=' + UNITS;             

            request( url, function( error, response, weather ) {
                var result = {
                    geocode: JSON.parse( geocode ),
                    weather: JSON.parse( weather )
                };

                res.send( 200, JSON.stringify( result ) );
            } );
        } );    
    }
);

app.get( '/papi/test', passport.authenticate( 'imf-backend-strategy', {session: false} ),
    function( req, res ) {
        res.send( 200, 'Successfully accessed protected backend endpoint.' );
    }
);

app.get( '/papi/weather/current', passport.authenticate( 'imf-backend-strategy', {session: false} ),
    function( req, res ) {
        var latitude = req.query.latitude;
        var longitude = req.query.longitude;
        var url = 
            credentials.url + '/' + 
            WEATHER_CURRENT + '?' +
            'geocode=' + latitude + ',' + longitude + '&' +
            'format=json' + '&' +
            'language=' + LANGUAGE + '&' +
            'units=' + UNITS;             

        request( url, function( error, response, body ) {
            res.send( 200, body );
        } );
    }
);

app.get( '/papi/weather/forecast', passport.authenticate( 'imf-backend-strategy', {session: false} ),
    function( req, res ) {
        var latitude = req.query.latitude;
        var longitude = req.query.longitude;
        var url = 
            credentials.url + '/' + 
            WEATHER_FORECAST + '?' +
            'geocode=' + latitude + ',' + longitude + '&' +
            'format=json' + '&' +
            'language=' + LANGUAGE + '&' +
            'units=' + UNITS;             

        request( url, function( error, response, body ) {
            res.send( 200, body );
        } );
    }
);

app.get( '/papi/weather/quick', passport.authenticate( 'imf-backend-strategy', {session: false} ),
    function( req, res ) {
        var latitude = req.query.latitude;
        var longitude = req.query.longitude;
        var result = {
            current: null,
            forecast: null
        };    
        var url = 
            credentials.url + '/' + 
            WEATHER_CURRENT + '?' +
            'geocode=' + latitude + ',' + longitude + '&' +
            'format=json' + '&' +
            'language=' + LANGUAGE + '&' +
            'units=' + UNITS;             

        request( url, function( error, response, body ) {
            result.current = JSON.parse( body );

            url = 
                credentials.url + '/' + 
                WEATHER_FORECAST + '?' +
                'geocode=' + latitude + ',' + longitude + '&' +
                'format=json' + '&' +
                'language=' + LANGUAGE + '&' +
                'units=' + UNITS;             

            request( url, function( error, response, body ) {
                result.forecast = JSON.parse( body );
                res.send( 200, JSON.stringify( result ) );
            } );
        } );
    }
);

// Start listening
var port = ( process.env.VCAP_APP_PORT || 3000 );
app.listen( port );
console.log( 'Weather application is listening at: ' + port );

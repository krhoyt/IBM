// Libraries
var express = require( 'express' );
var imf = require( 'imf-oauth-user-sdk' );
var ImfBackendStrategy = require( 'passport-imf-token-validation' ).ImfBackendStrategy;
var jsonfile = require( 'jsonfile' );
var passport = require( 'passport' );
var request = require( 'request' );

// Constants
var ESRI_GEOCODE = 'find';
var ESRI_REVERSE = 'reverseGeocode';
var ESRI_URI = 'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer';
var LANGUAGE = 'en-US';
var UNITS = 'e';
var WEATHER_CURRENT = 'api/weather/v2/observations/current';
var WEATHER_FORECAST = 'api/weather/v2/forecast/daily/10day';

// Load Weahter Insight credentials
// From Bluemix configuration or local file
if( process.env.VCAP_SERVICES ) {
    var environment = JSON.parse( process.env.VCAP_SERVICES );
    var credentials = environment['weatherinsights'][0].credentials;    
} else {
    var credentials = jsonfile.readFileSync( 'configuration.json' );
}

// Authentication
passport.use( new ImfBackendStrategy() );

// Web server
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

// ESRI geocode finds coordinates from place name
// Public for Andy
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

// Test
app.get( '/api/test', function( req, res ) {
    res.send( 200, 'Successfully accessed public backend endpoint.' );
} );

// Security token
app.get( '/api/token', function( req, res ) {
    imf.getAuthorizationHeader().then( function( token ) {
        res.send( 200, token );
    }, function( error ) {
        console.log( error );
    } );    
} );

// Protected services

// ESRI geocode finds coordinates from place name
app.get( '/papi/geocode/find', passport.authenticate( 'imf-backend-strategy', {session: false} ),
    function( req, res ) {
        var url = 
            ESRI_URI + '/' + 
            ESRI_GEOCODE + '?' +
            'text=' + req.query.place + 
            '&f=json';    
    
        request( url, function( error, response, find ) {
            res.send( 200, find );
        } );
    }
);

// ESRI reverse geocode gets place name from coordinates
app.get( '/papi/geocode/reverse', passport.authenticate( 'imf-backend-strategy', {session: false} ),
    function( req, res ) {
        var url = 
            ESRI_URI + '/' +
            ESRI_REVERSE + '?' +
            'location=' + req.query.longitude + ',' + req.query.latitude +
            '&f=json';    
    
        request( url, function( error, response, reverse ) {
            res.send( 200, reverse );
        } );
    }
);

// Combines ESRI geocode and Weather Insights forecast
app.get( '/papi/golf', passport.authenticate( 'imf-backend-strategy', {session: false} ),
    function( req, res ) {
        var result = {
            forecast: null,
            geocode: null    
        };
        var url = ESRI_URI + '/' + ESRI_GEOCODE + '?' + 'text=' + req.query.place + '&f=json';

        // Geocode
        request( url, function( error, response, geocode ) {
            result.geocode = JSON.parse( geocode );
            
            var geometry = result.geocode.locations[0].feature.geometry;
            var latitude = geometry.y;
            var longitude = geometry.x;
            
            url = 
                credentials.url + '/' + 
                WEATHER_FORECAST + '?' +
                'geocode=' + latitude + ',' + longitude + '&' +
                'format=json' + '&' +
                'language=' + LANGUAGE + '&' +
                'units=' + UNITS;             

            // Weather Insights forecast
            request( url, function( error, response, forecast ) {
                result.forecast = JSON.parse( forecast );
                res.send( 200, JSON.stringify( result ) );
            } );
        } );    
    }
);

// Test
app.get( '/papi/test', passport.authenticate( 'imf-backend-strategy', {session: false} ),
    function( req, res ) {
        res.send( 200, 'Successfully accessed protected backend endpoint.' );
    }
);

// Current conditions from Weather Insights
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

        request( url, function( error, response, current ) {
            res.send( 200, current );
        } );
    }
);

// Forecast conditions from Weather Insights
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

        request( url, function( error, response, forecast ) {
            res.send( 200, forecast );
        } );
    }
);

// Combine current weather and forecast into one request
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

        // Current
        request( url, function( error, response, current ) {
            result.current = JSON.parse( current );

            url = 
                credentials.url + '/' + 
                WEATHER_FORECAST + '?' +
                'geocode=' + latitude + ',' + longitude + '&' +
                'format=json' + '&' +
                'language=' + LANGUAGE + '&' +
                'units=' + UNITS;             

            // Forecast
            request( url, function( error, response, forecast ) {
                result.forecast = JSON.parse( forecast );
                res.send( 200, JSON.stringify( result ) );
            } );
        } );
    }
);

// Start listening
var port = ( process.env.VCAP_APP_PORT || 3000 );
app.listen( port );
console.log( 'Weather application is listening at: ' + port );

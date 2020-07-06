// Libraries
var express = require( 'express' );
var ImfBackendStrategy = require( 'passport-imf-token-validation' ).ImfBackendStrategy;
var imf = require( 'imf-oauth-user-sdk' );
var jsonfile = require( 'jsonfile' );
var passport = require( 'passport' );
var request = require( 'request' );

// Constants
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

// Authentication mechanism (OAuth)
passport.use( new ImfBackendStrategy() );

// Web server
var app = express();
app.use( passport.initialize() );

// Root context
app.get( '/', function( req, res ){
	res.sendfile( 'public/index.html' );
} );

// Public static content
app.use( '/public', express.static( __dirname + '/public' ) );

// Protected static content
app.use( '/protected', passport.authenticate( 'imf-backend-strategy', {session: false} ) );
app.use( '/protected', express.static( __dirname + '/protected' ) );

// *
// Public services
// *

// Token
app.get( '/api/token', function( req, res ) {
    imf.getAuthorizationHeader().then( function( token ) {
        res.send( 200, token );
    }, function( err ) {
        console.log( err );
    } );
} );

// Weather
app.get( '/api/weather', function( req, res ) {
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
} );

// *
// Protected services
// *

// Basic test
app.get( '/papi/test', passport.authenticate( 'imf-backend-strategy', {session: false} ),
    function( req, res ) {
        res.send( 200, 'Successfully access to protected backend endpoint.' );
    }
);

app.get( '/papi/weather', passport.authenticate( 'imf-backend-strategy', {session: false} ),
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

var port = ( process.env.VCAP_APP_PORT || 3000 );
app.listen( port );

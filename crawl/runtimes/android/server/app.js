// Libraries
var express = require( 'express' );
var fs = require( 'fs' );
var ibmbluemix = require( 'ibmbluemix' )
var request = require( 'request' );
var winston = require( 'winston' );

// Constants
var FORECAST_IO = 'https://api.forecast.io/forecast/';
var GOOGLE_ARGUMENT = 'latlng';
var GOOGLE_CITY = 'locality';
var GOOGLE_GEO = 'http://maps.googleapis.com/maps/api/geocode/json';
var GOOGLE_SENSOR = 'sensor=true';
var GOOGLE_STATE = 'administrative_area_level_1';
var KEY_FILE = 'forecast.io';
var LOG_PATH = '../logs/winston.log';

// Application
var forecast_key = null;
var latitude = null;
var longitude = null;

/*
 * Configuration
 */

// Bluemix
ibmbluemix.initialize( {
	applicationId: '0b6a4a12-1ef4-43af-999b-2a50bea45628',
	applicationRoute: 'http://android-weather.mybluemix.net',
	applicationSecret: '35f1ea90412f00d2fddcb11af2db0b996e16ebbc'
} );

// Environment
var ibmconfig = ibmbluemix.getConfig();

// Logging
var ibmlogger = ibmbluemix.getLogger( {
	transports: [
		new( winston.transports.Console )(),
		new( winston.transports.File )( {
			filename: LOG_PATH
		} )
	],
	filename: true,
	methodname: true,
	linenumber: true	
} );

// Forecast
fs.readFile( __dirname + '/' + KEY_FILE, 'utf-8', function( err, data ) {
	if( err ) {
        return ibmlogger.info( err );    
    }
    
    forecast_key = data;
	ibmlogger.info( "Forecast: " + forecast_key );
} );

/*
 * Web
 */

// Express
var app = express();

// Request forwarding
// Pass along services on the request
app.use( function( req, res, next ) {
	ibmlogger.info( 'Forwarding ...' );		
	next();
} );

// Weather data
app.get( ibmconfig.getContextRoot() + '/weather', function( req, res ) {
    latitude = req.query.latitude;
    longitude = req.query.longitude;
    
    request( FORECAST_IO + forecast_key + '/' + latitude + ',' + longitude, function( error, response, body ) {
        var data = null;
        var weather = null;
        
        // Parse weather
        data = JSON.parse( body );
        
        // Build initial weather object
        if( !error && response.statusCode == 200 ) {
            weather = {
                'temperature': data.currently.temperature,
                'icon': data.currently.icon,
                'summary': data.currently.summary,
                'maximum': data.daily.data[0].temperatureMax,
                'minimum': data.daily.data[0].temperatureMin
            };
            
            // Geolocation data
            request( GOOGLE_GEO + '?' + GOOGLE_ARGUMENT + '=' + latitude + ',' + longitude + '&' + GOOGLE_SENSOR, function( error, response, body ) {
                var components = null;
                var data = null;
                
                // Parse geolocation
                data = JSON.parse( body );
                
                // Address components
                components = data.results[0].address_components;
                
                // Find specific components
                for( var c = 0; c < components.length; c++ ) 
                {    
                    // City
                    if( components[c].types[0] == GOOGLE_CITY ) {
                        weather.city = components[c].long_name;
                    }
                 
                    // State
                    if( components[c].types[0] == GOOGLE_STATE ) {
                        weather.state = components[c].short_name;
                    }                    
                }
                
                // Response
                res.send( JSON.stringify( weather ) );
            } );
        }
    } );
} );

// Start server
app.listen( ibmconfig.getPort() );
ibmlogger.info( 'Server started on port: ' + ibmconfig.getPort() );

/*
 * http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/public
 * http://android-weather.mybluemix.net/android-weather/v1/apps/0b6a4a12-1ef4-43af-999b-2a50bea45628/hello
 */

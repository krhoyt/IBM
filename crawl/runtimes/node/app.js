// Libraries
var fs = require( 'fs' );
var request = require( 'request' );
var express = require( 'express' );
var app = express();

// Constants
var FORECAST_IO = 'https://api.forecast.io/forecast/';
var GOOGLE_ARGUMENT = 'latlng';
var GOOGLE_CITY = 'locality';
var GOOGLE_GEO = 'http://maps.googleapis.com/maps/api/geocode/json';
var GOOGLE_SENSOR = 'sensor=true';
var GOOGLE_STATE = 'administrative_area_level_1';
var KEY_FILE = 'forecast.io';

// Application
var forecast_key = null;
var latitude = null;
var longitude = null;

/*
 * Configuration
 */

// Get API key
fs.readFile( '../' + KEY_FILE, 'utf-8', function( err, data ) {
    if( err ) {
        return console.log( err );    
    }
    
    forecast_key = data;
} );

/*
 * Web
 */

// Static content
app.use( express.static( 'web' ) );

// Weather data
app.get( '/weather', function( req, res ) {
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
var server = app.listen( 8000, function () {
	var host = null;
	var port = null;

	host = server.address().address;
	port = server.address().port;	

	console.log( 'Listening on http://%s:%s', host, port );
} );

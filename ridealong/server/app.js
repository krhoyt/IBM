var express = require( 'express' ); 
var jsonfile = require( 'jsonfile' );
var mongoose = require( 'mongoose' );
var parser = require( 'body-parser' );
var path = require( 'path' );

// Environment
var configuration = jsonfile.readFileSync( path.join( __dirname, 'configuration.json' ) );

// Database
mongoose.connect( configuration.compose );

// Connected
mongoose.connection.on( 'connected', function() {
    console.log( 'Connected to Compose.' );
} );

// Models
var Location = require( path.join( __dirname, 'models/location' ) );
var Route = require( path.join( __dirname, 'models/route' ) );

// Publish-subscribe
var pubnub = require( 'pubnub' ) ( {
    ssl: true,
    publish_key: configuration.publish,
    subscribe_key: configuration.subscribe
} );

// Subscribe
pubnub.subscribe( {
    channel: configuration.channel,
    callback: function( message ) {
        var location = new Location();

        location.accuracy = message.accuracy;
        location.altitude = message.altitude;
        location.bearing = message.bearing;
        location.createdAt = message.createdAt;
        location.latitude = message.latitude;
        location.longitude = message.longitude;
        location.speed = message.speed;
    
        location.save( function( error ) {
            if( error )
            {
                console.log( error );    
            }
        } );
    }
} );

// Web server
var app = express();

// Middleware
app.use( parser.json() );
app.use( parser.urlencoded( { 
	extended: false 
} ) );

// Static
app.use( '/', express.static( 'public' ) );

// Routes
app.use( '/api', require( './routes/location.js' ) );
app.use( '/api', require( './routes/route.js' ) );

// Listen
var port = ( process.env.VCAP_APP_PORT || 3000 );
app.listen( port );
console.log( 'Listening on: ' + port );

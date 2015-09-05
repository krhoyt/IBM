// Packages
var express = require( 'express' );
var mongoose = require( 'mongoose' );

// Model
// var Account = require( '../models/account' );

// Route
var router = express.Router();

// Handlers
router.get( '/tictactoe/off', function( req, res ) {
    var data = null;

    data = {
        d: {
            change: ''    
        }
    };
    
    for( var led = 1; led <= 9; led++ )
    {
        data.d.change = led + ',0,0,0';
        req.iot.publish( req.topic, JSON.stringify( data ), function() {
            console.log( data );
        } );        
    }
    
    res.send( 'Off' );
} );

router.put( '/tictactoe/:led/:rgb', function( req, res ) {
    var data = null;
    var topic = null;
    
    data = {
        d: {
            change: req.params.led + ',' + req.params.rgb
        }
    };
    
    req.iot.publish( req.topic, JSON.stringify( data ), function() {
        console.log( data );
    } );
    
    res.send( 'Change LED #' + req.params.led + ' to ' + req.params.rgb + '.' );
} );

// Export
module.exports = router;

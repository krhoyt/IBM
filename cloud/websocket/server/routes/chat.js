// Packages
var express = require( 'express' );
var fs = require( 'fs' );
var mongoose = require( 'mongoose' );
var path = require( 'path' );

// Model
var Chat = require( '../models/chat' );

// Route
var router = express.Router();

// Handlers
router.get( '/chat', function( req, res ) {
    Chat.find( {}, null, {sort: {createdAt: 1}}, function( error, data ) {                        
        res.json( data );    
    } );
} );

router.get( '/chat/:id', function( req, res ) {
    Chat.find( {
        client: 'chat_' + req.params.id
    }, function( error, data ) { 
        res.json( data );    
    } );
} );

router.post( '/chat', function( req, res ) {
    var chat = null;
    var now = null;
    
    now = Date.now();
    
    chat = new Chat();
    
    chat.blue = req.body.blue;
    chat.client = req.body.client;
    chat.createdAt = now;
    chat.css = 'rgb( ' + req.body.red + ', ' + req.body.green + ', ' + req.body.blue + ' )';
    chat.green = req.body.green;
    chat.message = req.body.message;
    chat.red = req.body.red;
    
    chat.save( function( error ) {
        if( error )
        {
            res.send( error );    
        }
        
        res.send( 'OK' );
    } );
} );

router.delete( '/chat', function( req, res ) {
    Chat.remove( function( error, result ) {        
        var data = null;
        
        data = JSON.parse( result );
        console.log( 'Reset: ' + data.n );    

        fs.readFile( path.join( __dirname, '..', 'santa-monica.txt' ), 'utf8', function( error, data ) {
            var blue = null;
            var chat = null;
            var client = null;
            var collection = null;            
            var color = null;
            var green = null;
            var high = null;
            var lines = null;    
            var parts = null;
            var red = null;
            
            lines = data.split( '\n' );
            collection = [];
            
            for( var d = 0; d < lines.length; d++ ) {
                if( lines[d].indexOf( '#' ) == 0 ) {
                    parts = lines[d].substring( 1 ).split( ',' );
                    
                    red = parseInt( parts[0] );
                    green = parseInt( parts[1] );
                    blue = parseInt( parts[2] );
                    color = 'rgb( ' + red + ', ' + green + ', ' + blue + ' )'

                    client = 'chat_' + Date.now();
                } else {
                    chat = new Chat();
                    
                    high = process.hrtime();
                    
                    chat.blue = blue;
                    chat.client = client;
                    chat.createdAt = high[0] * 1000000 + high[1] / 1000;
                    chat.css = color;
                    chat.green = green;
                    chat.message = lines[d];
                    chat.red = red;

                    collection.push( chat );
                }
            }
            
            Chat.create( collection, function( error ) { 
                res.send( 'OK' );                
            } );
        } );
    } );
} );

// Export
module.exports = router;

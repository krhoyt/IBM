var express = require( 'express' );
var mongoose = require( 'mongoose' );

// Model
var Route = require( '../models/route' );

// Route
var router = express.Router();

// Handlers
router.get( '/route', function( req, res ) {
    Route.find( {}, null, {sort: {createdAt: 1}}, function( error, data ) {                        
        res.json( data );    
    } );
} );

// Export
module.exports = router;

var express = require( 'express' );
var fs = require( 'fs' );
var mongoose = require( 'mongoose' );

// Model
var Location = require( '../models/location' );

// Route
var router = express.Router();

// Handlers
router.get( '/location', function( req, res ) {
    Location.find( {}, null, {sort: {createdAt: 1}}, function( error, data ) {                        
        res.json( data );    
    } );
} );

// Export
module.exports = router;

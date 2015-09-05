// Packages
var express = require( 'express' );
var mongoose = require( 'mongoose' );

// Model
var Account = require( '../models/account' );

// Route
var router = express.Router();

// Handlers
router.get( '/account', function( req, res ) {
    res.send( 'Get account.' );
} );

// Export
module.exports = router;

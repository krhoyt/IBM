// Packages
var express = require( 'express' );
var fs = require( 'fs' );
var mongoose = require( 'mongoose' );
var path = require( 'path' );
var ws = require( 'ws' );

// Model
var Photon = require( '../models/photon' );

// Route
var router = express.Router();

// Handlers
router.get( '/photon', function( req, res ) {
    Photon.find( {}, null, {sort: {createdAt: 1}}, function( error, data ) {                        
        res.json( data );    
    } );
} );

router.get( '/photon/:id', function( req, res ) {
    Photon.find( {
        _id: req.params.id
    }, function( error, data ) { 
        res.json( data[0] );    
    } );
} );

router.post( '/photon', function( req, res ) {
    var photon = null;

    photon = new Photon();
    
    photon.device = req.body.device;
    photon.reading = req.body.reading;
    photon.createdAt = new Date();
    
    photon.save( function( error ) {
        if( error )
        {
            res.send( error );    
        }
        
        for( var c = 0; c < req.clients.length; c++ ) {
            req.clients[c].send( JSON.stringify( photon ) );    
        }
        
        res.send( 'OK' );
    } );
} );

// Export
module.exports = router;

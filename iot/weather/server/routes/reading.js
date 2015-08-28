var express = require( 'express' );
var router = express.Router();

// Get all readings
// Get latest reading
// Get readings within a page
router.get( '/reading', function( req, res ) {
	var params = null;

	// Query parameters		
	params = {
		selector: {
			timestamp: {'$gt': 0}
		},
		sort: [
			{timestamp: 'desc'}
		]
	};
	
	// Support getting only latest reading
	// Also supports paging
	if( req.query.limit != undefined )
	{
		params.limit = parseInt( req.query.limit );	
	}
	
	// More support for paging
	// Arguments supplied via query string
	if( req.query.skip != undefined )
	{
		params.skip = parseInt( req.query.skip );	
	}		
	
	// Find using selector
	// Returns documents
	// Not the list function
	req.data.find( params, function( error, body ) {
		if( error )
		{
			req.logger.info( 'Problem reading documents.' );
			req.logger.info( 'Message: ' + error.message );												
		}
		
		res.json( body );
	} );
} );

// Get a specific reading by ID
router.get( '/reading/:id', function( req, res ) {
	req.data.get( req.params.id, function( error, body ) {
		if( error )
		{
			req.logger.info( 'Problem reading document.' );
			req.logger.info( 'Message: ' + error.message );												
		}
		
		res.json( body );			
	} );
} );

// Create a new reading
router.post( '/reading', function( req, res ) {
	req.data.insert( req.body, function( error, body ) {
		if( error )
		{
			req.logger.info( 'Problem creating document.' );
			req.logger.info( 'Message: ' + error.message );												
		}
		
		res.json( body );					
	} );	
} );

// Update an existing reading by ID
// Must include _id and _rev in body
// TODO: Assume latest revision branch
router.put( '/reading/:id', function( req, res ) {
	req.data.insert( req.body, function( error, body ) {
		if( error )
		{
			req.logger.info( 'Problem updating document.' );
			req.logger.info( 'Message: ' + error.message );																
		}	
		
		res.json( body );
	} );
} );

// Delete an existing reading by ID
// Must include rev on query string
// TODO: Assume latest revision branch
router.delete( '/reading/:id', function( req, res ) {
	req.data.destroy( req.params.id, req.query.rev, function( error, body ) {
		if( error )
		{
			req.logger.info( 'Problem destroying document.' );
			req.logger.info( 'Message: ' + error.message );																
		}	
		
		res.json( body );
	} );	
} );

module.exports = router;

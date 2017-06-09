var express = require( 'express' );
var request = require( 'request' );

// Router
var router = express.Router();

// Send message to Conversation
// Return found system entities
router.post( '/message', function( req, res ) {
  // Build URL
  var url = 
    'https://gateway.watsonplatform.net' +
    '/conversation/api/v1/workspaces/' +
    req.config.workspace +
    '/message?' +
    'version=2017-05-26';

  // Send message
  // Watson Conversation
  // https://www.ibm.com/watson/developercloud/doc/conversation/system-entities.html#sys-datetime
  request( {
    url: url,
    auth: {
      user: req.config.username,
      pass: req.config.password
    },
    method: 'POST',
    json: {
      input: {
        text: req.body.message
      }
    }
  }, function( err, body, response ) {
    res.json( response );
  } );  
} );

// Test
router.get( '/test', function( req, res ) {    
  res.json( {watson: 'Conversation.'} );
} );
  
// Export
module.exports = router;

var express = require( 'express' );
var request = require( 'request' );

// Route
var router = express.Router();

// Handlers
router.get( '/weather', function( req, res ) {
    var wx_user = 'fc122c45-f79d-4a48-ba7f-97b2f2737fa1';
    var wx_pass = 'R5M8VlUsrR';

    var url = 
        'http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer' + '/' +
        'reverseGeocode' + '?' +
        'location=' + req.query.longitude + ',' + req.query.latitude +
        '&f=json';    

    request( url, function( error, response, reverse ) {
        var data = JSON.parse( reverse );
        var city = data.address.City;
        
        url = 'https://' + wx_user + ':' + wx_pass + '@twcservice.mybluemix.net:443/api/weather/v2/observations/current?units=e&geocode=' + req.query.latitude + ',' + req.query.longitude + '&language=en-US';
        
        request( url, function( error, response, current ) {
            var data = JSON.parse( current );

            res.send( 'The weather in ' + city + ' is ' + data.observation.imperial.temp + ' degrees and ' + data.observation.phrase_32char.toLowerCase() + '.' );
        } );        

    } );    
} );

// Export
module.exports = router;

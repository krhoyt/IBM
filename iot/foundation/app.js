var cfenv = require( 'cfenv' );
var mosca = require( 'mosca' );
var path = require( 'path' );

var environment = cfenv.getAppEnv();

var server = new mosca.Server( {
	http: {
		port: environment.port,
		bundle: true,
		static: path.join( __dirname, 'public' )
	}
} );

server.on( 'ready', function() {
	console.log( 'Mosca at: ' + environment.url );
} );

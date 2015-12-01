var mongoose = require( 'mongoose' );

// Schema
var RouteSchema = new mongoose.Schema( {
    createdAt: Number,
    name: String
} );

// Export model
module.exports = mongoose.model( 'Route', RouteSchema );

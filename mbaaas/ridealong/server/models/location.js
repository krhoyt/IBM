var mongoose = require( 'mongoose' );

// Schema
var LocationSchema = new mongoose.Schema( {
    route: Number,
    bearing: Number,
    createdAt: Number,
    longitude: Number,
    latitude: Number,
    speed: Number,
    accuracy: Number,
    altitude: Number 
} );

// Export model
module.exports = mongoose.model( 'Location', LocationSchema );

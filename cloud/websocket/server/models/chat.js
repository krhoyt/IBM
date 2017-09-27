var mongoose = require( 'mongoose' );

var ChatSchema = new mongoose.Schema( {
    avatar: String,
    blue: Number,
    client: String,
    createdAt: Date,
    css: String,    
    green: Number,    
    latitude: Number,
    longitude: Number,
    message: String,
    red: Number
} );

module.exports = mongoose.model( 'Chat', ChatSchema );

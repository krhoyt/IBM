var mongoose = require( 'mongoose' );

var PhotonSchema = new mongoose.Schema( {
    device: String,
    reading: Number,
    createdAt: Date
} );

module.exports = mongoose.model( 'Photon', PhotonSchema );

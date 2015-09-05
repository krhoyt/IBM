var mongoose = require( 'mongoose' );

var AccountSchema = new mongoose.Schema( {
    createdAt: Date,
    uodatedAt: Date,
    objectId: String,
    company: String,
    email: String,
    firstName: String,
    lastName: String,
    password: String,
    phone: String,
    verified: Boolean
} );

module.exports = mongoose.model( 'Account', AccountSchema );

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({

}, {collection: 'User'});

mongoose.model('User', UserSchema);

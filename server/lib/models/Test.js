var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var name = 'Test';

mongoose.model(name, new Schema({
  a: String,
  b: String,
  c: String,
}, { collection: name }));

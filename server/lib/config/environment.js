var nconf = require('nconf');
var mongoose = require('mongoose');
/**
 * Load configuration
 */

nconf
	.argv()
	.env();


var development = true;

if (process.env.NODE_ENV && process.env.NODE_ENV == "production") {
	development = false;
}

nconf.overrides({
	development: development
});

nconf.file(development ? __dirname + '/development.json' : __dirname + '/production.json');

nconf.defaults({
	PORT: 3000,
	MONGO_URI: "mongodb://localhost/local",
	SESSION_SECRET: "the mean stack is a very mean stack :)",
	NODE_ENV: "development",
});

mongoose.connect(nconf.get('MONGODB_URI') || nconf.get('MONGO_URI'));

mongoose.set('debug', development);

require('../util/req-dir.js')(__dirname + '/../models');

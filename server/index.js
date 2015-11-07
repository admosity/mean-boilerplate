/**
 * Express requirements
 */
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var morgan = require('morgan');
var errorHandler = require('errorhandler');
var serveStatic = require('serve-static');
var favicon = require('serve-favicon');
var http = require('http');
var nconf = require('nconf');
var mongoose = require('mongoose');
var fs = require('fs');

// Define global constants
require('lib/global');


require('lib/config/environment');

var development = nconf.get('development');


http.ServerResponse.prototype.ok = function(data) {
  return this.json(data);
};
http.ServerResponse.prototype.error = function(status, message, meta) {
  return this.status(status).json({message: message, meta: meta});
};

/** Declare the express app */

var app = express();

if (development) {
	app.use(morgan('dev'));
	app.use(errorHandler());
}

if (process.env.DEBUG) {
	app.use(morgan('dev'));
	app.use(errorHandler());
}

// app.set('view engine', 'ejs');

/** Serve the public static assets before processing anything  */
app.use('/', serveStatic(__dirname + '/public', {'index': ['index.html']}));
app.use('/node_modules', serveStatic(__dirname + (development ? '/../node_modules' : '/node_modules')));
// app.use(favicon(__dirname + '/favicon.ico'));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: nconf.get('SESSION_SECRET') || 'yolo secret',
	store: new MongoStore({
		mongooseConnection: mongoose.connection
	})
}));
app.use(passport.initialize());
app.use(passport.session());

// Load models
// require('./models');


// Init auth
require('lib/passport');

// Load routes
app.use('/', require('lib/routes'));

// Serve admin angular index
// var adminIndex = require('fs').readFileSync(__dirname + "/public/index-admin.html");
// app.use('/admin*', function(req, res) {
//   res.set('Content-Type', 'text/html');
//   return res.send(adminIndex);
// });

// Serve angular index
var theIndex = fs.readFileSync(__dirname + "/public/index-user.html");
app.use('*', function(req, res) {
  res.set('Content-Type', 'text/html');
  if(!development) {

    return res.send(theIndex);
  } else {
    fs.readFile(__dirname + "/public/index-user.html", function (err, file) {
      return res.send(file);
    });
  }
});

var server = app.listen(process.env.PORT || 3000, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Server listening at http://%s:%s', host, port);
});

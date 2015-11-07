/**
 * Load up all controllers, directives, and services from directories named `controllers`, `directives`,
 * and `services` using webpack.
 */

var req = require.context('.', true, /^\.\/(controllers|directives|services|models)\/.*\.js$/);
req.keys().forEach(req);

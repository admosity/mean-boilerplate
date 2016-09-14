var router = require('express').Router();
var fs = require('fs');
var path = require('path');

var routes = require('./api');
loadRoutes(routes, router, '/api', []);

module.exports = router;

function loadRoutes(routes, router, pathAcc, middlewares) {
  pathAcc = pathAcc || '';
  if(typeof routes === 'object' && Object.keys(routes).length) {
    var param = null;
    var dirMiddleware = null;
    for (var path in routes) {
      if (routes.hasOwnProperty(path)) {
        if(path == '_middleware') {
          var dirPath = (pathAcc + '/' + path).replace(":", "_");
          dirMiddleware = require('lib/routes' + dirPath);
          middlewares.push(dirMiddleware);
          break;
        }
      }
    }
    for (var path in routes) {
      if (routes.hasOwnProperty(path)) {
        var originalPath = path;
        if(path == '_middleware') continue;
        // special handling for root, bind to `/`
        if(path == 'root') {
          path = '';
        }
        // convert directories with preceding underscore to colon for params
        if(path.charAt(0) == '_') {
          path = ':' + path.substring(1);
          param = [routes[originalPath], router, pathAcc + '/' + path, middlewares];
          continue;
        }
        loadRoutes(routes[originalPath], router, pathAcc + '/' + path, middlewares);
      }
    }
    if(param){
      loadRoutes.apply(null, param);
    }
    if(dirMiddleware){
      //Will always be last elem
      middlewares.pop();
    }
  } else {
    console.log('DEFINED ROUTE: ' + pathAcc, middlewares);
    router.use(pathAcc, middlewares, routes);
  }
}
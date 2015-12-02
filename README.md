
Overview
========

Simple webpack, mongodb, angular, express, jade (with injector), push build to heroku, Browsersync, nodemon, boilerplate with some assumptions.

Prerequisites
=============

On linux you may need to run:

`echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`

when developing if you get a `Error: watch ENOSPC` error.

Use heroku-push plugin for deploys:

`heroku plugins:install https://github.com/ddollar/heroku-push`

Install
=======

1. Install the [heroku toolbelt](https://toolbelt.heroku.com/)
1. Get node if you haven't already. [Highly recommend nvm](https://github.com/creationix/nvm)
1. Install gulp: `npm i -g gulp`
1. Install mongodb and make sure `mongod` is in your `PATH`

Local Build
===========

1. `make` - installs heroku build plugin and runs `npm install` (you only need to run `make` once in the beginning of the project)
1. `gulp`

This will build all the assets into a local `build` directory as well as fire up a server, mongo database listening on the default port using a created `database` directory. The server will be running behind [nodemon](https://github.com/remy/nodemon) which will detect changes to the server and automatically restart the server when necessary. The browser will also automatically refresh on js and css changes with the help of [Browsersync](http://www.browsersync.io/).

Heroku Interaction
==================

### Setting up heroku App

Run `make heroku` will give you a guided setup of an heroku app with addons that will work with this boilerplate.

### Deploying

Run `make deploy` will bundle and push your build to heroku. The first push will take some time as node modules are being installed onto the server. Most of the time if you don't have heavy assets it'll be seconds.

Server Development
==================

### API Development

The server is a simple express setup. The one development speed improvement is the way api routes are defined.

Starting from `server/lib/routes/api` the folder structure and files define the api routes with `api/` as the root of the api. The following rules define the api routes:

* folders prefixed with an `_` becomes the name of a express parameter in the path (e.g. `api/user/_id` -> `api/user/:id`)
* a special file named `root.js` takes on the root of whatever path defined (e.g. `api/user/_id/root.js` -> `api/user/:id/`)
* any other file named under a folder becomes a path on that route (e.g. `api/user/_id/login.js` -> `api/user/:id/login`) (probably not a good example)

*CAVEAT* - You have to define your express router as `var router = require('express').Router({ mergeParams: true });`, if you want to use params that were defined higher up in the chain.

*CAVEAT 2* - Not sure if this is a bug in express, but if you want to use params defined higher in the chain, you have to use the following method of route definition:

```javascript
// WORKS
router.route('/')
  .VERB(function (req, res, next) {
    var id = req.params.id;
    // Do your stuff...
  });

// FAILS
router.VERB('/', function (req, res, next) {

});

```

### lib Symlink

The `server/lib` folder is symlink'd into the node_modules directory for easy access from files. From your files you can access anything defined in `server/lib` as `lib/whatever/your/path/is` instead of `../../../whatever/your/path/is`. Slightly more convenient. Check `bin/npm-post-install` for more details of what is actually symlink'd. Different for local and heroku builds.

Client Development
==================

JS assets are built using webpack. The initial redefined entrypoints for the app are `client/js/user.js` and `client/js/admin.js`. These two apps are identical and follow a CommonJS setup.


```
├── assets                    // static assets
│   ├── fonts
│   │   └── humans.txt
│   └── images
│       └── humans.txt
├── css                       // sass files
│   ├── admin.scss
│   └── user.scss
├── index-admin.jade          // admin front end (unbound)
├── index-user.jade           // user front end (bound to `/`)
├── js                        // js files
│   ├── admin                 // admin app
│   │   ├── AngularApp.js     // angular
│   │   ├── controllers       
│   │   │   └── module.js
│   │   ├── directives
│   │   │   └── module.js
│   │   ├── load.js           // loads controllers, directives, models, services
│   │   ├── models
│   │   │   └── module.js
│   │   ├── services
│   │   │   └── module.js
│   │   ├── states
│   │   │   └── States.js
│   │   └── states.js         // ui.router states
│   ├── admin.js              // admin app entry point
│   ├── common
│   │   └── humans.txt
│   ├── user                  // follows admin app format
│   │   ├── AngularApp.js
│   │   ├── controllers
│   │   │   └── module.js
│   │   ├── directives
│   │   │   └── module.js
│   │   ├── load.js
│   │   ├── models
│   │   │   └── module.js
│   │   ├── services
│   │   │   └── module.js
│   │   ├── states
│   │   │   └── States.js
│   │   └── states.js
│   └── user.js
└── modules                   // jade assets that get build to `modules` directory
    ├── admin
    │   ├── partials
    │   │   └── header.jade
    │   └── views
    │       └── home.jade
    └── user
        ├── partials
        │   └── header.jade
        └── views
            └── home.jade
```

### Angular development

`ngAnnotate` has been included so controllers, services, directives, etc... can generally be defined as such without dependency injection:

```javascript
var module = require('./module');

module.controller('MyController', function ($scope, $state) {
  console.log('WORKS!');
});

```

#### ui.router states

Check `client/js/user/states/States.js` for an example state. Follows the general `ui.router` state definition, just abstracted out into its own file for better state separation.

### Webpack context require autoload

Using `require.context` files are automatically loaded from the `controllers`, `directives`, `models`, `services`, `states` directories. There isn't a need for an index file to include each file individually.


TODO
====

1. Testing frameworks

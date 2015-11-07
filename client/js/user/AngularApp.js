require('./load.js');
require('./states');

var app = angular.module('App', [
  'ui.router',
  'ngMaterial',
  'ngCookies',
  'App.controllers',
  'App.directives',
  'App.services',
  'App.models',
]);

app.config(function($urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider) {
  ////////////////////////
  // Default URL when route not found
  ////////////////////////
  $urlRouterProvider.otherwise('/');

  ////////////////////////
  // Settings for html5 mode
  ////////////////////////

  if(window.history && window.history.pushState) {
    $locationProvider.html5Mode({enabled: true, requireBase: false});
  }

  ////////////////////////
  // Don't worry about them trailing slashes
  ////////////////////////

  $urlMatcherFactoryProvider.strictMode(false);

})

.run(function($rootScope, $state) {
  ////////////////////////
  // Expose ui router $state
  ////////////////////////
  $rootScope.$state = $state;


  $rootScope.$on('$stateChangeSuccess',
  function(event, toState, toParams, fromState, fromParams){
    $('body').removeClass(fromState.name);
    $('body').addClass(toState.name);

  });
});

angular.element(document).ready(function() {
  angular.bootstrap(document,['App']);
});

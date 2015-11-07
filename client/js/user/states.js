
var module = require('./controllers/module');

/**
 * Loads states into the app
 * @param  {StateProvider} $stateProvider
 * @param  {Array} states         array of states
 * @return {void}
 */
function loadStates($stateProvider, states) {
  states.forEach(function(s) {
    $stateProvider.state(s.name, s.state);
  });
}

module.config(function($stateProvider) {
  /**
  * Define states here
  */
  var req = require.context('./states', true, /\.js$/);
  req.keys().forEach(function (k) {
    loadStates($stateProvider, req(k));
  });
});

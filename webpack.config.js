var webpack = require('webpack');
var path = require('path');

var AngularAnnotatePlugin = require('ng-annotate-webpack-plugin');

function resoveNodeModulePath(componentPath) {
  return path.join(__dirname, 'node_modules', componentPath);
}

/**
 * Resolves npm dependencies to their correct paths
 * @param  {Object} dest   object to append to
 * @param  {Array} source list of npm dependencies
 * @return {void}        nothing, modifies dest
 */
function resolveNpmDependencies(dest, source) {
  source.forEach(function(k) {
    dest[k] = require.resolve(k);
  });
}

module.exports = {
  // cache for faster builds
  cache: true,

  watch: true,
  entry: {
    user: path.join(__dirname, 'client/js/user.js'),
    admin: path.join(__dirname, 'client/js/admin.js'),
  },

  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'build/public/js'),
  },

  // create source maps
  devtool: 'source-map',

  module: {
    loaders: [

      // shimming for angular because it doesn't support commonjs
      // what a shame. (export window.angular when angular is requested)
      {
        test: /[\/]angular\.js$/,
        loader: 'exports?window.angular',
      },

    ],
    noParse: [
      /angular-ui/,
      /jquery/,
    ],
  },

  // look for these files
  resolve: {
    modulesDirectories: ['bower_components', 'node_modules'],
    extensions: ['', '.webpack.js', '.web.js', '.js'],

    // aliases for modules
    alias: resolveNpmDependencies({}, [
      'angular',
      'angular-ui-router',
    ]),
  },

  externals: {
    angular: 'angular',
    $: 'jQuery',
  },

  plugins: [

    // check the main field in bower.json of loaded package for the proper
    // file to load
    new webpack.ResolverPlugin([
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main']),
    ]),

    // // Export globals into all files
    // new webpack.ProvidePlugin({
    //   // '$': 'jquery',
    //   // jQuery: "jquery",
    //   // angular: 'angular',
    // }),
    // Keep the angular dependency format DRY
    new AngularAnnotatePlugin({
      add: true,
    }),
  ],

};

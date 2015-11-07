var fs = require('fs');
var jsRegex = /\.js$/;

/**
 * Returns a mapping of a directory one level deep and mapped required. Index is required first.
 * @param  {String} path directory to load from
 * @return {Array}
 */
module.exports = function (path) {
  var listing = fs.readdirSync(path);
  var files = [];
  listing.forEach(function (f) {
    if(jsRegex.test(f) && fs.lstatSync(path + '/' + f).isFile()) {
      files.push(path + '/' + f);
    }
  });

  return files.sort(function (a, b) {
    if(a === 'index.js') {
      return 1;
    }
    return a.localeCompare(b);
  }).map(require);
};

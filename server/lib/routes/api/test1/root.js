var mongoose = require('mongoose');
var router = require('express').Router({ mergeParams: true });
var Test = mongoose.model('Test');

router.get('/', function (req, res) {
  var stream = Test.find({}).lean().stream();

  res.set('Content-Type', 'text/plain');
  stream.on('data', function (testDoc) {
    res.write([testDoc.a, testDoc.b, testDoc.c].join(',') + '\n');
  }).on('close', function () {
    res.end();
  });
});

module.exports = router;

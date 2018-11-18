var mongoose = require('mongoose');
var router = require('express').Router({ mergeParams: true });
var Test = mongoose.model('Test');

router.get('/', function (req, res) {
  Test.find({}, function (err, docs) {
    var response = '';
    docs.forEach(function (d) {
      response += [d.a, d.b, d.c].join(',') + '\n';
    });
    res.set('Content-Type', 'text/plain');
    res.send(response);
  });
});

module.exports = router;

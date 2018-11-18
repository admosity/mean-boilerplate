var mongoose = require('mongoose');
var router = require('express').Router({ mergeParams: true });
var Test = mongoose.model('Test');

router.get('/', function (req, res) {
  res.send('hello world');
});

module.exports = router;

var mongoose = require('mongoose');
var router = require('express').Router({ mergeParams: true });
var Test = mongoose.model('Test');

router.get('/', function (req, res) {
  var docs = [];


  for (var i = 100000; i < 200000; i++) {
    docs.push({
      a: i,
      b: i % 2,
      c: i % 3,
    });
  }
  console.log('doc creation done');
  Test.create(docs, function () {
    console.log('done inserting');
  });
  return res.ok();
});

module.exports = router;

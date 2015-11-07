var mongoose = require('mongoose');
var router = require('express').Router({ mergeParams: true });
var User = mongoose.model('User');
var passport = require('passport');

router.post('/login', passport.authenticate('local'), function(req, res) {
  var user = req.user;
  return res.ok({
    _id: user._id,
    email: user.email,
  });
});

router.post('/logout', function(req, res) {
  if(!req.user) return res.ok();
  req.logout();
  return res.ok();
});

router.get('/', function(req, res) {
  if(!req.user) return res.error(403, false);
  return res.ok(req.user);
});

module.exports = router;

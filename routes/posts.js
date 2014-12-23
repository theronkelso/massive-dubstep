var express = require('express');
var router = express.Router();

/* GET posts listing. */
router.get('/', function(req, res) {
  res.send('respond with a post resource');
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.get('/event-list', function(req, res) {
	res.render('event-list', {isEventActive: 'active'});
});

router.get('/event-create', function(req, res) {
    res.render('event-create', {isEventActive: 'active'});
});

router.get('/event-edit', function(req, res) {
    res.render('event-edit', {isEventActive: 'active'});
});

router.get('/event-detail', function(req, res) {
    res.render('event-detail', {isEventActive: 'active'});
});

router.get('/talk-list', function(req, res) {
    res.render('talk-list', {isTalkActive: 'active'});
});

router.get('/talk-create', function(req, res) {
    res.render('talk-create', {isTalkActive: 'active'});
});

router.get('/talk-edit', function(req, res) {
    res.render('talk-edit', {isTalkActive: 'active'});
});

router.get('/talk-detail', function(req, res) {
    res.render('talk-detail', {isTalkActive: 'active'});
});

module.exports = router;

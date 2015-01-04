var express = require('express');
var router = express.Router();
var talks = require('../controller/talk')();

var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

module.exports = function(passport) {
    /* GET home page. */
    router.get('/', function(req, res) {
        res.render('index', {
            user: req.user,
            message: req.flash('message')
        });
    });

    router.post('/login', passport.authenticate('login', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));

    router.get('/signup', function(req, res) {
        res.render('register', {message: req.flash('message')});
    });

    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/event-list', isAuthenticated, function(req, res) {
        res.render('event-list', {
            user: req.user,
            isEventActive: 'active'
        });
    });

    router.get('/event-create', isAuthenticated, function(req, res) {
        res.render('event-create', {
            user: req.user,
            isEventActive: 'active'
        });
    });

    router.get('/event-edit', isAuthenticated, function(req, res) {
        res.render('event-edit', {
            user: req.user,
            isEventActive: 'active'
        });
    });

    router.get('/event-detail', isAuthenticated, function(req, res) {
        res.render('event-detail', {
            user: req.user,
            isEventActive: 'active'
        });
    });

    router.get('/talk-list', isAuthenticated, function(req, res) {
        talks.list(function(err, talks) {
            if (err) {
                res.render('error', {
                    error: err
                });
            } else {
                res.render('talk-list', {
                    user: req.user,
                    isTalkActive: 'active',
                    talks: talks
                });
            }
        });
    });

    router.get('/talk-create', isAuthenticated, function(req, res) {
        res.render('talk-create', {
            user: req.user,
            isTalkActive: 'active'
        });
    });

    router.get('/talk-edit/:id', isAuthenticated, function(req, res) {
        var id = req.params.id;
        talks.get(id, function(err, talk) {
            if (err) {
                res.render('error', {
                    error: err
                });
            } else {
                res.render('talk-edit', {
                    user: req.user,
                    isTalkActive: 'active',
                    talk: talk
                });
            }
        });
    });

    router.get('/talk-detail/:id', isAuthenticated, function(req, res) {
        var id = req.params.id;
        talks.get(id, function(err, talk) {
            if (err) {
                res.render('error', {
                    error: err
                });
            } else {
                res.render('talk-detail', {
                    user: req.user,
                    isTalkActive: 'active',
                    talk: talk
                });
            }
        });
    });

    return router;
}

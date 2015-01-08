var express = require('express');
var router = express.Router();
var events = require('../controller/event')();
var talks = require('../controller/talk')();

var formatDate = function(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    var hour = date.getHours() % 12;
    hour = hour == 0 ? hour + 12 : hour;
    var minute = date.getMinutes();
    var period = date.getHours() > 11 ? 'PM' : 'AM';
    return month + '/' + day + '/' + year + ' ' + hour + ':' + minute + ' ' + period;
}

var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

var eventToObject = function(model) {
    var obj = {};
    obj.id = model._id;
    obj.name = model.name;
    obj.startDate = formatDate(model.startDate);
    obj.endDate = formatDate(model.endDate);
    obj.location = model.location;
    obj.description = model.description;
    return obj;
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
        events.list(function(err, events) {
            if (err) {
                res.render('error', {
                    error: err
                });
            } else {
                res.render('event-list', {
                    user: req.user,
                    isEventActive: 'active',
                    events: events
                });
            }
        });
    });

    router.get('/event-create', isAuthenticated, function(req, res) {
        res.render('event-create', {
            user: req.user,
            isEventActive: 'active'
        });
    });

    router.post('/event-new', function(req, res) {
        events.new({
            name: req.body.eventName,
            startDate: req.body.eventStartDate,
            endDate: req.body.eventEndDate,
            location: req.body.eventLocation,
            description: req.body.eventDescription
        });
        res.redirect('/event-list');
    });

    router.get('/event-edit/:id', isAuthenticated, function(req, res) {
        var id = req.params.id;
        events.get(id, function(err, event) {
            if (err) {
                res.render('error', {
                    error: err
                });
            } else {
                event = eventToObject(event);
                res.render('event-edit', {
                    user: req.user,
                    isEventActive: 'active',
                    event: event
                });
            }
        });
    });

    router.post('/event-update', function(req, res) {
        events.update({
            id: req.body.eventId,
            name: req.body.eventName,
            startDate: req.body.eventStartDate,
            endDate: req.body.eventEndDate,
            location: req.body.eventLocation,
            description: req.body.eventDescription
        });
        res.redirect('/event-list');
    });

    router.get('/event-detail/:id', isAuthenticated, function(req, res) {
        var id = req.params.id;
        events.get(id, function(err, event) {
            if (err) {
                res.render('error', {
                    error: err
                });
            } else {
                event = eventToObject(event);
                res.render('event-detail', {
                    user: req.user,
                    isEventActive: 'active',
                    event: event
                });
            }
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

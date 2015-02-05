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
    if (model._id) obj.id = model._id.toString();
    if (model.name) obj.name = model.name;
    if (model.website) obj.website = model.website;
    if (model.startDate) obj.startDate = formatDate(model.startDate);
    if (model.endDate) obj.endDate = formatDate(model.endDate);
    if (model.location) obj.location = model.location;
    if (model.description) obj.description = model.description;
    if (model.owner) obj.owner = userToObject(model.owner);
    return obj;
}

var talkToObject = function(model) {
    var obj = {};
    if (model._id) obj.id = model._id.toString();
    if (model.name) obj.name = model.name;
    if (model.description) obj.description = model.description;
    if (model.event) obj.event = eventToObject(model.event);
    if (model.owner) obj.owner = userToObject(model.owner);
    return obj;
}

var userToObject = function(model) {
    var obj = {};
    if (model._id) obj.id = model._id.toString();
    if (model.email) obj.email = model.email;
    if (model.name) obj.name = model.name;
    return obj;
}

var setEventIsDeleteableAndUpdatable = function(event, userLogged) {
    if (event.owner == userLogged._id.toString()) {
        event.isDeleteable = true;
        event.isUpdatable = true;
    } else {
        event.isDeleteable = false;
        event.isUpdatable = false;
    }
}

var setTalkIsDeleteableAndUpdatable = function(talk, userLogged) {
    if (talk.owner == userLogged._id.toString()) {
        talk.isDeleteable = true;
        talk.isUpdatable = true;
    } else if (talk.event.owner == userLogged._id.toString()) {
        talk.isDeleteable = true;
        talk.isUpdatable = false;
    } else {
        talk.isDeleteable = false;
        talk.isUpdatable = false;
    }
}

module.exports = function(passport) {
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

    router.get('/events', isAuthenticated, function(req, res) {
        events.list(function(err, events) {
            if (err) {
                res.render('error', {
                    error: err
                });
            } else {
                var userLogged = req.user;
                events.forEach(function(event) {
                    setEventIsDeleteableAndUpdatable(event, userLogged);
                });
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
            website: req.body.eventWebsite,
            startDate: req.body.eventStartDate,
            endDate: req.body.eventEndDate,
            location: req.body.eventLocation,
            description: req.body.eventDescription
        }, req.user);
        res.redirect('/events');
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
            website: req.body.eventWebsite,
            startDate: req.body.eventStartDate,
            endDate: req.body.eventEndDate,
            location: req.body.eventLocation,
            description: req.body.eventDescription
        }, req.user);
        res.redirect('/events');
    });

    router.get('/event-detail/:id', isAuthenticated, function(req, res) {
        var id = req.params.id;
        events.get(id, function(err, event) {
            if (err) {
                res.render('error', {
                    error: err
                });
            } else {
                talks.list({event: event}, function(err, talks) {
                    talks.forEach(function(talk) {
                       setTalkIsDeleteableAndUpdatable(talk, req.user);
                    });
                    event = eventToObject(event);
                    res.render('event-detail', {
                        user: req.user,
                        isEventActive: 'active',
                        event: event,
                        talks: talks
                    });
                });
            }
        });
    });

    router.get('/event-delete/:id', isAuthenticated, function(req, res) {
        events.delete(req.params.id, req.user, function(err) {
            if(err) {
                res.render('error', {
                    error: err
                });
            } else {
                res.redirect('/events');
            }
        });
    });

    router.get('/talks', isAuthenticated, function(req, res) {
        talks.list({}, function(err, talks) {
            if (err) {
                res.render('error', {
                    error: err
                });
            } else {
                var userLogged = req.user;
                talks.forEach(function(talk) {
                    setTalkIsDeleteableAndUpdatable(talk, userLogged);
                });
                res.render('talk-list', {
                    user: req.user,
                    isTalkActive: 'active',
                    talks: talks
                });
            }
        });
    });

    router.get('/talk-create/:eventId', isAuthenticated, function(req, res) {
        var eventId = req.params.eventId;
        events.get(eventId, function(err, event) {
            event = eventToObject(event);
            res.render('talk-create', {
                user: req.user,
                isTalkActive: 'active',
                event: event
            });
        });
    });

    router.post('/talk-new', isAuthenticated, function(req, res) {
        talks.new({
            name: req.body.talkName,
            description: req.body.talkDescription,
            event: req.body.talkEvent
        }, req.user);
        res.redirect('/event-detail/' + req.body.talkEvent);
    });

    router.get('/talk-edit/:id', isAuthenticated, function(req, res) {
        var id = req.params.id;
        talks.get(id, function(err, talk) {
            if (err) {
                res.render('error', {
                    error: err
                });
            } else {
                events.list(function(err, events) {
                    var eventObjs = [];
                    events.forEach(function(event) {
                        eventObjs.push(eventToObject(event));
                    });
                    talk = talkToObject(talk);
                    if (err) {
                        res.render('error', {
                            error: err
                        });
                    } else {
                        res.render('talk-edit', {
                            user: req.user,
                            isTalkActive: 'active',
                            talk: talk,
                            events: eventObjs
                        });
                    }
                });
            }
        });
    });

    router.post('/talk-update', function(req, res) {
        talks.update({
            id: req.body.talkId,
            name: req.body.talkName,
            description: req.body.talkDescription,
            event: req.body.talkEvent
        }, req.user);
        res.redirect('/event-detail/' + req.body.talkEvent);
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

    router.get('/talk-delete/:id', isAuthenticated, function(req, res) {
        talks.delete(req.params.id, req.user, function(err, eventId) {
            if(err) {
                res.render('error', {
                    error: err
                });
            } else {
                res.redirect('/event-detail/' + eventId);
            }
        });
    });

    return router;
}

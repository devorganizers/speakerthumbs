var express = require('express');
var router = express.Router();
var sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
var events = require('../controller/event')();
var talks = require('../controller/talk')();
var User = require('../models/user');

var host = process.env.AZK_HOST || process.env.HOST;
var port = process.env.HTTP_PORT || process.env.PORT;

var hostname = "http://" + host;
if (!process.env.AZK_HOST) {
  hostname = hostname + ":" + port;
}

var formatDate = function(date) {
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    var hour = date.getHours() % 12;
    hour = hour === 0 ? hour + 12 : hour;
    var minute = date.getMinutes();
    var period = date.getHours() > 11 ? 'PM' : 'AM';
    return month + '/' + day + '/' + year + ' ' + hour + ':' + minute + ' ' + period;
};

var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};

var eventToObject = function(model) {
    var obj = {};
    if (model._id) obj.id = model._id.toString();
    if (model.name) obj.name = model.name;
    if (model.website) obj.website = model.website;
    if (model.startDate) obj.startDate = formatDate(model.startDate);
    if (model.endDate) obj.endDate = formatDate(model.endDate);
    if (model.location) obj.location = model.location;
    if (model.description) obj.description = model.description;
    if (model.isTalkOpen) obj.isTalkOpen = model.isTalkOpen;
    if (model.owner) obj.owner = userToObject(model.owner);
    return obj;
};

var talkToObject = function(model) {
    var obj = {};
    if (model._id) obj.id = model._id.toString();
    if (model.name) obj.name = model.name;
    if (model.description) obj.description = model.description;
    if (model.event) obj.event = eventToObject(model.event);
    if (model.owner) obj.owner = userToObject(model.owner);
    return obj;
};

var userToObject = function(model) {
    var obj = {};
    if (model._id) obj.id = model._id.toString();
    if (model.email) obj.email = model.email;
    if (model.name) obj.name = model.name;
    return obj;
};

var setEventIsDeleteableAndUpdatable = function(event, userLogged) {
    if (event.owner == userLogged._id.toString()) {
        event.isDeleteable = true;
        event.isUpdatable = true;
    } else {
        event.isDeleteable = false;
        event.isUpdatable = false;
    }
};

var setTalkIsDeleteableAndUpdatable = function(talk, userLogged) {
    if (talk.owner._id.toString() == userLogged._id.toString()) {
        talk.isDeleteable = true;
        talk.isUpdatable = true;
    } else if (talk.event.owner == userLogged._id.toString()) {
        talk.isDeleteable = true;
        talk.isUpdatable = false;
    } else {
        talk.isDeleteable = false;
        talk.isUpdatable = false;
    }
};

module.exports = function(passport) {
    router.get('/', function(req, res) {
        res.render('index', {
            user: req.user,
            message: req.flash('message'),
            csrfToken: req.csrfToken()
        });
    });

    router.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));

    router.get('/signup', function(req, res) {
        res.render('signup', { 
            message: req.flash('message'),
            csrfToken: req.csrfToken()
        });
    });

    router.post('/signup', function(req, res) {
        var user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.socialOauthIds[req.body.socialNetwork] = req.body.socialLoginOauthId;
        User.register(user, req.body.password, function(err, user) {
            if (err) {
                return res.render('signup', {
                    message: 'Sorry. That email already exists. Try again.',
                    socialNetwork: req.body.socialNetwork,
                    socialLoginOauthId: req.body.socialLoginOauthId,
                    csrfToken: req.csrfToken()
                });
            }

            //send email verification
            var authenticationURL = hostname + '/verify?authToken=' + user.authToken;
            sendgrid.send({
                to:       user.email,
                from:     'emailauth@yourdomain.com',
                subject:  'Confirm your email',
                html:     '<a target=_blank href=\"' + authenticationURL + '\">Confirm your email</a>'
            }, function(err, json) {
                if (err) { return console.error(err); }

                res.redirect('/email-verification');
            });
        });
    });

    router.post('/connect-account', function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                res.render('signup', {
                    message: 'invalid email or password',
                    socialNetwork: req.body.socialNetwork,
                    socialLoginOauthId: req.body.socialLoginOauthId,
                    csrfToken: req.csrfToken()

                });
            } else {
                user.socialOauthIds[req.body.socialNetwork] = req.body.socialLoginOauthId;
                user.save(function(err) {
                    if (err) {
                        next(err);
                    } else {
                        res.redirect('/');
                    }
                });
            }
        })(req, res, next);
    });

    router.get('/email-verification', function(req, res) {
        res.render('email-verification', {
            title: 'Email verification sent!',
            csrfToken: req.csrfToken()
        });
    });

    router.get('/verify', function(req, res) {
        User.verifyEmail(req.query.authToken, function(err, existingAuthToken) {
            if(err) console.log('err:', err);

            res.render('email-verification', {
                title : 'Email verified succesfully!',
                csrfToken: req.csrfToken()
            });
        });
    });

    router.get('/auth/facebook', passport.authenticate('facebook'));

    router.get('/auth/facebook/callback', function(req, res, next) {
        socialCallback(req, res, next, 'facebook');
    });

    router.get('/auth/twitter', passport.authenticate('twitter'));

    router.get('/auth/twitter/callback', function(req, res, next) {
        socialCallback(req, res, next, 'twitter');
    });

    router.get('/auth/github', passport.authenticate('github'));

    router.get('/auth/github/callback', function(req, res, next) {
        socialCallback(req, res, next, 'github');    
    });

    router.get('/auth/google', passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true
    }));

    router.get('/auth/google/callback', function(req, res, next) {
        socialCallback(req, res, next, 'google');    
    });

    function socialCallback(req, res, next, socialNetwork) {
        passport.authenticate(socialNetwork, function(err, user, profile) {
            if (err) { return next(err); }
            if (!user) { 
                res.render('signup', {
                    socialNetwork: socialNetwork,
                    socialLoginOauthId: profile.id,
                    csrfToken: req.csrfToken()
                });
            } else {
                req.login(user, function(err) {
                    if (err) { return next(err); }
                    return res.redirect('/');
                });
            }
        })(req, res, next, socialNetwork);
    } 

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
            isEventActive: 'active',
            csrfToken: req.csrfToken()
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
                    event: event,
                    csrfToken: req.csrfToken()
                });
            }
        });
    });

    router.post('/event-update', function(req, res) {
      var isTalkOpen = true;
      if(!req.body.isTalkOpen) isTalkOpen = false;
        events.update({
            id: req.body.eventId,
            name: req.body.eventName,
            website: req.body.eventWebsite,
            startDate: req.body.eventStartDate,
            endDate: req.body.eventEndDate,
            location: req.body.eventLocation,
            description: req.body.eventDescription,
            isTalkOpen: isTalkOpen
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
                    var userLogged = req.user;
                    talks.forEach(function(talk) {
                       setTalkIsDeleteableAndUpdatable(talk, userLogged);
                    });
                    setEventIsDeleteableAndUpdatable(event, userLogged);
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
    
    router.get('/event-talks-close/:id', isAuthenticated, function(req, res) {
      events.findOneAndUpdate(req.params.id, { isTalkOpen: false }, true, function(err, doc) {
          if(err) {
              res.render('error', {
                  error: err
              });
          } else {
            res.redirect('/event-detail/' + req.params.id);
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
                event: event,
                csrfToken: req.csrfToken()
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
                            events: eventObjs,
                            csrfToken: req.csrfToken()
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
};

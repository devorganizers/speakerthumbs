var config = require('./auth');
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');

module.exports = function(passport) {
    passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL
    }, function(accessToken, refreshToken, profile, done) {
        User.findOne({oauthId: profile.id}, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                var newUser = new User();
                newUser.name = profile.displayName;
                newUser.oauthId = profile.id;
                newUser.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        return done(null, newUser);
                    }
                });
            } else {
                return done(null, user);
            }
        })
    }));
}

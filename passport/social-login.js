var config = require('./auth');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GithubStrategy = require('passport-github').Strategy;
var User = require('../models/user');

var findOrCreateNewUser = function(accessToken, refreshToken, profile, done) {
    User.findOne({oauthId: profile.id}, function(err, user) {
        if (err) {
            done(err);
        } else if (!user) {
            var newUser = new User();
            newUser.name = profile.displayName;
            newUser.oauthId = profile.id;
            newUser.save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    done(null, newUser);
                }
            });
        } else {
            done(null, user);
        }
    });
}

module.exports = function(passport) {
    passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL
    }, findOrCreateNewUser));

    passport.use(new TwitterStrategy({
        consumerKey: config.twitter.consumerKey,
        consumerSecret: config.twitter.consumerSecret,
        callbackURL: config.twitter.callbackURL
    }, findOrCreateNewUser));

    passport.use(new GithubStrategy({
        clientID: config.github.clientID,
        clientSecret: config.github.clientSecret,
        callbackURL: config.github.callbackURL
    }, findOrCreateNewUser));
}

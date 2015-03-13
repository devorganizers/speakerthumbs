var config = require('./auth');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GithubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/user');

var findOrCreateNewUser = function(accessToken, refreshToken, profile, done) {
    User.findOne({ $or:[ {'socialOauthIds.twitter':profile.id}, 
                    {'socialOauthIds.github':profile.id}, 
                    {'socialOauthIds.facebook':profile.id},
                    {'socialOauthIds.google':profile.id}]}, function(err, user) {
        if (err) {
            done(err);
        } else if (!user) {
            done(null, null, profile);
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

    passport.use(new GoogleStrategy({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL
    }, findOrCreateNewUser));
}

var login = require('./login');
var signup = require('./signup');
var socialLogin = require('./social-login');
var User = require('../models/user');

module.exports = function(passport) {    
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    login(passport);
    signup(passport);
    socialLogin(passport);
}
var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
    email: String,
    password: String,
    name: String,
    socialOauthIds: {
    	github: String,
    	google: String,
    	facebook: String,
    	twitter: String
    }
});

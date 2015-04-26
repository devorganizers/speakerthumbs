var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	passportLocalMongooseEmail = require('passport-local-mongoose-email');

var User = new Schema({
    name: String,
    socialOauthIds: {
    	github: String,
    	google: String,
    	facebook: String,
    	twitter: String
    }
});

User.plugin(passportLocalMongooseEmail, {
	usernameField: "email"
});

module.exports = mongoose.model('User', User);
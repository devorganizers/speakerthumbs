var port = process.env.HTTP_PORT || process.env.PORT;
var host = process.env.AZK_HOST || process.env.HOST;

var hostname = "http://" + host;
if (!process.env.AZK_HOST) {
  hostname = hostname + ":" + port;
}

var ids = {
    facebook: {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: hostname + '/auth/facebook/callback'
    },
    twitter: {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: hostname + '/auth/twitter/callback'
    },
    github: {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: hostname + '/auth/github/callback'
    },
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: hostname + '/auth/google/callback'
    }
};

module.exports = ids;
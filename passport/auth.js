var ids = {
    facebook: {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: 'http://' + process.env.HOST + ':' + process.env.PORT + '/auth/facebook/callback'
    },
    twitter: {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: 'http://' + process.env.HOST + ':' + process.env.PORT + '/auth/twitter/callback'
    },
    github: {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'http://' + process.env.HOST + ':' + process.env.PORT + '/auth/github/callback'
    },
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://' + process.env.HOST + ':' + process.env.PORT + '/auth/google/callback'
    }
}

module.exports = ids
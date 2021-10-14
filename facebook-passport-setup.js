const passport = require('passport')
const facebookStrategy = require('passport-facebook').Strategy

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new facebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']

    }, // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
        // console.log(profile)
        return done(null, profile)


    }
))
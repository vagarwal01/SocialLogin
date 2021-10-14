require('dotenv').config()

// DATABASE CONNECTION
const connection = require('./model')


// ROUTES CONTROLLERS
const educatorController = require('./controllers/educators')
const studentController = require('./controllers/students')
const adminController = require('./controllers/admin')


// BASIC
const express = require("express"),
    path = require('path'),
    bodyparser = require('body-parser'),
    app = express();
// Setting up environment
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
// app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }))
global.__basedir = __dirname;


// SOCIAL LOGINS
const passport = require('passport')
require('./google-passport-setup')
require('./facebook-passport-setup')
const cookieSession = require('cookie-session')
app.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
}));
// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());
const { createConnection } = require("net");
// Auth middleware that checks if the user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login-signup');
}
app.get('/sociologin/:type/:usertype', (req, res) => {
        console.log(req.params.usertype)
        req.session.usertype = req.params.usertype
        if (req.params.type == 'facebook')
            res.redirect('/facebook')
        else
            res.redirect('/google')
    })
    // GOOGLE login
app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
app.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/login-signup'
}));
// FACEBOOK login
app.get('/facebook', passport.authenticate('facebook', { scope: 'email' }))
app.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/login-signup'
}));



app.get('/', (req, res) => res.render('index'))


app.get('/login-signup/:type', (req, res) => {
    console.log(req.params.type)
    if (req.params.type != 'educator' && req.params.type != 'student') {
        res.status(404).send('not found')
    } else {
        if (req.session.email)
            res.send('dashboard home')
        else {
            req.logout();
            req.session.name = ''
            req.session.courseId = ''
            res.render('signin-signup', { type: req.params.type })
        }
    }
})

// ROUTES
app.use('/be-an-educator', educatorController)

app.get('/profile', isLoggedIn, function(req, res) {
    console.log('session ====' + req.session.usertype)
    if (req.session.usertype == 'educator')
        res.redirect('/be-an-educator/social-login')
    else if (req.session.usertype == 'student')
        res.send('student login')
    else
        res.send('error')
});





// LOGOUT
app.get('/logout', function(req, res) {
    req.logout();
    req.session.admin = ''
    req.session.email = ''
    req.session.name = ''
    req.session.courseId = ''
    res.redirect('/');
});


// 404 Error
app.use((req, res) => {
    res.status(404).send('not found')
})

// MIDDLEWARE
app.listen(process.env.PORT || 5000, () => {
    console.log(`App Started on PORT ${process.env.PORT || 5000}`);
});
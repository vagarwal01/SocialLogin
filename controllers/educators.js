const { response } = require('express');
const express = require('express'),
    mongoose = require('mongoose');
const router = express.Router();
var ObjectId = require("mongodb").ObjectID

const educatorModel = mongoose.model('educators')


// EDUCATOR HOME
router.get('/', (req, res) => {
    res.render('be-an-educator')
})

// LOGIN
router.get('/social-login', (req, res) => {
    console.log('called social login')

    let email = req.user ? req.user.emails[0].value : '';
    console.log(email)
    educatorModel.findOne({ 'educatorEmail': email }, (err, user) => {
        if (err) {
            res.send(err)
        }
        if (user) {
            console.log("user found")
            console.log(user)
            req.session.email = user.educatorEmail
            req.session.name = user.educatorName
            if (user.proComp && user.proComp == 'Y')
                res.send('educator dashboard')
            else {
                eduDetails = { 'email': req.session.email, 'name': req.session.name, }
                res.send('profile complete page')
            }
            if (user.isActivated == false) {
                var newVal = { $set: { isActivated: true, isVerified: 0 } }
                educatorModel.updateOne({ 'educatorEmail': email }, newVal, (err, user) => {
                    if (err) res.send(err)
                    else {
                        if (user.proComp && user.proComp == 'Y')
                            res.send('educator dashboard')
                        else {
                            eduDetails = { 'email': req.session.email, 'name': req.session.name, }
                            res.send('profile complete page')
                        }
                    }
                })
            } else {
                if (user.proComp && user.proComp == 'Y')
                    res.send('educator dashboard')
                else {
                    eduDetails = { 'email': req.session.email, 'name': req.session.name, }
                    res.send('profile complete page')
                }
            }
        } else {
            console.log('not registered')
            var newEducator = new educatorModel()
            console.log(req.user)
            newEducator.educatorName = req.user.displayName
            newEducator.educatorEmail = req.user.emails[0].value
            newEducator.isVerified = 0
            newEducator.isActivated = true
            newEducator.regDate = new Date()
            newEducator.save((err, doc) => {
                if (err) {
                    console.log(err)
                    res.send(err)
                } else {
                    console.log(doc)
                    console.log(doc.educatorName)
                    req.session.email = doc.educatorEmail
                    req.session.name = doc.educatorName
                    console.log('setting get')
                    eduDetails = { 'email': req.session.email, 'name': req.session.name, }
                    res.send('profile complete page')
                }
            });
        }
    });
})

router.post('/login', (req, res) => {
    console.log(req.body)
    console.log(req.body.eduEmail)
    console.log(req.body.eduPwd)
    if (req.body.eduEmail == 'admin') {
        if (req.body.eduPwd == 'admin@*2021') {
            req.session.admin = 'Y'
            res.send('adminSuccess')
        } else {
            res.send('Admin Password does not match')
        }
    } else {
        educatorModel.findOne({ 'educatorEmail': req.body.eduEmail }, (err, user) => {
            if (err) {
                res.send('An unexpected error occured')
            }
            if (user) {
                console.log("user found")
                if (user.educatorPassword == req.body.eduPwd) {
                    req.session.email = user.educatorEmail
                    req.session.name = user.educatorName
                    if (user.proComp && user.proComp == 'Y')
                        res.send('success')
                    else {
                        res.send('profile')
                    }
                } else {
                    res.send('Incorrect Password')
                }

                if (!user.isActivated) {
                    console.log('not registered')
                    res.send('This email is not yet registered.')
                } else if (user.isActivated == false) {
                    console.log('not registered')
                    res.send('This email is not yet registered.')
                } else {
                    if (user.educatorPassword == req.body.eduPwd) {
                        req.session.email = user.educatorEmail
                        req.session.name = user.educatorName
                        if (user.proComp && user.proComp == 'Y')
                            res.send('success')
                        else {
                            res.send('profile')
                        }
                    } else {
                        res.send('Incorrect Password')
                    }
                }
            } else {
                console.log('not registered')
                res.send('This email is not yet registered.')
            }
        });
    }
})

// SIGNUP
router.post('/signup', uploadTV.single("tryfile"), (req, res) => {
    console.log('called signup')
    console.log(req.body)
    educatorModel.findOne({ 'educatorEmail': req.body.eduEmail }, (err, user) => {
        if (err) {
            res.send(err)
        }
        if (user) {
            res.send('This email is already registered.')
            if (user.isActivated == true) {
                console.log("user found")
                console.log(user)
                res.send('This email is already registered.')
            } else {
                var newVal = { $set: { educatorName: req.body.eduName, educatorPassword: req.body.eduPwd, regDate: new Date() } }
                educatorModel.updateOne({ 'educatorEmail': req.body.eduEmail }, newVal, (err, user1) => {
                    if (err) {
                        console.log(err)
                        res.send(err)
                    } else {
                        var key = user._id
                        key = key.toString()
                        var text = `Hello ${req.body.eduName},<br><br>
                        Please click on the given link to verify your email for activating your account. The link is valid for one day only.<br><br>
                        http://localhost:8000/be-an-educator/verifyemail/key/${key}<br><br>
                        Thank You`
                        sendMail(req.body.eduEmail, 'Email Verification for the Account', text, res, 'imm')
                    }
                })
            }
        } else {
            console.log('not registered')
            var newEducator = new educatorModel()
            newEducator.educatorName = req.body.eduName
            newEducator.educatorEmail = req.body.eduEmail
            newEducator.educatorPassword = req.body.eduPwd
            newEducator.isActivated = true
                // newEducator.isActivated = false
            newEducator.regDate = new Date()
            newEducator.save((err, doc) => {
                if (err) {
                    console.log(err)
                    res.send(err)
                } else {
                    console.log(doc)
                    var key = doc._id
                    key = key.toString()
                    var text = `Hello ${req.body.eduName},<br><br>
                    Please click on the given link to verify your email for activating your account. The link is valid for one day only.<br><br>
                    http://localhost:8000/be-an-educator/verifyemail/key/${key}<br><br>
                    Thank You`
                    sendMail(req.body.eduEmail, 'Email Verification for the Account', text, res, 'imm')
                }
            });
        }
    });
})
router.get('/verifyemail/key/:uid', (req, res) => {
    educatorModel.findOne({ '_id': ObjectId(req.params.uid) }, (err, doc) => {
        if (err) console.log(err)
        else {
            console.log(doc)
            const oneday = 60 * 60 * 24 * 1000
            console.log((new Date() - doc.regDate) > oneday)
            if ((new Date() - doc.regDate) > oneday) {
                res.send('This link is expired !!')
            } else {
                var newVal = { $set: { isActivated: true, isVerified: 0 } }
                educatorModel.updateOne({ '_id': ObjectId(req.params.uid) }, newVal, (err, user) => {
                    if (err) res.send('Something went wrong. Please try again later.')
                    else {
                        req.session.email = doc.educatorEmail
                        req.session.name = doc.educatorName
                        res.send('success')
                    }
                })
            }
        }
    })
})

router.post('/fogot-pwd', uploadTV.single("tryfile"), (req, res) => {
    console.log(req.body)
    educatorModel.findOne({ 'educatorEmail': req.body.eduFPEmail }, (err, user) => {
        if (err) {
            res.send(err)
        }
        if (user && user.isActivated == true) {
            console.log("user found")
            console.log(user)
            var newVal = { $set: { educatorPassword: req.body.eduFPPwd } }
            educatorModel.updateOne({ 'educatorEmail': req.body.eduFPEmail }, newVal, (err, user1) => {
                if (err)
                    console.log(err)
                else {
                    if (!user1 || user1['ok'] == 0) {
                        res.send('Something went wrong. Please try after some time.')
                    } else {
                        req.session.email = req.body.eduFPEmail
                        req.session.name = user.educatorName
                        res.send('success')
                    }
                }
            })
        } else {
            console.log('not registered')
            res.send('This email is not registered.')
        }
    });
})

function sendMail(to, subject, text, res, when) {
    console.log('reached')
    var trans = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'email',
            pass: 'pwd'
        }
    });

    const mailOpt = {
        from: 'email',
        to: to,
        subject: subject,
        html: text
    };

    trans.sendMail(mailOpt, function(error, info) {
        console.log('ok');
        if (error) console.log('Something went wrong')
        else {
            console.log('message sent: ' + info.response);
            // res.send('success')
        }
    });
    if (when == 'imm') {
        res.send('success')
    }

}
module.exports = router;
var express = require('express');
var router = express.Router();

var User = require('../models/user');

function isLogged(req) {
    // console.log("\nUser is " + req.session.userId + "\n");
    if (req.session.userId) return false;
    return true;
}

/* GET home page. */
router.get('/', function (req, res, next) {
    if (isLogged(req)) {
        // res.render('index', {title: 'Not logged'});
        res.render('login1', {title: 'Not logged'});

    }
    else {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    // res.render('indexDef', {title: 'Logged', username: req.session.username, email  : user.email, expirience: user.expirience});
                    res.render('indexDef', {title: 'Logged', username: user.username, email  : user.email, expirience: user.expirience});

                }
            });


    }
});


//POST route for updating data
router.post('/', function (req, res, next) {

    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
        let err = new Error('Passwords do not match.');
        err.status = 400;
        res.send("passwords dont match");
        return next(err);
    }

    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {

        let userData = {
            email: req.body.email,
            username: req.body.username,
            expirience: 0,
            password: req.body.password,
            passwordConf: req.body.passwordConf,
        };

        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                req.session.username = user.username;
                return res.redirect('/');
                // return res.redirect('/profile');
            }
        });

    } else if (req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
            if (error || !user) {
                let err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                req.session.username = user.username;
                // return res.redirect('/profile');
                return res.redirect('/');

            }
        });
    } else {
        let err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});
//
// // GET route after registering
// router.get('/profile', function (req, res, next) {
//
//     isLogged(req);
//
//
//     let session = req.session;
//     console.log(session);
//
//
//     User.findById(req.session.userId)
//         .exec(function (error, user) {
//             if (error) {
//                 return next(error);
//             } else {
//                 if (user === null) {
//                     let err = new Error('Not authorized! Go back!');
//                     err.status = 400;
//                     return next(err);
//                 } else {
//                     console.log(user);
//                     return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
//                 }
//             }
//         });
// });

// GET for logout logout
router.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});


module.exports = router;

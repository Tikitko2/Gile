var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Task = require('../models/task');

function isLogged(req) {
    if (req.session.userId) return true;
    return false;
}

function checkIsEmpty(value) {
    return value === undefined || value === null || value === "";
}

router.get('/', function (req, res, next) {
    if (!isLogged(req)) {
        res.render('index', {
            title: 'Аутентификация',
            type: 0
        });
    } else {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    Task.getTasks(user._id, function (tasks) {
                        var exp = 0;
                        for (var i = 0; i < tasks.length; i++) {
                            if (tasks[i].completed) exp += tasks[i].difficulty;
                            for (var j = 0; j < tasks[i].tasks.length; j++) {
                                if (tasks[i].tasks[j].completed) exp += tasks[i].tasks[j].difficulty;
                            }
                        }
                        res.render('index', {
                            title: 'Кабинет',
                            type: 1,
                            tasks: tasks,
                            username: user.username,
                            email: user.email,
                            experience: exp
                        });
                    });
                }
            });
    }
});


router.post('/', function (req, res, next) {

    if (req.body.password !== req.body.passwordConf) {
        let err = new Error("Passwords don't match!");
        err.status = 400;
        res.send("Passwords don't match!");
        return next(err);
    }

    if (req.body.email &&
        req.body.username &&
        req.body.password) {

        let userData = {
            email: req.body.email,
            username: req.body.username,
            expirience: 0,
            password: req.body.password,
        };

        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                req.session.username = user.username;
                return res.redirect('./');
            }
        });

    } else if (req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
            if (error || !user) {
                let err = new Error('Wrong email or password');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                req.session.username = user.username;
                return res.redirect('./');
            }
        });
    } else {
        let err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
        if (err) {
            return next(err);
        } else {
            return res.redirect('../')
        }
    });
});

router.get('/task', function (req, res, next) {
    if (!isLogged(req)) return next(new Error("Not logged"));
    if (checkIsEmpty(req.query['type'])) return next(new Error("Empty type"));
    switch (req.query['type']) {
        case "complete":
            if (!checkIsEmpty(req.query['taskId'])) {
                if (!checkIsEmpty(req.query['taskOwnerId'])) {
                    Task.completeSubTask(req.query['taskOwnerId'], req.query['taskId']);
                } else {
                    Task.completeTask(req.query['taskId']);
                }
            }
            break;
        case "delete":
            if (!checkIsEmpty(req.query['taskId'])) {
                if (!checkIsEmpty(req.query['taskOwnerId'])) {
                    Task.deleteSubTask(req.query['taskOwnerId'], req.query['taskId']);
                } else {
                    Task.deleteTask(req.query['taskId']);
                }
            }
            break;
        case "add":
            let title = checkIsEmpty(req.query['title']) ? "Empty" : req.query['title'];
            let difficulty = +(checkIsEmpty(req.query['difficulty']) ? "1" : req.query['difficulty'].toString());
            let description = checkIsEmpty(req.query['description']) ? "Empty" : req.query['description'];
            let taskData = {
                UserObjectId: req.session.userId,
                title: title,
                description: description,
                dateCreated: (new Date),
                dateCompleted: (new Date),
                completed: false,
                difficulty: difficulty,
                tasks: []
            };
            if (!checkIsEmpty(req.query['taskOwnerId'])) {
                Task.addSubTask(req.query['taskOwnerId'], taskData);
            } else {
                Task.sendTask(taskData);
            }
            break;
        default:
            return next(new Error("Empty request"));
    }
    res.redirect('../');
});


module.exports = router;

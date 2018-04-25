var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Task = require('../models/task');

function isLogged(req) {
    // console.log("\nUser is " + req.session.userId + "\n");
    if (req.session.userId) return true;
    return false;
}

/* GET home page. */
router.get('/', function (req, res, next) {
    if (!isLogged(req)) {
        // res.render('index', {title: 'Not logged'});
        res.render('index', {title: 'Аутентификация', type: 0});

    }
    else {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    Task.getTasks(user._id, function (tasks) {
						var exp = 0;

						for (var i = 0; i < tasks.length; i++)
						{
								if(tasks[i].completed)
									exp+= tasks[i].difficulty;
							for (var j = 0; j < tasks[i].tasks.length; j++)
							{
								if(tasks[i].tasks[j].completed)
									exp+= tasks[i].tasks[j].difficulty;
							}
						}

                        res.render('index', {
                            title: 'Кабинет',
                            type: 1,
                            tasks: tasks,
                            username: user.username,
                            email: user.email,
                            expirience: exp
                        });
                    });
                }
            });
    }
});


//POST route for updating data
router.post('/', function (req, res, next) {

    // confirm that user typed same password twice
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
                return res.redirect('./');

            }
        });
    } else {
        let err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('../');
            }
        });
    }
});

// ДАЙ БОГ СИЛЫ ПРОПЛЫТЬ ЧЕРЕЗ ЭТО МОРЕ Г****
router.get('/task', function (req, res, next) {
    if (!isLogged(req)) return next(new Error("Not Logged!"));
    if (req.query['type'] === undefined || req.query['type'] === null) return next(new Error("Empty Type!"));
    switch (req.query['type']) {
        case "complete":
            if (req.query['taskId'] !== undefined && req.query['taskId'] !== null) {
                if (req.query['taskOwnerId'] !== undefined && req.query['taskOwnerId'] !== null) {
                    Task.completeSubTask(req.query['taskOwnerId'], req.query['taskId']);
                } else {
                    Task.completeTask(req.query['taskId']);
                }
            }
            break;
        case "delete":
            if (req.query['taskId'] !== undefined && req.query['taskId'] !== null) {
                if (req.query['taskOwnerId'] !== undefined && req.query['taskOwnerId'] !== null) {
                    Task.deleteSubTask(req.query['taskOwnerId'], req.query['taskId']);
                } else {
                    Task.deleteTask(req.query['taskId']);
                }
            }
            break;
        case "add":
            var title = req.query['title'] === undefined || req.query['title'] === null ? "Empty" : req.query['title'] ;
            var difficulty = +(req.query['difficulty'] === undefined || req.query['difficulty'] === null ? "1" : req.query['difficulty'].toString()) ;
            var description = req.query['description'] === undefined || req.query['description'] === null ? "Empty" : req.query['description'];				
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
                if (req.query['taskOwnerId'] !== undefined && req.query['taskOwnerId'] !== null) {
                    Task.addSubTask(req.query['taskOwnerId'], taskData);
                } else {
                    Task.sendTask(taskData);
                }
            break;
        default:
            return next(new Error("Empty Request!"));
    }
    res.redirect('../');
});


module.exports = router;

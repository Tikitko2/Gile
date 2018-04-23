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
        res.render('login', {title: 'Аутентификация', type: 0});

    }
    else {
        User.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    res.render('login', {title: 'Пользователь', type: 1, username: user.username, email  : user.email, expirience: user.expirience});

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
	if (!isLogged(req)) 
		res.end('Вы не зарегистрированы');
	else 		
		{	
			if(req.query['complete'] == "true" && req.query['taskId'] != undefined && req.query['taskOwnerId'] != undefined) // Выполнение жетского таска
			{
				console.log("trying to complete subtask");
				Task.completeSubTask(req.query['taskOwnerId'], req.query['taskId']);
				res.end('Запрос прошел успешно');
			}
			else if(req.query['complete'] == "true" && req.query['taskId'] != undefined) // Выполнение таска
			{
				console.log("trying to complete task");
				Task.completeTask(req.query['taskId']);
				res.end('Запрос прошел успешно');
			}
			else if(req.query['taskOwnerId'] != undefined && req.query['delete'] == "true" && req.query['taskId'] != undefined) // Удаление детского таска
			{
				console.log("trying to delete subtask");
				Task.deleteSubTask(req.query['taskOwnerId'], req.query['taskId']);
				res.end('Запрос прошел успешно');
			}
			else if(req.query['taskId'] != undefined && req.query['delete'] == "true") // Удадение таска
			{
				console.log("trying to delete task");
				Task.deleteTask(req.query['taskId']);
				res.end('Запрос прошел успешно');
			}
			else
			if(req.query['taskOwnerId'] != undefined && req.query['delete'] == undefined && req.query['title'] != undefined && req.query['description'] != undefined) // Добавление детского таска
			{
				console.log("trying to add subtask");

				let taskData = 
				{
					UserObjectId: req.session.userId,
					title: req.query['title'],
					description: req.query['description'],
					dateCreated: (new Date),
					dateCompleted: (new Date),
					completed: false,
					tasks: []					
				};					
				Task.addSubTask(req.query['taskOwnerId'], taskData);
				res.end('Запрос прошел успешно');
			}
			else if(req.query['title'] != undefined && req.query['description'] != undefined)// Добавление базового таска
			{
				console.log("trying to add task");

				let taskData = 
				{
					UserObjectId: req.session.userId,
					title: req.query['title'],
					description: req.query['description'],
					dateCreated: (new Date),
					dateCompleted: (new Date),
					completed: false,
					tasks: []					
				};	
				Task.sendTask(taskData);
				res.end('Запрос прошел успешно');
			}
			else 
			{
				console.log('printing all tasks');
				Task.getTasks(req.session.userId, function(tasks){
					console.log(tasks);
				});
			}
			res.end('<html><meta charset="utf-8">Произошла ошибка</html	>');

		}
});


module.exports = router;

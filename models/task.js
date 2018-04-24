var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({
    UserObjectId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
	description: {
        type: String,
        trim: true,
    },
    dateCreated: {
        type: Date,
        required: true,
    },
    dateCompleted: {
        type: Date,
        required: true,
    },
    completed: {
        type: Boolean,
        required: true,
    },
	tasks:[mongoose.Schema.Types.Mixed]
	
});

var Task = mongoose.model('Task', TaskSchema);

Task.sendTask =  function(taskData)
{
	Task.create(taskData, function (error, task) {
            if (error) {
                return next(error);
            } else {
                //console.log("Task " + task.title + " added!");
            }
        });
}

Task.completeTask =  function(taskObjectId)
{
	Task.findById(taskObjectId, function (err, task) {
	if (err) return handleError(err);

	task.completed = true;
	task.dateCompleted = (new Date);

	for(let i = 0; i < task.tasks.length; i++)
	{
		Task.update({'tasks.completed': false}, 
		{'$set': {
			'tasks.$.completed': true,
		'tasks.$.dateCompleted': (new Date)	
		}},{multi:true}, function(err) {
		});
	}

	task.save();
	
	});
}

Task.completeSubTask =  function(parentTaskObjectId, taskObjectId)
{
	Task.update({'tasks._id': taskObjectId.toString()}, 
	{'$set': {
		'tasks.$.completed': true,
	'tasks.$.dateCompleted': (new Date)	
	}}, function(err) {
	});
}

Task.deleteTask =  function(taskObjectId)
{
	Task.findOneAndRemove({_id: taskObjectId}, function(err){});
}

Task.deleteSubTask =  function(parentTaskObjectId, taskObjectId)
{
	Task.update({ _id: parentTaskObjectId }, 
	{ "$pull": { "tasks": { "_id": taskObjectId.toString() } }},
	{ safe: true, multi:true }, function(err, obj) {	 })

}

Task.addSubTask =  function(taskObjectId, taskData)
{
	taskData._id = mongoose.Types.ObjectId().toString();
	Task.findById(taskObjectId, function (err, parentTask) {
		parentTask.tasks.set(parentTask.tasks.length, taskData);		
		parentTask.save();
		});  
}

Task.update2 =  function(taskData)
{
	 Task.save(function (err, taskData) {
		if (err) return handleError(err);
	  });
}

Task.getTasks =  function(UserObjectId, callback)
{
	var query = Task.find({
    'UserObjectId': UserObjectId});
	
	query.exec(function (err, task) {
	if (err) return handleError(err);
	//console.log(task);
	callback(task);
});
}

module.exports = Task;

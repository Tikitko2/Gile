var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({
    UserObjectId: {
        type: Schema.Types.ObjectId,
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
	tasks:[Schema.Types.Mixed]
	
});

var Task = mongoose.model('Task', TaskSchema);
module.exports = Task;

var mongoose = require('mongoose')
var FriendSchema = mongoose.Schema({
	accepted: {
		type: Boolean
	},

	from: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	},

	to: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	},

	createdAt: {
        type: Date,
        default: function() { return new Date(); }
    },

    updatedAt: {
        type: Date,
        default: function() { return new Date(); }    	
    }
});

var Friend = mongoose.model('Friend', FriendSchema);
module.exports = Friend;
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
	}
});

var Friend = mongoose.model('Friend', FriendSchema);
module.exports = Friend;
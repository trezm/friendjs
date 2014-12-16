var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var sessionSchema = mongoose.Schema({
	expires: {
		type: Date,
		default: (new Date()).setDate((new Date()).getDate() + 28)
	},

	userId: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	},

	sessionHash: {
		type: String,
		index: true
	}
});

sessionSchema.pre('save', function(next) {
	this.sessionHash = bcrypt.hashSync(this._id, bcrypt.genSaltSync(8), null);
	next();
})

var Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
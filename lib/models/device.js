var mongoose = require('mongoose')
var DeviceTypes = [
	'web',
	'ios',
	'android',
	'unknown'
]

var DeviceSchema = mongoose.Schema({
	type: {
		enum: DeviceTypes
	},

	deviceId: {
        type: String,
        unique: true,
        dropDups: true,
        sparse: true
	},

	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	}
});

var Device = mongoose.model('Device', DeviceSchema);
Device.DeviceTypes = DeviceTypes;
module.exports = Device;

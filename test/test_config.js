process.env.NODE_ENV = 'test';

var settings = require('../settings');
var mongoose = require('mongoose');

beforeEach(function(done) {
	function resetDB() {
		for (var i in mongoose.connection.collections) {
			mongoose.connection.collections[i].remove(function() {});
		}
	}

	if (mongoose.connection.readyState === 0) {
		mongoose.connect(settings.MONGO_URL, function(error) {
			if (error) {
				throw error;
			}
			resetDB();
			done();
		});
	} else {
		resetDB();
		done();
	}
});

afterEach(function(done) {
	mongoose.disconnect();
	done();
});
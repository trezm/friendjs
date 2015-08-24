process.env.NODE_ENV = 'test';

var settings = require('../settings');
var mongoose = require('mongoose');

GLOBAL.config = settings;

beforeEach(function(done) {
	function resetDB() {
		for (var i in mongoose.connection.collections) {
			mongoose.connection.collections[i].remove(function() {});
		}
	}

	if (mongoose.connection.readyState === 0) {
		mongoose.connect("mongodb://" + settings.mongo.url + ":" + settings.mongo.port + "/" + settings.mongo.db, function(error) {
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
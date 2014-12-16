var utils = require('./test_config.js');
var expect = require('chai').expect;
var UserController = require('../app/controllers/user_controller').UserController;
var Session = require('../lib/models/session');
var async = require('async');

describe('UserController', function() {
	var user;
	var session;
	var defaultAttributes = {
		first: "Pete",
		last: "Mertz",
		password: "abceasyas123",
		passwordConfirmation: "abceasyas123",
		email: 'test@example.com'
	}

	beforeEach(function(done) {
		async.waterfall(
			[

				function(callback) {
					UserController.create(defaultAttributes, callback)
				},
				function(results, callback) {
					user = results;
					session = new Session();
					session.userId = user;
					session.save(callback);
				}
			],
			function(error, result) {
				done();
			}
		);
	});

	it('should have a create method', function() {
		expect(UserController).to.respondTo('create');
	});

	it('should have a read method', function() {
		expect(UserController).to.respondTo('read');
	});

	it('should have a update method', function() {
		expect(UserController).to.respondTo('update');
	});

	it('should have a destroy method', function() {
		expect(UserController).to.respondTo('destroy');
	});
});
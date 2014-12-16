var utils = require('./test_config.js');
var expect = require('chai').expect;
var User = require('../lib/models/user.js');
var Session = require('../lib/models/session.js');
var async = require('async');

describe('session', function() {
	var session;
	var user;

	beforeEach(function(done) {
		user = new User({
			first: "Pete",
			last: "Mertz",
			password: "abceasyas123",
			passwordConfirmation: "abceasyas123",
			email: 'test@example.com'
		});

		async.waterfall(
			[

				function(callback) {
					user.save(function(error, result) {
						if (error) {
							callback(error);
							return;
						}

						User.findOne({
							_id: result._id
						}, function(error, result) {
							user = result;
							callback(null, result);
						});
					});
				},
				function(user, callback) {
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

	it('should have a user', function(done) {
		Session
			.findOne({_id: session._id})
			.populate('userId')
			.exec(function(error, results) {
				expect(results.userId.email).to.equal(user.email);
				done();
			})
	})

	it('should have a sessionHash', function() {
		expect(session).to.have.property('sessionHash');
		expect(session.sessionHash).to.not.be.null;
	});

	it('should have an expires', function() {
		expect(session).to.have.property('expires');
	});
});
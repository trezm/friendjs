var utils = require('./test_config.js');
var expect = require('chai').expect;
var User = require('../lib/models/user.js');
var bcrypt = require('bcrypt-nodejs');

describe('user', function() {
	var user;

	beforeEach(function(done) {
		user = new User({
			first: "Pete",
			last: "Mertz",
			password: "abceasyas123",
			passwordConfirmation: "abceasyas123",
			email: 'test@example.com'
		});

		user.save(function(error, result) {
			if (error) {
				console.log(error);
			}

			User.findOne({
				_id: result._id
			}, function(error, result) {
				user = result;
				done();
			});
		});
	});

	it('should have a passwordHash field', function() {
		expect(user).to.have.property('passwordHash');
	});

	it('should have an email field', function() {
		expect(user).to.have.property('email');
	});

	it('should have a first field', function() {
		expect(user).to.have.property('first');
	});

	it('should have a last field', function() {
		expect(user).to.have.property('last');
	});

	it('should have an isPasswordValid function', function() {
		expect(user).to.respondTo('isPasswordValid');
	});

	it('should save passwords properly', function() {
		expect(user.password).to.not.exist;
		expect(user.passwordConfirmation).to.not.exist;
		expect(bcrypt.compareSync('abceasyas123', user.passwordHash)).to.be.true;
	});

	it('should not allow mismatched passwords', function(done) {
		user = new User();
		user.password = 'abceasyas123';
		user.passwordConfirmation = 'abceasyas122';
		user.email = 'test2@example.com';
		user.save(function(error, result) {
			expect(error).to.exist;
			done();
		});
	});

	it('should not allow duplicate emails', function(done) {
		user = new User();
		user.password = 'abceasyas123';
		user.passwordConfirmation = 'abceasyas123';
		user.email = 'test@example.com';
		user.save(function(error, result) {
			expect(error).to.exist;
			done();
		});
	});
});
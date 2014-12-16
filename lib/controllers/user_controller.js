var User = require('../models/user');
var mongoose = require('mongoose');
var async = require('async');
var validate = require('petemertz-express-validator')

module.exports.UserController = {
	create: function(params, callback) {
		User.create(params, function(error, results) {
			callback(error, results);
		});
	},

	read: function(params, callback) {
		User.findOne(params, callback);
	},

	update: function(params, update, callback) {
		// @TODO: Implement
		throw {
			error: 'UserController.update not implemented'
		}
	},

	destroy: function(params, callback) {
		// @TODO: Implement
		throw {
			error: 'UserController.destroy not implemented'
		}
	}
}

module.exports.UserControllerRoutes = {
	read: function(req, res) {
		if (req.body.password &&
			req.body.email) {
			module.exports.UserController.read({
				email: req.body.email
			}, function(error, results) {
				if (error) {
					res.json({
						error: error
					});
					return;
				}

				if (results &&
					results.isPasswordValid(req.body.password)) {
					res.json(results);
				} else {
					res.json({
						error: 'Invalid email or password'
					});
				}
			});

		} else {
			res.json({
				error: 'Must include an email and password'
			});
		}
	},

	readFriendInfo: function(req, res) {
		if (validate({
				phoneNumber: 'required'
			}, req, res)) {
			module.exports.UserController.read({
				phoneNumber: req.query.phoneNumber
			}, function(error, results) {
				if (error) {
					res.json(error);
				} else {
					res.json({
						_id: results._id,
						first: results.first,
						last: results.last,
						phoneNumber: results.phoneNumber						
					});
				}
			})
		}
	},

	create: function(req, res) {
		if (req.body.first) {
			var user = {};
			user.first = req.body.first;
			user.last = req.body.last;
			user.email = req.body.email;
			user.password = req.body.password;
			user.passwordConfirmation = req.body.passwordConfirmation;
			user.phoneNumber = req.body.phoneNumber;

			module.exports.UserController.create(user, function(error, results) {
				if (error) {
					res.json({
						error: error
					});
					return;
				}

				res.json(results);
			});
		} else {
			res.json({
				error: 'Should have at least a first'
			});
		}
	}
}
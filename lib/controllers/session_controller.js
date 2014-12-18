var Session = require('../models/session');
var User = require('../models/user');
var UserController = require('./user_controller').UserController;
var async = require('async');
var mongoose = require('mongoose');
var validate = require('petemertz-express-validator')

module.exports.SessionController = {
	create: function(params, callback) {
		async.waterfall([

			function(callback) {
				UserController.read({
					email: params.email
				}, function(error, results) {
					callback(error, results);
				});
			},
			function(user, callback) {
				if (!user) {
					callback('No user found');
					return;
				}

				if (user.error) {
					callback(error || user.error);
					return;
				}

				if (user && user.isPasswordValid(params.password)) {
					Session.create({
						userId: user._id
					}, callback);
				} else {
					callback({
						error: 'Incorrect password'
					});
				}
			},
			function(session, callback) {
				session.save(callback);
			}
		], function(error, session) {
			if (error) {
				callback(error);
				return;
			}

			callback(null, {
				sessionHash: session.sessionHash,
				user: session.userId
			});
		});
	},

	read: function(params, callback) {
		if (!params.sessionHash) {
			callback('Requires a sessionHash');
			return;
		}

		Session
			.findOne(params)
			.populate('userId')
			.exec(function(error, results) {
				callback(error, results);
			});
	},

	destroy: function(params, callback) {
		// @TODO: Implement
		throw {
			error: 'SessionController.destroy not implemented'
		}
	}
}

module.exports.SessionControllerRoutes = {
	read: function(req, res) {
		if (req.query.sessionHash) {
			// Make sure we only send it the sessionId, to prevent
			// malicious users from querying for all sessions.
			module.exports.SessionController.read({
				sessionHash: req.query.sessionHash
			}, function(error, results) {
				if (error) {
					res.json({
						error: error
					});
				} else if (results) {
					res.json({
						user: results.userId,
						expires: results.expires,
						sessionHash: results.sessionHash
					});
				} else {
					res.json({
						error: "Bad session"
					})
				}

			});

		} else {
			res.json({
				error: 'Must include sessionHash'
			});
		}
	},

	create: function(req, res) {
		if (req.body.email && req.body.password) {
			var session = {};
			session.email = req.body.email;
			session.password = req.body.password;

			module.exports.SessionController.create(session, function(error, results) {
				if (error) {
					res.status(403).json({
						error: error
					});
					return;
				}

				res.json(results);
			});
		} else {
			var errors = [];
			if (!req.body.email) {
				errors.push('Should have an email');
			}
			if (!req.body.password) {
				errors.push('Should have a password');
			}

			res.status(400).json({
				error: errors
			});
		}
	},

	validateSession: function(req, res, next) {
		if (validate({
				sessionhash: 'required'
			}, req, res)) {
			module.exports.SessionController.read({
				sessionHash: req.headers.sessionhash
			}, function(error, results) {
				if (error) {
					res.json(error);
				} else if (!results || !results.userId) {
					res.json('Invalid session')
				} else {
					req.currentUser = results.userId;
					next();
				}
			})
		}
	}
}
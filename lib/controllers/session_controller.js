var models = require('../models');
var Session = models.Session;
var Device = models.Device;

var User = require('../models/user');
var UserController = require('./user_controller').UserController;
var async = require('async');
var mongoose = require('mongoose');
var validate = require('petemertz-express-validator')
var libphonenumber = require('libphonenumber');
var DeviceController = require('./device_controller').DeviceController;
var redis = config.REDIS_CLIENT;
var twilio = require('twilio')(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

module.exports.SessionController = {
	create: function(params, callback) {
		var self = module.exports.SessionController;
		var query = {};
		if (params.email) {
			query = {
				email: params.email
			}
		} else if (params.phoneNumber && params.pin) {
			query = {
				phoneNumber: libphonenumber.e164(params.phoneNumber, 'US'),
			}
		}

		async.waterfall([
			function confirmPin(callback) {
				if (!params.email) {
					redis.get('pin.confirmation.' + query.phoneNumber, function(error, results) {
						if (results && results === params.pin) {
							callback(null, results);
						} else {
							callback('Incorrect PIN');
						}
					});
				} else {
					callback();
				}
			},
			function getUser(pin, callback) {
				UserController.read(query, callback);
			},
			function createDevice(user, callback) {
				if (params.device && params.device.deviceId) {
					DeviceController.create(user, params.device.deviceId, function(error, results) {
						callback(error, user);
					});
				} else {
					callback(null, user);
				}
			},
			function createSession(user, callback) {
				if (!user) {
					callback('No user found');
					return;
				}

				if (user.error) {
					callback(error || user.error);
					return;
				}

    			// If the user doesn't have a password (i.e. PIN verification) OR
	    		// the password is valid, then create a session
	    		if (!user.passwordHash || user.isPasswordValid(params.password)) {
	    			Session.create({
	    				userId: user._id
	    			}, callback);
	    		} else {
	    			if (user.email) {
	    				callback({
	    					error: 'Incorrect password'
	    				});
	    			} else {
	    				callback({
	    					error: error ? error : "Too many incorrect confirmation attempts."
	    				})
	    			}
	    		}
	    	},
	    	function saveSession(session, callback) {
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
	    	}
	    );
	},

	createPin: function(redis, twilio, params, callback) {
		var pin = "";
		for (var i = 0; i < 6; i++) {
    		pin += Math.floor(Math.random() * 10)
    	}

    	async.series({
    		sendText: function(next) {
    			twilio.messages.create({
    				body:  "Hey! Your Tally Pin is: " + pin,
    				to: params.toNumber,
    				from: params.fromNumber
    			}, next);
    		},
    		setRedis: function(next) {
    			redis.set('pin.confirmation.' + libphonenumber.e164(params.toNumber, 'US'), pin, 'EX', config.PIN_TIMEOUT ? config.PIN_TIMEOUT : 60, next);
    		}
    	}, callback);
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
					res.status(500).json({
						error: error
					});
				} else if (results) {
					res.json({
						user: results.userId,
						expires: results.expires,
						sessionHash: results.sessionHash
					});
				} else {
					res.status(401).json({
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
					res.status(500).json(error);
				} else if (!results || !results.userId) {
					res.status(401).json('Invalid session');
				} else if (results.userId.confirmationCode) {
					res.status(401).json('Unconfirmed account');
				} else if (results.userId.isAccountApproved != undefined &&
					!results.userId.isAccountApproved) {
					res.status(401).json('Unapproved account');
				} else {
					req.currentUser = results.userId;
					next();
				}
			})
		}
	},

	requestPin: function(req, res, next) {
		var self = module.exports.SessionControllerRoutes;

		if (validate({
			phoneNumber: 'required'
		}, req, res)) {
			module.exports.SessionController.createPin(redis, twilio, {
				toNumber: req.params.phoneNumber,
				fromNumber: config.TWILIO_NUMBER
			}, function(error, results) {
				if (error) {
					res.status(500).json(error);
				} else {
					res.json(results);
				}
			});
		}
	},

	sessionFromPin: function(req, res, next) {
		if (validate({
			phoneNumber: 'required',
			pin: 'required'
		}, req, res)) {
			var session = {}
			session.phoneNumber = req.params.phoneNumber;
			session.pin = req.body.pin;
			session.device = {};
			session.device.deviceType = req.headers['device-type'];
			session.device.deviceId = req.headers['device-id'];

			module.exports.SessionController.create(session, function(error, results) {
				if (error) {
					res.status(403).json({
						error: error
					});
					return;
				}

				res.json(results);
			});
		}
	}
}
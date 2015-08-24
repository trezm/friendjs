var async = require('async');
var bcrypt = require('bcrypt-nodejs');
var libphonenumber = require('libphonenumber');
var models = require('../models');
var mongoose = require('mongoose');
var validate = require('petemertz-express-validator');
var EmailController = require('./email_controller');

var Device = models.Device;
var User = models.User;

module.exports.UserController = {
	create: function(params, callback) {
		if (config.adminAccountsEnabled) {
			delete params.isAdmin;
		}

		if (config.accountApprovalEnabled) {
			params.isAccountApproved = false;
		}

		// Defaults to 'US' right now, only supported country.
		if (params.phoneNumber) {
			params.phoneNumber = libphonenumber.e164(params.phoneNumber, 'US');
		}

		var self = this;
		User.create(params, function(error, results) {
			if (error) {
				callback(error);
			} else {
				if (!!(config.mandrill.apiKey != undefined &&
					config.MANDRILL_CONFIRMATION_ADDRESS != undefined) && results.email) {
					// Set the confirmation string
					results.confirmationCode = bcrypt.hashSync(results._id, bcrypt.genSaltSync(8), null);
					results.save(function(error, results) {
						callback(error, results);
					});
				} else {
					callback(error, results);
				}
			}
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
	},

	confirm: function(code, callback) {
		User.update({
			confirmationCode: code
		}, {
			$unset: {
				confirmationCode: ""
			}
		}, callback);
	},

	approve: function(approver, approvee, callback) {
		User.update({
			_id: approvee
		}, {
			$set: {
				isAccountApproved: true
			}
		}, callback);
	},

	readUnapproved: function(callback) {
		User.find({
			isAccountApproved: false
		}, function(error, results) {
			callback(error, results);
		})
	},

	sendMessage: function(user, message, callback) {
		async.waterfall([
			function retrieveDevicesForUser(next) {
				Device.find({user: user.id}, next);
			},
			function sendMessagesToEachDevice(devices, next) {
				next(null, devices);
			}
			], callback);
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
					res.status(401).json({
						error: 'Invalid email or password'
					});
				}
			});

		} else {
			res.status(401).json({
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
					res.status(500).json(error);
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
		var user = {};
		user.first = req.body.first;
		user.last = req.body.last;
		user.email = req.body.email;
		user.password = req.body.password;
		user.passwordConfirmation = req.body.passwordConfirmation;
		user.phoneNumber = req.body.phoneNumber;

		module.exports.UserController.create(user, function(error, results) {
			if (error) {
				res.status(500).json({
					error: error
				});
				return;
			}

			res.json(results);
			if (config.mandrill.apiKey &&
				config.mandrill.confirmationAddress &&
				user.email) {

			    EmailController.sendConfirmation(results.confirmationCode, [{
			    	"email": results.email,
			    	"name": results.first + " " + results.last,
			    	"type": "to"
			    }],
			    config.mandrill.from,
			    config.mandrill.subject
			    );
			}
		});
	},

	confirm: function(req, res) {
		if (validate({
				code: 'required'
			}, req, res)) {
			module.exports.UserController.confirm(
				req.query.code,
				function(error, results) {
					if (error) {
						res.status(500).json(error);
					} else {
						res.json({
							success: "Confirmation success!"
						});
					}
				})
		}
	},

	approve: function(req, res) {
		if (validate({
				user: 'required'
			}, req, res)) {
			if (req.currentUser.isAdmin) {
				module.exports.UserController.approve(
					req.currentUser,
					req.params.user,
					function(error, results) {
						if (error) {
							res.status(500).json(error);
						} else {
							res.json({
								success: "Approved"
							});
						}
					});
			} else {
				res.status(401).json("Not an admin");
			}
		}
	},

	readUnapproved: function(req, res) {
		if (validate({

			}, req, res)) {
			if (req.currentUser.isAdmin) {
				module.exports.UserController.readUnapproved(
					function(error, results) {
						if (error) {
							res.status(500).json(error);
						} else {
							res.json(results);
						}
					});
			} else {
				res.status(401).json('Not an admin');
			}
		}
	},

	sendMessage: function(req, res) {
		if (validate({
			message: 'required'
		}, req, res)) {
			module.exports.UserController.sendMessage(req.currentUser, req.body.message, function(error, results) {
				if (error) {
					res.status(500).json(error);
				} else {
					res.json(results);
				}
			})
		}
	}
}
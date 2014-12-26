var User = require('../models/user');
var mongoose = require('mongoose');
var async = require('async');
var validate = require('petemertz-express-validator');
var bcrypt = require('bcrypt-nodejs');

module.exports.UserController = {
	create: function(params, callback) {
		if (this.adminAccountsEnabled) {
			delete params.isAdmin;
		}

		if (this.accountApprovalEnabled) {
			params.isAccountApproved = false;
		}

		var self = this;
		User.create(params, function(error, results) {
			if (error) {
				callback(error);
			} else {
				if (!!self.accountConfirmationEnabled) {
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
		if (req.body.first) {
			var user = {};
			user.first = req.body.first;
			user.last = req.body.last;
			user.email = req.body.email;
			user.password = req.body.password;
			user.passwordConfirmation = req.body.passwordConfirmation;
			user.phoneNumber = req.body.phoneNumber;

			var self = module.exports.UserControllerRoutes;
			var UserController = module.exports.UserController
			UserController.adminAccountsEnabled = self.adminAccountsEnabled;
			UserController.accountApprovalEnabled = self.accountApprovalEnabled;
			UserController.accountConfirmationEnabled = (self.mandrillApiKey != undefined &&
				self.mandrillConfirmationAddress != undefined);
			module.exports.UserController.create(user, function(error, results) {
				if (error) {
					res.status(500).json({
						error: error
					});
					return;
				}

				res.json(results);
				if (self.mandrillApiKey &&
					self.mandrillConfirmationAddress) {
					var EmailController = (require('./email_controller')(self.mandrillConfirmationAddress, self.mandrillApiKey)).EmailController;
					EmailController.sendConfirmation(results.confirmationCode, [{
							"email": results.email,
							"name": results.first + " " + results.last,
							"type": "to"
						}],
						self.from,
						self.subject
					);
				}
			});
		} else {
			res.status(400).json({
				error: 'Should have at least a first'
			});
		}
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
	}
}
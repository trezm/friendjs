var Friend = require('../models/friend');
var User = require('../models/user');
var mongoose = require('mongoose');
var validate = require('petemertz-express-validator');
var async = require('async');
var _ = require('underscore');
var libphonenumber = require('libphonenumber');

module.exports.FriendController = {
	populateFriend: function(callback) {
		return function(error, results) {
			Friend.findOne({
				_id: results._id
			})
			.populate('to')
			.populate('from')
			.exec(callback)				
		}
	},

	create: function(params, callback) {
		var self = this;

		async.waterfall([
			function getParams(next) {
				if (params.toNumber) {
					params.toNumber = libphonenumber.e164(params.toNumber, 'US');

					User.findOne({
						phoneNumber: params.toNumber
					}, function(error, results) {
						if (error) {
							next(error);
						} else {
							params.to = results;
							next(null, params);
						}
					});
				} else {
					next(null, params);
				}
			},
			function checkForExistingFriendRequests(params, next) {
				Friend.find({
					$or: [
					{to: params.to, from: params.from},
					{to: params.from, from: params.to}
					]
				}, function(err, results) {
					next(err || results.length > 0 ? {error: 'Request already exists'} : null, params);
				})
			},
			function(params, next) {
				Friend.create(params, self.populateFriend(next));					
			}
			], callback);
	},

	read: function(params, callback) {
		var user = params.user;

		async.parallel({
				to: function(callback) {
					Friend.find({
							to: user
						})
						.populate('to')
						.populate('from')
						.exec(callback);
				},

				from: function(callback) {
					Friend.find({
							from: user
						})
						.populate('to')
						.populate('from')
						.exec(callback);
				}
			},
			function(error, results) {
				if (error) {
					callback(error);
					return;
				}

				var concatResults = results.to.concat(results.from);
				callback(null, concatResults);
			});
	},

	phoneNumberHits: function(numbers, createdAt, callback) {
		callback = !!callback ? callback : createdAt;
		createdAt = !!callback ? createdAt : new Date(0);

		User.find({
			phoneNumber: {
				$in: _.map(numbers, function(number) {
					try {
						return libphonenumber.e164(number, 'US');
					} catch (error) {
						return number;
					}
				})
			},
			createdAt: {
				$gte: createdAt
			}
		},
		{ 
			phoneNumber: 1,
			_id: 0
		}, callback);
	},

	update: function(params, updatedFields, callback) {
		var self = this;

		updatedFields.updatedAt = new Date();

		Friend.update(params, updatedFields, function(error, results) {
			if (error) {
				callback(error);
				return;
			}

			Friend.findOne({_id: params._id}, self.populateFriend(callback));
		});
	},

	destroy: function(params, callback) {
		Friend.destroy(params, callback);
	}
}

module.exports.FriendControllerRoutes = {
	create: function(req, res) {
		if (validate({
				user: 'required',
				friend: 'required'
			}, req, res)) {
			if (req.currentUser._id == req.params.user) {
				var friend = req.body.friend;
				friend.from = req.currentUser;
				delete friend.accepted;

				module.exports.FriendController.create(
					friend,
					function(error, results) {
						if (error) {
							res.status(400).json('Friend request already exists');
						}
						else
						{
							res.json(results);
						}
					}
				);
			} else {
				res.status(400).json('Can only create your own friend requests');
			}
		}
	},

	read: function(req, res) {
		if (validate({
				user: 'required'
			}, req, res)) {
			if (req.currentUser._id == req.params.user) {
				var params = {
					user: req.currentUser
				}

				if (req.query.updatedAt) {
					params.updatedAt = {
						$gte: req.query.updatedAt
					};
				}
				
				module.exports.FriendController.read(
					params, 
					function(error, results) {
						if (error) {
							res.status(500).json(error);						
						}
						else
						{
							res.json(results);
						}
					}
				);
			} else {
				res.status(400).json('Can only create your own friend requests');
			}
		}
	},

	phoneNumberHits: function(req, res) {
		if (validate({
			numbers: 'required'
		}, req, res)) {
			module.exports.FriendController.phoneNumberHits(
				req.body.numbers,
				req.body.createdAt,
				function(error, results) {
					if (error) {
						res.status(500).json(error);
					}
					else
					{
						res.json(results);
					}
				}
			);
		}
	},

	update: function(req, res) {
		if (validate({
				friend: 'required'
			}, req, res)) {
			module.exports.FriendController.update({
					_id: mongoose.Types.ObjectId(req.params.friend),
					to: req.currentUser._id
				},
				req.body.friend,
				function(error, results) {					
					if (error) {
						res.status(500).json(error);						
					}
					else
					{
						res.json(results);
					}
				})
		}
	},

	destroy: function(req, res) {}
}
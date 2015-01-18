var Friend = require('../models/friend');
var User = require('../models/user');
var mongoose = require('mongoose');
var validate = require('petemertz-express-validator');
var async = require('async');

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

		if (params.toNumber) {
			params.toNumber = params.toNumber.replace(/(\s|\(|\)|\-)/g, "")

			User.findOne({
				phoneNumber: params.toNumber
			}, function(error, results) {
				if (error) {
					callback(error);
				} else {
					params.to = results;
					Friend.create(params, self.populateFriend(callback));
				}
			});
		} else {
			Friend.create(params, self.populateFriend(callback));
		}
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

	phoneNumberHits: function(numbers, callback) {
		User.find({
			phoneNumber: {
				$in: numbers
			}
		}, callback);
	},

	update: function(params, updatedFields, callback) {
		var self = this;

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
						res.json(results);
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
				module.exports.FriendController.read({
					user: req.currentUser
				}, function(error, results) {
					if (error) {
						res.status(500).json(error);						
					}
					else
					{
						res.json(results);
					}
				});
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
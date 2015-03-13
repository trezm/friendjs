var _ = require('underscore');
var async = require('async');
var AWS = require('aws-sdk');
var libphonenumber = require('libphonenumber');
var models = require('../models');
var mongoose = require('mongoose');
var validate = require('petemertz-express-validator');
var SNS = new AWS.SNS({
	region: config.AWS_REGION,
	accessKeyId: config.AWS_ACCESS_KEY_ID,
	secretAccessKey: config.AWS_SECRET_ACCESS_KEY
});

var Device = models.Device;
var User = models.User;

var _createAPNSMessage = function(message, options) {
	options = options || {};

	return {
		aps: {
			alert: message,
			sound: "default"
		},
		options: options
	};
}

var _createGCMMessage = function(message, options) {
	options = options || {};

	return {
		data: {
			message: message
		}
	};
}

module.exports.DeviceController = {
	create: function(user, token, callback) {
		async.waterfall([
			function getDevice(next) {
				Device.findOne({
					deviceId: token
				}, next)
			},
			function pushArnIfNecessary(device, next) {
				if (!!device) {
					next(null, device);
				} else {
					async.waterfall([
						function getArn(next) {
							SNS.createPlatformEndpoint({
								PlatformApplicationArn: config.AWS_PLATFORM_APPLICATION_ARN,
								Token: token
							}, function(error, results) {
								if (error) {
									next(error);
								} 
								else
								{
									next(null, results.EndpointArn);
								}
							});
						},
						function createDevice(arn, next) {
							Device.update({
								deviceId: token
							},
							{
								type: 'ios',
								user: user._id,
								deviceId: token,
								endpointArn: arn
							},
							{
								upsert: true
							},
							next);
						}
						], next);
				}
			}
			], callback)
	},

	sendNotification: function(user, subject, notification, callback, extraOptions) {
		var params = {
			Message: JSON.stringify({
				default: notification,
				APNS_SANDBOX: JSON.stringify(_createAPNSMessage(notification, extraOptions))
			}),
			MessageStructure: 'json',
			Subject: subject
		}

		Device.find({user: user._id}, function(error, results) {
			if (error) {
				callback(error);
			} else {
				var messageQueue = _.map(results, function(device) {
					return function(next) {
						params.TargetArn = device.endpointArn;
						SNS.publish(params, next);
					}
				});

				async.series(messageQueue, callback);
			}
		});
	}
}

module.exports.DeviceControllerRoutes = {
	create: function(req, res) {
		if (validate({
			token: 'required'
		}, req, res)) {
			module.exports.DeviceController.create(req.currentUser, req.body.token, function(error, results) {
				if (error) {
					res.status(500).json(error);
				} else {
					res.json(results);
				}
			});
		}
	},

	sendNotification: function(req, res) {
		if (validate({
			subject: 'required',
			notification: 'required'
		}, req, res)) {
			module.exports.DeviceController.sendNotification(req.currentUser, req.body.subject, req.body.notification, function(error, results) {
				if (error) {
					res.status(500).json(error);
				} else {
					res.json(results);
				}
			});
		}
	}
}
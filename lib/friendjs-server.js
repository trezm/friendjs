var friendjs = require('./friend');
var settings = require('../settings');
var defaultOptions = {
  mongo: {
    url: 'localhost',
    db: 'friendjs',
    port: 27017
  },

  redis: {
    port: 6379,
    host: 'localhost',
    maxAttempts: 5,
    client: undefined
  },

  twilio: {
    accountSID: '',
    authToken: '',
    number: ''
  },

  PORT: 3000,

  mandrill: {
    apiKey: 'K4NsYN27hNA4P6D03gPhCw',
    confirmationAddress: 'http://localhost:3000/confirm',
    from: {
      email: 'bot@localhost.com',
      name: 'Mr. Robot'
    },
    subject: 'Confirm your email'
  },

  adminAccountsEnabled: true,
  accountApprovalEnabled: true
}

var init = function(args) {
	var options = settings;
	parseArguments(args, options);

	// Express
	var express = require('express');
	var app = express();
	var bodyParser = require('body-parser');

	// Mongoose
	var mongoose = require('mongoose');
	mongoose.connect("mongodb://" + options.mongo.url + ":" + options.mongo.port + "/" + options.mongo.db);

	var db = mongoose.connection;
	db.on('error', console.error.bind(console, '[ERROR]'));
	db.on('open', function callback() {

	});

	// Redis
	var redis = require("redis");
    var redisClient = redis.createClient(options.redis.port, options.redis.host, {
    	max_attempts: options.redis.maxAttempts
    });

    redisClient.on("error", function (err) {
        console.log("Error " + err);
    });

	app.use(bodyParser());

	var server = require('http').createServer(app).listen(options.PORT);

	console.log('options:', options);
	options.redis.client = redisClient;
	var friends = friendjs(options);
	friends.routes(app);
}

var parseArguments = function(args, options) {
	for (var i = 2; i < args.length; i += 2) {
		var arg = args[i];
		options[arg.substring(1)] = args[i + 1];
	}
}

module.exports = init;
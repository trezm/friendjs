var friendjs = require('./friend');

var defaultOptions = {
	MONGO_URL: 'localhost',	
    MONGO_DB: 'friendjs',
    MONGO_PORT: 27017,

    REDIS_PORT: 6379,
    REDIS_HOST: 'localhost',
    REDIS_MAX_ATTEMPTS: 5,

    TWILIO_ACCOUNT_SID: "",
    TWILIO_AUTH_TOKEN: "",
    TWILIO_NUMBER: "",

    PORT: 3000,

    MANDRILL_API_KEY: 'K4NsYN27hNA4P6D03gPhCw',
    MANDRILL_CONFIRMATION_ADDRESS: 'http://localhost:3000/confirm',

    MANDRILL_FROM: {
    	"email": "bot@localhost.com",
    	"name": "Mr. Roboto"
    },
    MANDRILL_SUBJECT: "Confirm your email",

    ADMIN_ACCOUNTS_ENABLED: true,
    ACCOUNT_APPROVAL_ENABLED: true
}

var init = function(args) {
	var options = defaultOptions;
	parseArguments(args, options);

	// Express
	var express = require('express');
	var app = express();
	var bodyParser = require('body-parser');

	// Mongoose
	var mongoose = require('mongoose');
	mongoose.connect("mongodb://" + options.MONGO_URL + ":" + options.MONGO_PORT + "/" + options.MONGO_DB);

	var db = mongoose.connection;
	db.on('error', console.error.bind(console, '[ERROR]'));
	db.on('open', function callback() {

	});

	// Redis
	var redis = require("redis");
    var redisClient = redis.createClient(options.REDIS_PORT, options.REDIS_HOST, {    	
    	max_attempts: options.REDIS_MAX_ATTEMPTS
    });

    redisClient.on("error", function (err) {
        console.log("Error " + err);
    });

	app.use(bodyParser());

	var server = require('http').createServer(app).listen(options.PORT);

	establishRoutes(app, options, redisClient);
}

var parseArguments = function(args, options) {
	for (var i = 2; i < args.length; i += 2) {
		var arg = args[i];
		options[arg.substring(1)] = args[i + 1];
	}
}

var establishRoutes = function(app, options, redisClient) {
	// Set up Users and Friends
	friendjs.routes(app, options, redisClient);
}

module.exports = init;
var friendjs = require('./friend');

var defaultOptions = {
	MONGO_URL: 'localhost',	
    MONGO_DB: 'friendjs',
    MONGO_PORT: 27017,

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

	app.use(bodyParser());

	var server = require('http').createServer(app).listen(options.PORT);

	establishRoutes(app, options);
}

var parseArguments = function(args, options) {
	for (var i = 2; i < args.length; i += 2) {
		var arg = args[i];
		options[arg.substring(1)] = args[i + 1];
	}
}

var establishRoutes = function(app, options) {
	// Set up Users and Friends
	friendjs.routes(app, options);
}

module.exports = init;
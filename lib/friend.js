module.exports = function(options) {
	var controllers = require('./controllers');
	var UserControllerRoutes = controllers.UserControllerRoutes;
	var FriendControllerRoutes = controllers.FriendControllerRoutes;
	var SessionControllerRoutes = controllers.SessionControllerRoutes(options);
	var DeviceControllerRoutes = controllers.DeviceControllerRoutes(options);

	var applyUserRoutes = function(app, validationMethod) {
	    // User
	    app.post('/users', UserControllerRoutes.create);
	    app.post('/users/:user/approve', validationMethod, UserControllerRoutes.approve);		
	    app.get('/users/unapproved', validationMethod, UserControllerRoutes.readUnapproved);			
	    app.post('/signin', UserControllerRoutes.read);
	    app.get('/users', validationMethod, UserControllerRoutes.readFriendInfo);
	    app.get('/confirm', UserControllerRoutes.confirm);
	}

	var applyFriendRoutes = function(app, validationMethod) {
    	// Friends
    	app.post('/users/:user/friend', validationMethod, FriendControllerRoutes.create);
    	app.get('/users/:user/friends', validationMethod, FriendControllerRoutes.read);
    	app.put('/friends/:friend', validationMethod, FriendControllerRoutes.update);
    	app.post('/friends/phone_number_hits', validationMethod, FriendControllerRoutes.phoneNumberHits);
    }

    var applySessionRoutes = function(app) {
    	// Session
    	app.post('/session', SessionControllerRoutes.create);
    	app.post('/session/:phoneNumber/confirm_pin', SessionControllerRoutes.sessionFromPin);
    	app.post('/session/:phoneNumber/request_pin', SessionControllerRoutes.requestPin);
    	app.get('/session', SessionControllerRoutes.read);
    }

    var applyDeviceRoutes = function(app, validationMethod) {
    	// Device
    	app.post('/devices', validationMethod, DeviceControllerRoutes.create);
//    	app.post('/devices/sendnotification', validationMethod, DeviceControllerRoutes.sendNotification);
    }

    var setupRoutes = function(app, options, redisClient, middleware) {
    	if (options != undefined && 
    		options.MANDRILL_API_KEY &&
    		options.MANDRILL_CONFIRMATION_ADDRESS) {
    		UserControllerRoutes.mandrillApiKey = options.MANDRILL_API_KEY;
        	UserControllerRoutes.mandrillConfirmationAddress = options.MANDRILL_CONFIRMATION_ADDRESS;
        	UserControllerRoutes.from = options.MANDRILL_FROM;
        	UserControllerRoutes.subject = options.MANDRILL_SUBJECT;

        	UserControllerRoutes.adminAccountsEnabled = options.ADMIN_ACCOUNTS_ENABLED;
        	UserControllerRoutes.accountApprovalEnabled = options.ACCOUNT_APPROVAL_ENABLED;
        }

        if (options != undefined &&
        	options.TWILIO_ACCOUNT_SID &&
        	options.TWILIO_AUTH_TOKEN) {		
        	options.redis = redisClient;
            SessionControllerRoutes.twilio = require('twilio')(options.TWILIO_ACCOUNT_SID, options.TWILIO_AUTH_TOKEN);
            SessionControllerRoutes.twilioNumber = options.TWILIO_NUMBER;
        }

        if (middleware && middleware.before) {
        	for (var i = 0; i < middleware.before.length; i++) {
        		app.use(middleware.before[i]);
        	}
        }
        applySessionRoutes(app);
        applyUserRoutes(app, SessionControllerRoutes.validateSession);
        applyFriendRoutes(app, SessionControllerRoutes.validateSession);
        applyDeviceRoutes(app, SessionControllerRoutes.validateSession);

        if (middleware && middleware.after) {
        	for (var i = 0; i < middleware.after.length; i++) {
        		app.use(middleware.after[i]);
        	}
        }
	}

	return {
		routes: setupRoutes,
		validate: SessionControllerRoutes.validateSession,
		models: require('./models'),
		controllers: controllers,
		sendNotification: controllers.DeviceController(options).sendNotification
	}
}
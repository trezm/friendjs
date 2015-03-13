module.exports = function(options) {
    GLOBAL.config = options;

    var controllers = require('./controllers');

    var DeviceControllerRoutes = controllers.DeviceControllerRoutes;
    var FriendControllerRoutes = controllers.FriendControllerRoutes;
    var SessionControllerRoutes = controllers.SessionControllerRoutes;
    var UserControllerRoutes = controllers.UserControllerRoutes;

	var applyUserRoutes = function(app) {
	    // User
	    app.post('/users', UserControllerRoutes.create);
	    app.post('/users/:user/approve', SessionControllerRoutes.validateSession, UserControllerRoutes.approve);		
	    app.get('/users/unapproved', SessionControllerRoutes.validateSession, UserControllerRoutes.readUnapproved);			
	    app.post('/signin', UserControllerRoutes.read);
	    app.get('/users', SessionControllerRoutes.validateSession, UserControllerRoutes.readFriendInfo);
	    app.get('/confirm', UserControllerRoutes.confirm);
	}

	var applyFriendRoutes = function(app) {
    	// Friends
    	app.post('/users/:user/friend', SessionControllerRoutes.validateSession, FriendControllerRoutes.create);
    	app.get('/users/:user/friends', SessionControllerRoutes.validateSession, FriendControllerRoutes.read);
    	app.put('/friends/:friend', SessionControllerRoutes.validateSession, FriendControllerRoutes.update);
    	app.post('/friends/phone_number_hits', SessionControllerRoutes.validateSession, FriendControllerRoutes.phoneNumberHits);
    }

    var applySessionRoutes = function(app) {
    	// Session
    	app.post('/session', SessionControllerRoutes.create);
    	app.post('/session/:phoneNumber/confirm_pin', SessionControllerRoutes.sessionFromPin);
    	app.post('/session/:phoneNumber/request_pin', SessionControllerRoutes.requestPin);
    	app.get('/session', SessionControllerRoutes.read);
    }

    var applyDeviceRoutes = function(app) {
    	// Device
    	app.post('/devices', SessionControllerRoutes.validateSession, DeviceControllerRoutes.create);
        if (options.ENABLE_SENDNOTIFICATION) {
            app.post('/devices/sendnotification', SessionControllerRoutes.validateSession, DeviceControllerRoutes.sendNotification);
        }
    }

    var setupRoutes = function(app, middleware) {
        if (middleware && middleware.before) {
        	for (var i = 0; i < middleware.before.length; i++) {
        		app.use(middleware.before[i]);
        	}
        }
        applySessionRoutes(app);
        applyUserRoutes(app);
        applyFriendRoutes(app);
        applyDeviceRoutes(app);

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
		sendNotification: controllers.DeviceController.sendNotification
	}
}
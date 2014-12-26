var UserControllerRoutes;
var FriendControllerRoutes = require('./controllers/friend_controller').FriendControllerRoutes;
var SessionControllerRoutes = require('./controllers/session_controller').SessionControllerRoutes;


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
}

var applySessionRoutes = function(app) {
	// Session
	app.post('/session', SessionControllerRoutes.create);
	app.get('/session', SessionControllerRoutes.read);
}

var setupRoutes = function(app, options) {
	UserControllerRoutes = require('./controllers/user_controller').UserControllerRoutes;

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

	applySessionRoutes(app);
	applyUserRoutes(app, SessionControllerRoutes.validateSession);
	applyFriendRoutes(app, SessionControllerRoutes.validateSession);
}

module.exports = {
	routes: setupRoutes,
	validate: SessionControllerRoutes.validateSession
}
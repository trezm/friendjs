var UserControllerRoutes = require('./controllers/user_controller').UserControllerRoutes;
var FriendControllerRoutes = require('./controllers/friend_controller').FriendControllerRoutes;
var SessionControllerRoutes = require('./controllers/session_controller').SessionControllerRoutes;

var applyUserRoutes = function(app, validationMethod) {
	// User
	app.post('/users', UserControllerRoutes.create);
	app.post('/signin', UserControllerRoutes.read);
	app.get('/users', validationMethod, UserControllerRoutes.readFriendInfo);
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

var setupRoutes = function(app) {
	applySessionRoutes(app);
	applyUserRoutes(app, SessionControllerRoutes.validateSession);
	applyFriendRoutes(app, SessionControllerRoutes.validateSession);
}

module.exports.routes = setupRoutes;
module.exports.validate = SessionControllerRoutes.validateSession;

module.exports = function(mongooseHost, mongoosePort, mongooseDB) {
	var mongoose = require('mongoose');

	mongoose.connect("mongodb://" + mongooseHost + ":" + mongoosePort + "/" + mongooseDB);

	var db = mongoose.connection;
	db.on('error', console.error.bind(console, '[ERROR]'));
	db.on('open', function callback() {
	});

	return {
		routes: setupRoutes,
		validate: validateSession
	}
}
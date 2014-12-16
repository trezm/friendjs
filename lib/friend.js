var applyUserRoutes = function(app, validationMethod) 
{
	// User
	app.post('/users', UserControllerRoutes.create);
	app.post('/signin', UserControllerRoutes.read);
	app.get('/users', validationMethod, UserControllerRoutes.readFriendInfo);
}

var applyFriendRoutes = function(app, validationMethod)
{
	// Friends
	app.post('/users/:user/friend', validationMethod, FriendControllerRoutes.create);
	app.get('/users/:user/friends', validationMethod, FriendControllerRoutes.read);
	app.put('/friends/:friend', validationMethod, FriendControllerRoutes.update);
}

var setupRoutes = function(app, validationMethod)
{
	applyUserRoutes(app, validationMethod);
	applyFriendRoutes(app, validationMethod);
}

module.exports = setupRoutes;
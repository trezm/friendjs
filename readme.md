# FriendJS

[ ![Codeship Status for trezm/friendjs](https://codeship.com/projects/7c44f180-66f6-0132-d9c9-0ec4c97b952f/status?branch=master)](https://codeship.com/projects/52988)

## What is it?
FriendJS is a framework to provide user and 'friending' capabilities over a MongoDB database.  It includes support for push notifications (only APN, GCM coming soon), email confirmations (via mandrill), admin support, and approvals for user accounts.  It also can be run as a standalone server if you're inclined to keep your user information in a separate database.

## Usage
```javascript
var app = express();
//
//  Put your express config stuff here
//

var friendjs = require('friendjs')(settings); // Load the module
friendjs.routes(app); // Apply the friend routes to your app

```

This will set up your app with all of the routes necessary to make users, friending, and the rest.

## REST API

### Users
- `POST /users`: Create a new user.
Sample JSON for request:
```json
{
	"first": "Luke",
	"last": "Skywalker",
	"email": "lukey.s@jedi.com",
	"phoneNumber": "123-456-7890",
	"password": "donttellvader",
	"passwordConfirmation": "donttellvader"
}
```

- `POST /users/:user/approve`: `Needs Auth` Approves a user (must be admin)
- `GET /users/unapproved`: `Needs Auth` Gets list of as of yet unapproved users

### Sessions
- `POST /session`: Create a new session
Sample JSON for request:
```json
{
	"email": "lukey.s@jedi.com",
	"password": "donttellvader"
}
```

- `POST /session/:phoneNumber/request_pin`: Request a pin to create a session (uses TWILIO texting)
Sample JSON for request:
```json
{}
```

- `POST /session/:phoneNumber/confirm_pin`: Create a session from a received pin
Sample JSON for request:
```json
{
	"pin": "012345"
}
```
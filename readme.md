# FriendJS

[ ![Codeship Status for trezm/friendjs](https://codeship.com/projects/7c44f180-66f6-0132-d9c9-0ec4c97b952f/status?branch=master)](https://codeship.com/projects/52988)

## What is it?
FriendJS is a framework to provide user and 'friending' capabilities over a MongoDB database.  It includes support for push notifications (only APN, GCM coming soon), email confirmations (via mandrill), admin support, and approvals for user accounts.  It also can be run as a standalone server if you're inclined to keep your user information in a separate database.

## Usage
```
var app = express();
//
//  Put your express config stuff here
//

var friendjs = require('friendjs')(settings); // Load the module
friendjs.routes(app); // Apply the friend routes to your app

```

This will set up your app with all of the routes necessary to make users, friending, and the rest.

## REST API
Documentation coming soon...
var twilio;
try {
	twilio = require('twilio')(config.twilio.accountSID, config.twilio.authToken);
} catch (err) {
	if (!config.FAKE_TEXTS) {
		console.error('Couldn\'t load twilio api.  Check your twilio.accountSID and twilio.authToken:', err);
		config.FAKE_TEXTS = true;
	}
}

var sendText = function(from, to, body, callback) {
	if (config.FAKE_TEXTS) {
		callback();
	} else {
		twilio.messages.create({
			body:  body,
			to: to,
			from: from
		}, callback);
	}
}

module.exports = {
	sendText: sendText
}
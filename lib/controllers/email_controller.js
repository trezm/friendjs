var mandrill = require('mandrill-api');
var mandrillClient = new mandrill.Mandrill(config.mandrill.apiKey);

var defaultEmailHtml = function(confirmationAddress, confirmationCode) {
	var email = "To confirm your account, please follow the link:\n";
	email += "\n";
	email += confirmationAddress + "?code=" + encodeURIComponent(confirmationCode);
	return email;
}

var defaultEmailText = function(confirmationAddress, confirmationCode) {
	var email = "To confirm your account, please follow the link:\n";
	email += "\n";
	email += confirmationAddress + "?code=" + encodeURIComponent(confirmationCode);
	return email;
}

sendConfirmation = function(confirmationCode, to, from, subject) {
	var mandrillOptions = {
		html: defaultEmailHtml(config.mandrill.confirmationAddress, confirmationCode),
		text: defaultEmailText(config.mandrill.confirmationAddress, confirmationCode),
		to: to,
		subject: subject ? subject : "confirm your account",
		from_email: from.email,
		from_name: from.to
	}

	mandrillClient.messages.send({
		message: mandrillOptions,
		async: false
	},
	function(results) {
		console.log('results:', results);
	},
	function(error) {
		console.log('error:', error);
	});
}

module.exports = {
	sendConfirmation: sendConfirmation
};
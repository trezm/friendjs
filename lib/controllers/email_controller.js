var mandrill = require('mandrill-api');

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

var init = function(confirmationAddress, mandrillApiKey) {
	var mandrillClient = new mandrill.Mandrill(mandrillApiKey);
	console.log('mandrillApiKey:', mandrillApiKey);

	return {
		EmailController: {
			sendConfirmation: function(confirmationCode, to, from, subject) {
				var mandrillOptions = {
					html: defaultEmailHtml(confirmationAddress, confirmationCode),
					text: defaultEmailText(confirmationAddress, confirmationCode),
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
					}
				)
			}
		}
	}
}

module.exports = init;
module.exports = function(required, req, res) {
	if (!req || !res) {
		throw "Express Validator must have access to a req or res.";
	}

	var valid = true;
	for (key in required) {
		if (required[key] == 'required') {			
			valid = valid && (req.body[key] || req.query[key] || req.params[key] || req.headers[key]);
			if (!valid) {
				console.log('key:', key);
				break;
			}
		}
	}

	if (!valid) {
		res.json({
			error: "Correct fields were not included in the request."
		});
	}

	return valid;
}
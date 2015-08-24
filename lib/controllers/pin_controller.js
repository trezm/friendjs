var generateRealPin = function() {
	var pin = "";
	for (var i = 0; i < 6; i++) {
		pin += Math.floor(Math.random() * 10)
	}
	return pin;
};

var generateTestPin = function() {
	return '123456';
};

var generatePin = function() {
	return config.fakePins ? generateTestPin() : generateRealPin();
};

module.exports = {
	generatePin: generatePin
};
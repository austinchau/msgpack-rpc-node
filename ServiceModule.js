var sys = require('sys');

exports.substract = function(a,b) {
	sys.log('substracting ' + a + ' - ' + b);
	return a - b;
};
exports.add = function(a,b) {
	sys.log('adding ' + a + ' + ' + b);
	return a + b;
};

var sys = require('sys');

function isNum(input) {
  return typeof input == 'number';
}

exports.echo = function(str) {
  return '[echo]' + str;
};

exports.substract = function(a,b) {
  if (!isNum(a) || !isNum(b)) {
    throw('input must be a number');
  }

  return a - b;
};
exports.add = function(a,b) {
  if (!isNum(a) || !isNum(b)) {
    throw('input must be a number');
  }
  return a + b;
};

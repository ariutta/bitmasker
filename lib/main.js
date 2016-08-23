// notice bitmask here is NOT the NPM bitmask package
var Bitmask = require('bitmask');
var hashTiny = require('./hash-tiny');

function Bitmasker(bitmaskSourceData) {
  var that = this;

  var orderedTags = bitmaskSourceData.o;
  that.orderedTags = orderedTags;

  var masks = bitmaskSourceData.m;
  that.masks = masks;

  orderedTags.forEach(function(tag) {
    new Bitmask(tag);
  });
};

Bitmasker.prototype.filter = function(input, type) {
  type = type || 'any';
  var that = this;
  var orderedTags = that.orderedTags;
  var masks = that.masks;
  var hashedInput = hashTiny(input);
  var maskForHasInput = new Bitmask(hashedInput);
  return maskForHasInput.filter(masks, type, 't')
  .map(function(match) {
    return match.name;
  });
};

module.exports = Bitmasker;

var crc16 = require('js-crc').crc16;
var crc32 = require('js-crc').crc32;

module.exports = function(input) {
  return Base58.encode(crc16(input));
};

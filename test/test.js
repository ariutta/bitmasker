var _ = require('lodash');
var assert = require('assert');
var Bitmasker = require('../lib/main.js');
var fs = require('fs');
var path = require('path');

var that = this;
var parserContentTypeBitmaskerDataPath = path.join(
    __dirname,
    'input.bitmasker.json'
);
var parserContentTypeBitmaskerData = require(parserContentTypeBitmaskerDataPath);
var parserContentTypeBitmasker = new Bitmasker(parserContentTypeBitmaskerData);

assert(parserContentTypeBitmasker.filter('application/json')[0] === 'application/json');

assert(parserContentTypeBitmasker.filter('text/csv')[0] === 'text/csv');
assert(parserContentTypeBitmasker.filter('csv')[0] === 'text/csv');

assert(parserContentTypeBitmasker.filter('application/xml')[0] === 'application/xml');
assert(parserContentTypeBitmasker.filter('xml')[0] === 'application/xml');

console.log('All Pass');

//fs.unlinkSync(parserContentTypeBitmaskerDataPath);

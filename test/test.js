var _ = require('lodash');
var assert = require('assert');
var Bitmasker = require('../lib/main.js');
var fs = require('fs');
var path = require('path');

var that = this;
var bitmaskerForContentTypesDataPath = path.join(
    __dirname,
    'input.bitmasker.json'
);
var bitmaskerForContentTypesData = require(bitmaskerForContentTypesDataPath);
var bitmaskerForContentTypes = new Bitmasker(bitmaskerForContentTypesData);

assert(bitmaskerForContentTypes.filter('application/json')[0] === 'application/json');

assert(bitmaskerForContentTypes.filter('text/csv')[0] === 'text/csv');
assert(bitmaskerForContentTypes.filter('csv')[0] === 'text/csv');

assert(bitmaskerForContentTypes.filter('application/xml')[0] === 'application/xml');
assert(bitmaskerForContentTypes.filter('xml')[0] === 'application/xml');

assert(bitmaskerForContentTypes.filter('najsdfnvashbdcjvashbdc').length === 0);

console.log('All Pass');

//fs.unlinkSync(bitmaskerForContentTypesDataPath);

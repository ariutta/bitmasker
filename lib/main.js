var _ = require('lodash');
// notice bitmask here is NOT the NPM bitmask package
var Bitmask = require('bitmask');

var NAME_KEY = 'name';
var TAG_KEY = 'tag';

/**
 * Bitmasker
 *
 * @param {string[][]} synonymSets
 */
function Bitmasker(synonymSets) {
  var synonymSetPairs = _.toPairs(
      synonymSets
      .reduce(function(acc, synonyms) {
        var name = synonyms[0];
        acc[name] = acc[name] || [];
        acc[name] = _.union(synonyms)
          // I think the preferred synonym needs to be last
          .filter(function(synonym) {
            return synonym !== name;
          })
          .concat([name]);

        return acc;
      }, {})
  );

  // run ordered tags first
  var orderedTag = synonymSetPairs.reduce(function(acc, pair) {
    return acc.concat(_.reverse(pair[1]));
  }, []);
  orderedTag.forEach(function(tag) {
    new Bitmask(tag);
  });

  this.synonymToKeyBitmaskData = synonymSetPairs.map(function(pair) {
      var name = pair[0];
      var synonyms = pair[1];
      var result = {};
      result[NAME_KEY] = name;
      result[TAG_KEY] = new Bitmask(synonyms).m;
      return result;
    });
};

/**
 * filter
 *
 * @param {string|string[]} input term or terms to match
 * @param [type='any']
 * @returns {string[]} matching preferred term or terms
 */
Bitmasker.prototype.filter = function(input, type) {
  type = type || 'any';
  var that = this;
  var synonymToKeyBitmaskData = that.synonymToKeyBitmaskData;
  var inputMatchMask = new Bitmask(input);
  return inputMatchMask.filter(synonymToKeyBitmaskData, type, TAG_KEY)
    .map(function(match) {
      return match[NAME_KEY];
    });
};

/**
 * isset
 *
 * @param {string} input term to check
 * @returns {boolean} whether set or not
 */
Bitmasker.prototype.isset = function(input) {
  var that = this;
  var synonymToKeyBitmaskData = that.synonymToKeyBitmaskData;
  var inputMatchMask = new Bitmask(input);
  return inputMatchMask.filter(synonymToKeyBitmaskData, type, TAG_KEY)
    .map(function(match) {
      return match[NAME_KEY];
    });
};

module.exports = Bitmasker;

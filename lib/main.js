var mapResolver = require('./using-map');
var reduce = require('lodash/reduce');

module.exports = function(synonymSets) {
  var termCountLimit = reduce(synonymSets, function(acc, synonymSet) {
    return acc + synonymSet.length;
  }, 0);
  if (termCountLimit > 31) {
    // JS can't do bitmasking for >31 terms,
    // so as a fallback, we'll use a JS object
    // as a map.
    return mapResolver(synonymSets);
  }

  // filter using bitmasking
  var index = 1;
  function newWord() {
    var bitset = index;
    index = index << 1;
    return bitset;
  }
  var bitsetsBySynonym = reduce(synonymSets, function(acc, synonymSet) {
    return reduce(synonymSet, function(subacc, synonym) {
      subacc[synonym] = newWord();
      return subacc;
    }, acc);
  }, {});

  var termsWithMasks = reduce(synonymSets, function(acc, synonymSet) {
    var mask = reduce(synonymSet, function(runningMask, synonym) {
      return runningMask | bitsetsBySynonym[synonym];
    }, 0);
    acc.push({
      term: synonymSet[0],
      mask: mask
    });
    return acc;
  }, []);

  function resolve(inputSynonyms) {
    var inputBitset = 0;
    for (var i = 0; i < inputSynonyms.length; i++) {
      var synonym = inputSynonyms[i];
      if (bitsetsBySynonym.hasOwnProperty(synonym)) {
        inputBitset = inputBitset | bitsetsBySynonym[synonym];
      }
//      inputBitset = bitsetsBySynonym.hasOwnProperty(synonym) ?
//        (inputBitset | bitsetsBySynonym[synonym]) : inputBitset;
    }

    var term = null;
    for (var j = 0; j < termsWithMasks.length; j++) {
      var termWithMask = termsWithMasks[j];
      if (termWithMask.mask & inputBitset) {
        term = termWithMask.term;
        break;
      }
    }
    return term;
  }

  return {
    resolve: resolve
  };
}

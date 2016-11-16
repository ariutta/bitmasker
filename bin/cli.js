#!/usr/bin/env node
 
var _ = require('lodash');
var Base58 = require('base58');
// notice bitmask here is NOT the NPM bitmask package
var Bitmask = require('bitmask');
var jsCrc = require('js-crc');
var fs = require('fs');
var path = require('path');
var program = require('commander');
var pkg = require('../package.json');

var crc16 = jsCrc.crc16;
var crc32 = jsCrc.crc32;
 
program.version(pkg.version)
  .option('-P --preferred-key <preferred-key>')
  .option('-A --alternate-keys <alternate-keys>');

program
  .command('* <input-path>')
  .description('Create bitmask implementation.')
  .action(function(inputPath) {
    var preferredKey = program.preferredKey || 'preferred';
    var alternateKeys = (program.alternateKeys || 'alternates').split(',');

    var inputDir = path.dirname(inputPath);
    var filename = path.parse(inputPath).name;
    var bitmaskSourceDataPath = path.join(inputDir, filename + '.bitmasker.json');
//    if (err) {
//      console.error(err);
//      process.exit(1);
//    }

    var dataToBitmaskify = JSON.parse(fs.readFileSync(inputPath, {encoding: 'utf8'}));;

    var inputsByKey = _.toPairs(
        dataToBitmaskify
        .reduce(function(acc, dataItemToBitmaskify) {
          var name = dataItemToBitmaskify[preferredKey];
          acc[name] = acc[name] || [];
          acc[name] = _.union(
              acc[name],
              alternateKeys.reduce(function(acc, alternateKey) {
                return acc.concat(dataItemToBitmaskify[alternateKey]);
              }, [])
          )
          .filter(function(input) {
            return input !== name;
          })
          .concat([name]);
          return acc;
        }, {})
    )
    .map(function(pair) {
      var name = pair[0];
      var inputs = pair[1];
      return {
        name: name,
        inputs: inputs
      };
    });

    var seed = '16';

    var orderedTags = inputsByKey.reduce(function(acc, item) {
      return acc.concat(_.reverse(item.inputs));
    }, [])
    .map(function(x) {
      return crc16(x);
    });

    if (_.uniq(orderedTags).length !== orderedTags.length) {
      seed = '32';
      orderedTags = inputsByKey.reduce(function(acc, item) {
        return acc.concat(_.reverse(item.inputs));
      }, [])
      .map(function(x) {
        return crc32(x);
      });
    }

    if (_.uniq(orderedTags).length !== orderedTags.length) {
      throw new Error('Hash collision for inputs!');
    }

    var inputToKeyBitmaskData = inputsByKey
    .map(function(x) {
      var name = x.name;
      var inputs = x.inputs;

      return {
        n: name,
        t: Base58.encode(new Bitmask(inputs).m)
      };
    });

    fs.writeFileSync(
        bitmaskSourceDataPath,
        JSON.stringify({
          s: seed,
          o: orderedTags,
          r: inputToKeyBitmaskData
        }),
        {encoding: 'utf8'}
    );

    process.exit(0);
  });

program.parse(process.argv);

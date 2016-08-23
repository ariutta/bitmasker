#!/usr/bin/env node
 
var _ = require('lodash');
// notice bitmask here is NOT the NPM bitmask package
var Bitmask = require('bitmask');
var hashTiny = require('../lib/hash-tiny.js');
var fs = require('fs');
var path = require('path');
var program = require('commander');
var pkg = require('../package.json');
 
program.version(pkg.version)
  .option('-K --key <key>')
  .option('--alts <alts>');

program
  .command('* <input-path>')
  .description('Create bitmask implementation.')
  .action(function(inputPath) {
    var key = program.key;
    var alts = program.alts.split(',');

    var inputDir = path.dirname(inputPath);
    var filename = path.parse(inputPath).name;
    var bitmaskSourceDataPath = path.join(inputDir, filename + '.bitmasker.json');
//    if (err) {
//      console.error(err);
//      process.exit(1);
//    }

    var dataToBitmaskify = JSON.parse(fs.readFileSync(inputPath, {encoding: 'utf8'}));;

    var inputsByName = _.toPairs(
        dataToBitmaskify
        .reduce(function(acc, dataItemToBitmaskify) {
          var name = dataItemToBitmaskify[key];
          acc[name] = acc[name] || [];
          acc[name] = _.union(
              acc[name],
              alts.reduce(function(acc, alt) {
                return acc.concat(dataItemToBitmaskify[alt]);
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

    var orderedTags = inputsByName.reduce(function(acc, item) {
      return acc.concat(_.reverse(item.inputs));
    }, [])
    .map(function(x) {
      return hashTiny(x);
    });

    if (_.uniq(orderedTags).length !== orderedTags.length) {
      throw new Error('Hash collision for inputs!');
    }

    var inputToNameBitmaskMappings = inputsByName
    .map(function(x) {
      var name = x.name;
      var inputs = x.inputs;

      return {
        name: name,
        t: new Bitmask(inputs).m
      };
    });
    
    fs.writeFileSync(
        bitmaskSourceDataPath,
        JSON.stringify({
          o: orderedTags,
          m: inputToNameBitmaskMappings
        }),
        {encoding: 'utf8'}
    );

    process.exit(0);
  });

program.parse(process.argv);

#!/usr/bin/env node
 
var _ = require('lodash');
// notice bitmask here is NOT the NPM bitmask package
var Bitmask = require('bitmask');
var hashTiny = require('../lib/hash-tiny.js');
var fs = require('fs');
var path = require('path');
var program = require('commander');
var pkg = require('../package.json');
 
program.version(pkg.version);

program
  .command('* <input-path>')
  .description('Create bitmask implementation.')
  .action(function(inputPath) {
    console.log('inputPath');
    console.log(inputPath);

    var inputDir = path.dirname(inputPath);
    var filename = path.parse(inputPath).name;
    var bitmaskSourceDataPath = path.join(inputDir, filename + '.bitmasker.json');
    console.log('bitmaskSourceDataPath');
    console.log(bitmaskSourceDataPath);
//    if (err) {
//      console.error(err);
//      process.exit(1);
//    }

    var typeMappings = JSON.parse(fs.readFileSync(inputPath, {encoding: 'utf8'}));;

    var inputTypesByParser = _.toPairs(
        typeMappings
        .reduce(function(acc, typeMapping) {
          var parser = typeMapping.parser;
          acc[parser] = acc[parser] || [];
          acc[parser] = _.union(acc[parser], typeMapping.contentTypes, typeMapping.extensions)
          .filter(function(inputType) {
            return inputType !== parser;
          })
          .concat([parser]);
          return acc;
        }, {})
    )
    .map(function(pair) {
      var parser = pair[0];
      var inputTypes = pair[1];
      return {
        parser: parser,
        inputTypes: inputTypes
      };
    });

    var orderedTags = inputTypesByParser.reduce(function(acc, item) {
      return acc.concat(_.reverse(item.inputTypes));
    }, [])
    .map(function(x) {
      return hashTiny(x);
    });

    if (_.uniq(orderedTags).length !== orderedTags.length) {
      throw new Error('Hash collision for inputTypes!');
    }

    var inputTypeToParserBitmaskMappings = inputTypesByParser
    .map(function(x) {
      var parser = x.parser;
      var inputTypes = x.inputTypes;

      return {
        parser: parser,
        tags : new Bitmask(inputTypes).m
      };
    });

    
    fs.writeFileSync(
        bitmaskSourceDataPath,
        JSON.stringify({
          orderedTags: orderedTags,
          masks: inputTypeToParserBitmaskMappings
        }),
        {encoding: 'utf8'}
    );

    process.exit(0);
  });

program.parse(process.argv);

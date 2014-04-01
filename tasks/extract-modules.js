/*
 * grunt-file-writer
 * https://github.com/aboritskiy/grunt-file-writer
 *
 * Copyright (c) 2014 aboritskiy
 * Licensed under the MIT license.
 */

'use strict';
var FileParser = require('../lib/FileParser');
var FileWriter = require('../lib/FileWriter');

module.exports = function(grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('extract-modules', 'Searches for comments in HTML code and splits the code into modules.', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            separator: '\n'
        });

        var oFileModuleReference = {};

        // Iterate over all specified file groups.
        this.files.forEach(function(fileObject) {
            fileObject.src.filter(function(sFilepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(sFilepath)) {
                    grunt.log.warn('Source file "' + sFilepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function(sFilepath) {
                grunt.log.writeln('Processing page ' + sFilepath);

                var oFileParser = new FileParser(sFilepath);
                var oFileWriter = new FileWriter(oFileParser);

                oFileWriter.writeModuleData(fileObject.dest);

                oFileModuleReference[sFilepath] = [];

                for(var sModuleName in oFileParser.oGlobalModuleIndex) {
                    if (oFileParser.oGlobalModuleIndex.hasOwnProperty(sModuleName)) {
                        oFileModuleReference[sFilepath].push(sModuleName);
                    }
                }
            });
        });

        if (this.data.moduleref) {
            var sReferenceContent = '';
            for(var sFilepath in oFileModuleReference) {
                if (oFileModuleReference.hasOwnProperty(sFilepath)) {
                    sReferenceContent += '\n\nModules of ' + sFilepath;
                    var oFileModuleIndex = oFileModuleReference[sFilepath];

                    if (this.data.sortmoduleref) {
                        oFileModuleIndex.sort();
                    }
                    for (var i = 0; i < oFileModuleIndex.length; i++) {
                        sReferenceContent += '\n ' + oFileModuleIndex[i];
                    }
                }
            }
            grunt.file.write(this.data.moduleref, sReferenceContent);
        }
    });
};

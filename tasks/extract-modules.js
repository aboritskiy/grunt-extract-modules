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

        // Iterate over all specified file groups.
        this.files.forEach(function(fileObject) {
            fileObject.src.filter(function(filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function(filepath) {
                var oFileParser = new FileParser(filepath);
                var oFileWriter = new FileWriter(oFileParser);

                oFileWriter.writeModuleData(fileObject.dest);
            });
        });
    });
};

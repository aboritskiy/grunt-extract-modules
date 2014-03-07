'use strict';
var path = require('path');
var fs = require('fs');
var FileParser = require('./FileParser');
var grunt = require('grunt');

module.exports = function( oFileParser ) {
    this.writeModuleData = function (sBasePath) {
        this.writeChildModuleData(sBasePath, this.oFileParser.sBaseName, this.oFileParser.aChildNodes);
    };

    this.writeChildModuleData = function (sBasePath, sModuleName, aNodes) {
        var aChildModulesToWrite = [];
        var sFileData = '';

        for (var i = 0; i < aNodes.length; i++) {
            if (typeof aNodes[i].aChildren !== 'undefined') {
                sFileData += aNodes[i].sStartTokenText;
                aChildModulesToWrite.push(aNodes[i]);
            } else {
                sFileData += aNodes[i];
            }
        }

        // Write the destination file.
        grunt.file.write(sBasePath + sModuleName, sFileData);

        // Print a success message.
        grunt.log.writeln('Module "' + sBasePath + sModuleName + '" created.');

        for (i = 0; i < aChildModulesToWrite.length; i++) {
            this.writeChildModuleData(
                sBasePath + sModuleName + '-submodules/',
                aChildModulesToWrite[i].sModuleName + this.oFileParser.sExtension,
                aChildModulesToWrite[i].aChildren
            );
        }
    };

    this.oFileParser = oFileParser;
};

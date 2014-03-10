'use strict';
var path = require('path');
var fs = require('fs');
var Token = require('./Token');
var grunt = require('grunt');

module.exports = function( sFilePath ) {
    this.sFilePath = sFilePath;
    this.sDirName = path.dirname(sFilePath);
    this.sBaseName = path.basename(sFilePath);
    this.sExtension = path.extname(sFilePath);
    var iCurrentIndex = 0;

    this.getChildNodes = function (iLevel, sCurrentModuleTypeName) {
        var aChildNodes = [];
        if (typeof iLevel === 'undefined' || iLevel === 0) {
            iCurrentIndex = 0;
            iLevel = 0;
        }

        while (iCurrentIndex < this.aTokens.length) {
            var oCurrentToken = this.aTokens[iCurrentIndex];
            iCurrentIndex++;
            switch (oCurrentToken.sType) {
                case Token.T_TEXT:
                    aChildNodes.push(oCurrentToken.sText);
                    break;
                case Token.T_MODULE:
                    aChildNodes.push({
                        sModuleName     : oCurrentToken.oData.sModuleName,
                        sStartTokenText : oCurrentToken.sText,
                        aChildren       : this.getChildNodes(iLevel + 1, oCurrentToken.oData.sModuleTypeName)
                    });
                    break;
                case Token.T_END_OF_MODULE:
                    if ((typeof sCurrentModuleTypeName !== 'undefined') && (sCurrentModuleTypeName !== oCurrentToken.oData.sModuleTypeName)) {
                        grunt.fail.warn("Error in " + sFilePath + "\nModule mark-up error: expected end of module - " + sCurrentModuleTypeName + ', while found end of module - ' + oCurrentToken.oData.sModuleTypeName);
                    }
                    return aChildNodes;
                    break;
                case Token.T_END_OF_FILE:
                    if (iLevel > 0) {
                        grunt.fail.warn("Error in " + sFilePath + "\nUnexpected end of file.");
                    } else if (typeof sCurrentModuleTypeName !== 'undefined') {
                        grunt.fail.warn("Error in " + sFilePath + "\nUnexpected end of file. Expected end of module - " + sCurrentModuleTypeName);
                    } else {
                        return aChildNodes;
                    }
                    break;
                default:
                    grunt.fail.warn("Error in " + sFilePath + "\nUnknown token - " + oCurrentToken);
                    break;
            }
        }
    };

    this.extractTokens = function (sFileContent) {
        var sTokenRegex = Token.getRegEx();
        var aTokens = [];
        var aResult;
        var iLastIndex = 0;
        var oNewToken;

        while ((aResult = sTokenRegex.exec(sFileContent)) !== null) {
            if (aResult.index > iLastIndex) {
                var sTokenText = sFileContent.substr(iLastIndex, aResult.index - iLastIndex);
                oNewToken = new Token(Token.T_TEXT, sTokenText, this);
                aTokens.push(oNewToken);
            }

            if (typeof aResult[1] !== 'undefined') {
                oNewToken = new Token(Token.T_MODULE, aResult[0], this);
                oNewToken.oData.sModuleTypeName = aResult[1];
                oNewToken.oData.sModuleName = aResult[2];
                aTokens.push(oNewToken);
            } else {
                oNewToken = new Token(Token.T_END_OF_MODULE, aResult[0], this);
                oNewToken.oData.sModuleTypeName = aResult[3];
                oNewToken.oData.sModuleName = aResult[4];
                aTokens.push(oNewToken);
            }
            iLastIndex = aResult.index + aResult[0].length;
        }

        if (iLastIndex < (sFileContent.length - 1)) {
            var sTokenText = sFileContent.substr(iLastIndex);
            oNewToken = new Token(Token.T_TEXT, sTokenText, this);
            aTokens.push(oNewToken);
        }

        aTokens.push(new Token(Token.T_END_OF_FILE, ''), this);

        return aTokens;
    };

    this.sRawContent = fs.readFileSync(sFilePath).toString();

    this.aTokens = this.extractTokens(this.sRawContent);
    this.aChildNodes = this.getChildNodes();
};

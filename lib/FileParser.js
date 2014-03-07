'use strict';
var path = require('path');
var fs = require('fs');
var Token = require('./Token');

var extractTokens = function (sFileContent, aDOM, iLevel) {
    var sTokenRegex = Token.getRegEx();
    var aTokens = [];
    var aResult;
    var iLastIndex = 0;
    var oNewToken;

    while ((aResult = sTokenRegex.exec(sFileContent)) !== null) {
        if (aResult.index > iLastIndex) {
            var sTokenText = sFileContent.substr(iLastIndex, aResult.index - iLastIndex);
            oNewToken = new Token(Token.T_TEXT, sTokenText);
            aTokens.push(oNewToken);
        }

        if (typeof aResult[1] !== 'undefined') {
            oNewToken = new Token(Token.T_MODULE, aResult[0]);
            oNewToken.oData.sModuleName = aResult[2];
            aTokens.push(oNewToken);
        } else {
            oNewToken = new Token(Token.T_END_OF_MODULE, aResult[3]);
            oNewToken.oData.sModuleName = aResult[4];
            aTokens.push(oNewToken);
        }
        iLastIndex = aResult.index + aResult[0].length;
    }

    if (iLastIndex < (sFileContent.length - 1)) {
        var sTokenText = sFileContent.substr(iLastIndex);
        oNewToken = new Token(Token.T_TEXT, sTokenText);
        aTokens.push(oNewToken);
    }

    aTokens.push(new Token(Token.T_END_OF_FILE, ''));

    return aTokens;
};

module.exports = function( sFilepath ) {
    this.sDirName = path.dirname(sFilepath);
    this.sBaseName = path.basename(sFilepath);
    this.sExtension = path.extname(sFilepath);

    this.sRawContent = fs.readFileSync(sFilepath).toString();

    this.aTokens = extractTokens(this.sRawContent);

    var iCurrentIndex = 0;
    this.getChildNodes = function (iLevel) {
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
                        aChildren       : this.getChildNodes(iLevel + 1)
                    });
                    break;
                case Token.T_END_OF_MODULE:
                    return aChildNodes;
                    break;
                case Token.T_END_OF_FILE:
                    if (iLevel > 0) {
                        console.log("Unexpected end of file.");
                    } else {
                        return aChildNodes;
                    }
                    break;
                default:
                    console.log("Unexpected token - " + oCurrentToken);
                    break;
            }
        }
    };

    this.aChildNodes = this.getChildNodes();
};

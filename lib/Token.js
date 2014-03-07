'use strict';

var getTokenRegex = function () {
    return /<!--\s*(MODULE)\s+([a-z0-9\-_]+)\s*-->|<!--\s*(end\s+of\s+MODULE)\s+([a-z0-9\-_]+)\s*-->/mgi;
};

module.exports = function( sType, sText ) {
    this.sType = sType;
    this.sText = sText;

    this.oData = {};
};

module.exports.T_TEXT = 'text';
module.exports.T_MODULE = 'module';
module.exports.T_END_OF_MODULE = 'end of module';
module.exports.T_END_OF_FILE = 'end of file';

module.exports.getRegEx = getTokenRegex;
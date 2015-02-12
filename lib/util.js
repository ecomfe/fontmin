/**
 * @file util
 * @author junmer
 */

/* eslint-env node */

var fs = require('fs');
var path = require('path');

/**
 * getFontFolder
 *
 * @return {string} fontFolder
 */
function getFontFolder() {
    return path.resolve({
        win32: '/Windows/fonts',
        darwin: '/Library/Fonts',
        linux: '/usr/share/fonts/truetype'
    }[process.platform]);
}

/**
 * getFonts
 *
 * @param  {string} path path
 * @return {Array}      fonts
 */
function getFonts() {
    return fs.readdirSync(getFontFolder());
}


exports.getFontFolder = getFontFolder;
exports.getFonts = getFonts;

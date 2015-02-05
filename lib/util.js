/**
 * @file util
 * @author junmer
 */

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

/**
 * getFontFolder
 *
 * @return {string} fontFolder
 */
function getFontFolder() {
    return process.env.USE_SYS_FONT ? path.resolve({
        win32: '/Windows/fonts',
        darwin: '/Library/Fonts',
        linux: '/usr/share/fonts/truetype'
    }[process.platform]) : path.resolve(__dirname, '../fonts');
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

/**
 * md5
 *
 * @param  {string} text text
 * @return {string}      md5
 */
function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

exports.getFontFolder = getFontFolder;
exports.getFonts = getFonts;
exports.md5 = md5;

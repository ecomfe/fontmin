/**
 * @file util
 * @author junmer
 */

/* eslint-env node */

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

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

/**
 * getPureText
 *
 * @see https://msdn.microsoft.com/zh-cn/library/ie/2yfce773
 * @param  {string} str target text
 * @return {string}     pure text
 */
function getPureText(str) {

    return str.trim()
        .replace(/[\s]/g, '')
        // .replace(/[\f]/g, '')
        // .replace(/[\b]/g, '')
        // .replace(/[\n]/g, '')
        // .replace(/[\t]/g, '')
        // .replace(/[\r]/g, '')
        .replace(/[\u2028]/g, '')
        .replace(/[\u2029]/g, '');

}

/**
 * getUniqText
 *
 * @param  {string} str target text
 * @return {string}     uniq text
 */
function getUniqText(str) {
    return _.uniq(
        str.split('')
    ).join('');
}

exports.getFontFolder = getFontFolder;
exports.getFonts = getFonts;
exports.getPureText = getPureText;
exports.getUniqText = getUniqText;

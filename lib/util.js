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
 * @see http://www.unicode.org/charts/
 *
 * @param  {string} str target text
 * @return {string}     pure text
 */
function getPureText(str) {

    // fix space
    var emptyTextMap = {};

    function replaceEmpty (word) {
        emptyTextMap[word] = 1;
        return '';
    }

    var pureText = String(str)
        .trim()
        .replace(/[\s]/g, replaceEmpty)
        // .replace(/[\f]/g, '')
        // .replace(/[\b]/g, '')
        // .replace(/[\n]/g, '')
        // .replace(/[\t]/g, '')
        // .replace(/[\r]/g, '')
        .replace(/[\u2028]/g, '')
        .replace(/[\u2029]/g, '');

    var emptyText = Object.keys(emptyTextMap).join('');

    return pureText + emptyText;

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


/**
 * basic chars
 *
 * "!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}"
 *
 * @type {string}
 */
var basicText = String.fromCharCode.apply(this, _.range(33, 126));

/**
 * get subset text
 *
 * @param  {Object} opts opts
 * @return {string}      subset text
 */
function getSubsetText(opts) {

    var text = opts.text || '';

    // trim
    text && opts.trim && (text = getPureText(text));

    // basicText
    opts.basicText && (text += basicText);

    return getUniqText(text);
}

/**
 * string to unicodes
 *
 * @param  {string} str string
 * @return {Array}      unicodes
 */
function string2unicodes(str) {
    return str.split('').map(function (text) {
        return text.charCodeAt(0);
    });
}



exports.getFontFolder = getFontFolder;
exports.getFonts = getFonts;
exports.getPureText = getPureText;
exports.getUniqText = getUniqText;
exports.getSubsetText = getSubsetText;
exports.string2unicodes = string2unicodes;

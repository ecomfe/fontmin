/**
 * @file css
 * @author junmer
 */

/* eslint-env node */
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var isTtf = require('is-ttf');
var through = require('through2');
var replaceExt = require('replace-ext');

/**
 * tpl
 *
 * @type {string}
 */
var tpl = fs.readFileSync(
    path.resolve(__dirname, '../lib/font-face.tpl')
).toString('utf-8');

/**
 * renderCss
 *
 * @type {function}
 */
var renderCss = _.template(tpl);


/**
 * empty Transform
 *
 * @return {Object} stream.Transform instance
 */
function noopStream() {
    return through.ctor({
        objectMode: true
    });
}

/**
 * css fontmin plugin
 *
 * @param {Object} opts opts
 * @return {Object} stream.Transform instance
 * @api public
 */
module.exports = function (opts) {
    opts = opts || {};

    return through.ctor({
        objectMode: true
    }, function (file, enc, cb) {

        // check null
        if (file.isNull()) {
            cb(null, file);
            return;
        }

        // check stream
        if (file.isStream()) {
            cb(new Error('Streaming is not supported'));
        }

        // check ttf
        if (!isTtf(file.contents)) {
            cb(null, file);
            return;
        }

        // clone
        this.push(file.clone());


        file.path = replaceExt(file.path, '.css');
        var fontFile = path.basename(file.path, '.css');
        var fontInfo = {
            fontFamily: opts['font-family'] || fontFile,
            fontUri: fontFile
        };

        file.contents = new Buffer(renderCss(fontInfo));

        cb(null, file);

    });

};


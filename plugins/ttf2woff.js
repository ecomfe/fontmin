/**
 * @file ttf2woff
 * @author junmer
 */

/* eslint-env node */

var isTtf = require('is-ttf');
var through = require('through2');
var ttf2woff = require('fonteditor-ttf').ttf2woff;
var b2ab = require('b3b').b2ab;
var ab2b = require('b3b').ab2b;
var replaceExt = require('replace-ext');
var deflate = require('pako').deflate;

function compileTtf(buffer, cb) {
    var output;
    try {
        output = ab2b(
            ttf2woff(
                b2ab(buffer), {deflate: deflate}
            )
        );
    }
    catch (ex) {
        cb(ex);
    }
    cb(null, output);
}

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
 * ttf2woff fontmin plugin
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
        if (opts.clone) {
            this.push(file.clone());
        }

        // replace ext
        file.path = replaceExt(file.path, '.woff');

        compileTtf(file.contents, function (err, buffer) {

            if (err) {
                cb(err);
            }

            file.contents = buffer;
            cb(null, file);
        });

    });

};


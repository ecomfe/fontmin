/**
 * @file wawoff2
 * @author junmer
 */

/* eslint-env node */
var through = require('through2');
var replaceExt = require('replace-ext');
var extend = require('xtend');
var wawoff2 = require('wawoff2');
var arrayBufferToBuffer = require('b3b').arrayBufferToBuffer;
var isTtf = require('is-ttf');

/**
 * wawoff2 fontmin plugin
 *
 * @param {Object} opts opts
 * @return {Object} stream.Transform instance
 * @api public
 */
module.exports = function (opts) {

    opts = extend({clone: true}, opts);

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
            return;
        }

        // check ttf
        if (!isTtf(file.contents)) {
            cb(null, file);
            return;
        }

        // clone
        if (opts.clone) {
            this.push(file.clone(false));
        }

        // to woff2
        wawoff2
            .compress(file.contents)
            .then(
                function (out) {
                    file.path = replaceExt(file.path, '.woff2');
                    file.contents = arrayBufferToBuffer(out);
                    cb(null, file);
                },
                function (err) {
                    cb(err, file);
                }
            );

    });

};

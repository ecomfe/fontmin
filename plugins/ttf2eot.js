/**
 * @file ttf2eot
 * @author junmer
 */

/* eslint-env node */

var isTtf = require('is-ttf');
var through = require('through2');
var ttf2eot = require('fonteditor-ttf').ttf2eot;
var b2ab = require('b3b').b2ab;
var ab2b = require('b3b').ab2b;
var replaceExt= require('replace-ext');


function ttfBuffer2eot(buffer, cb) {
    var eotBuffer;
    try {
        eotBuffer = ab2b(ttf2eot(b2ab(buffer)));
    } catch (ex) {
        cb(ex);
    }
    cb(null, eotBuffer);
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
 * ttf2eot fontmin plugin
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

        // Fix for the vinyl clone method...
        // https://github.com/wearefractal/vinyl/pull/9
        if (opts.clone) {
            if (file.isBuffer()) {
                this.push(file.clone());
            } else {
                var cntStream = file.contents;
                file.contents = null;
                var newFile = file.clone();
                file.contents = cntStream.pipe(noopStream);
                newFile.contents = cntStream.pipe(noopStream);
                this.push(newFile);
            }
        }

        // replace ext
        file.path = replaceExt(file.path, '.eot');

        ttfBuffer2eot(file.contents, function(err, eotBuf) {

            if (err) {
                cb(err);
            }

            file.contents = eotBuf;
            cb(null, file);
        });

    });

};


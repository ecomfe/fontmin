/**
 * @file ttf2svg
 * @author junmer
 */

/* eslint-env node */

var isTtf = require('is-ttf');
var through = require('through2');
var ttf2svg = require('fonteditor-ttf').ttf2svg;
var b2ab = require('b3b').b2ab;
var replaceExt = require('replace-ext');


function compileTtf(buffer, cb) {
    var output;
    try {
        output = new Buffer(ttf2svg(b2ab(buffer)));
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
 * ttf2svg fontmin plugin
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
            }
            else {
                var cntStream = file.contents;
                file.contents = null;
                var newFile = file.clone();
                file.contents = cntStream.pipe(noopStream);
                newFile.contents = cntStream.pipe(noopStream);
                this.push(newFile);
            }
        }

        // replace ext
        file.path = replaceExt(file.path, '.svg');

        compileTtf(file.contents, function (err, buffer) {

            if (err) {
                cb(err);
            }

            file.contents = buffer;
            cb(null, file);
        });

    });

};


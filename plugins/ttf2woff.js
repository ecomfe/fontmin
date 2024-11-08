/**
 * @file ttf2woff
 * @author junmer
 */

/* eslint-env node */

import isTtf from 'is-ttf';
import through from 'through2';
import fonteditorCore from 'fonteditor-core';
import { b2ab, ab2b } from 'b3b';
import replaceExt from 'replace-ext';
import { deflate } from 'pako';
import _ from 'lodash';

function compileTtf(buffer, options, cb) {
    var output;
    var ttf2woffOpts = {};

    if (options.deflate) {
        ttf2woffOpts.deflate = function (input) {
            return deflate(Uint8Array.from(input));
        };
    }

    try {
        output = ab2b(
            // fix: have problem in some android device, close deflate
            fonteditorCore.ttf2woff(
                b2ab(buffer),
                ttf2woffOpts
            )
        );
    }
    catch (ex) {
        cb(ex);
    }

    output && cb(null, output);
}

/**
 * ttf2woff fontmin plugin
 *
 * @param {Object} opts opts
 * @return {Object} stream.Transform instance
 * @api public
 */
export default function (opts) {

    opts = _.extend({clone: true}, opts);

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

        // replace ext
        file.path = replaceExt(file.path, '.woff');

        compileTtf(file.contents, opts, function (err, buffer) {

            if (err) {
                cb(err);
                return;
            }

            file.contents = buffer;
            cb(null, file);
        });

    });

};


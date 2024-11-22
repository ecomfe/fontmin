/**
 * @file svg2ttf
 * @author junmer
 */

/* eslint-env node */

import isSvg from 'is-svg';
import through from 'through2';
import fonteditorCore from 'fonteditor-core';
import { ab2b } from 'b3b';
import replaceExt from 'replace-ext';
import _ from 'lodash';

/**
 * svg2ttf fontmin plugin
 *
 * @param {Object} opts opts
 * @return {Object} stream.Transform instance
 * @api public
 */
export default function (opts) {

    opts = _.extend({clone: true, hinting: true}, opts);

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

        // check svg
        if (!isSvg(file.contents.toString())) {
            cb(null, file);
            return;
        }

        // clone
        if (opts.clone) {
            this.push(file.clone(false));
        }

        // replace ext
        file.path = replaceExt(file.path, '.ttf');


        // ttf buffer
        var output;

        try {

            var ttfObj = fonteditorCore.svg2ttfobject(
                file.contents.toString('utf-8')
            );

            output = ab2b(new fonteditorCore.TTFWriter(opts).write(ttfObj));

        }
        catch (ex) {
            cb(ex);
        }

        if (output) {
            file.contents = output;
            cb(null, file);
        }

    });

};




/**
 * @file otf2ttf
 * @author junmer
 */

/* eslint-env node */

import isOtf from 'is-otf';
import through from 'through2';
import fonteditorCore from 'fonteditor-core';
import { b2ab, ab2b } from 'b3b';
import replaceExt from 'replace-ext';
import _ from 'lodash';
import util from '../lib/util.js';

const { otf2ttfobject, TTFWriter } = fonteditorCore;

/**
 * otf2ttf fontmin plugin
 *
 * @param {Object} opts opts
 * @return {Object} stream.Transform instance
 * @api public
 */
export default function (opts) {

    opts = _.extend({clone: false, hinting: true}, opts);

    // prepare subset
    var subsetText = util.getSubsetText(opts);
    opts.subset = util.string2unicodes(subsetText);

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

        // check otf
        if (!isOtf(file.contents)) {
            cb(null, file);
            return;
        }

        // clone
        if (opts.clone) {
            this.push(file.clone(false));
        }

        // replace ext
        file.path = replaceExt(file.path, '.ttf');

        // ttf info
        var ttfBuffer;
        var ttfObj;

        // try otf2ttf
        try {

            ttfObj = otf2ttfobject(b2ab(file.contents), opts);

            ttfBuffer = ab2b(new TTFWriter(opts).write(ttfObj));

        }
        catch (ex) {
            cb(ex);
        }

        if (ttfBuffer) {
            file.contents = ttfBuffer;
            file.ttfObject = ttfObj;
            cb(null, file);
        }

    });

};


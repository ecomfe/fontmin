/**
 * @file wawoff2
 * @author junmer
 */

/* eslint-env node */
import through from 'through2';
import replaceExt from 'replace-ext';
import _ from 'lodash';
import ttf2woff2 from 'ttf2woff2';
import isTtf from 'is-ttf';

/**
 * wawoff2 fontmin plugin
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

        // ttf2woff2
        var ouput;
        try {
            ouput = ttf2woff2(file.contents);
        }
        catch (ex) {
            cb(ex, file);
        }

        if (ouput) {
            file.path = replaceExt(file.path, '.woff2');
            file.contents = ouput;
            cb(null, file);
        }

    });

};

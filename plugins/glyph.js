/**
 * @file glyph
 * @author junmer
 */

/* eslint-env node */

var _ = require('lodash');
var isTtf = require('is-ttf');
var through = require('through2');
var TTF = require('fonteditor-core').TTF;
var TTFReader = require('fonteditor-core').TTFReader;
var TTFWriter = require('fonteditor-core').TTFWriter;
var b2ab = require('b3b').b2ab;
var ab2b = require('b3b').ab2b;
var util = require('../lib/util');

/**
 * getSubsetGlyfs
 *
 * @param  {ttfObject} ttf ttfobj
 * @param  {Array} subset subset unicode
 * @return {Array}     glyfs array
 */
function getSubsetGlyfs(ttf, subset) {

    var glyphs = [];

    var indexList = ttf.findGlyf({
        unicode: subset || []
    });

    if (indexList.length) {
        glyphs = ttf.getGlyf(indexList);
    }

    glyphs.unshift(ttf.get().glyf[0]);

    return glyphs;
}


/**
 * minifyFontObject
 *
 * @param  {Object} ttfObject    ttfObject
 * @param  {Array} subset         subset
 * @param  {Function=} plugin       use plugin
 * @return {Object}              ttfObject
 */
function minifyFontObject(ttfObject, subset, plugin) {

    // check null
    if (subset.length === 0) {
        return ttfObject;
    }

    // new TTF Object
    var ttf = new TTF(ttfObject);

    // get target glyfs then set
    ttf.setGlyf(getSubsetGlyfs(ttf, subset));

    // use plugin
    if (_.isFunction(plugin)) {
        plugin(ttf);
    }

    return ttf.get();
}


/**
 * minifyTtf
 *
 * @param  {Buffer|Object} contents         contents
 * @param  {Object} opts         opts
 * @return {Buffer}              buffer
 */
function minifyTtf(contents, opts) {

    opts = opts || {};

    var ttfobj = contents;

    if (Buffer.isBuffer(contents)) {
        ttfobj = new TTFReader(opts).read(b2ab(contents));
    }

    var miniObj = minifyFontObject(
        ttfobj,
        opts.subset,
        opts.use
    );

    var ttfBuffer = ab2b(
        new TTFWriter(opts).write(miniObj)
    );

    return {
        object: miniObj,
        buffer: ttfBuffer
    };

}


/**
 * glyph fontmin plugin
 *
 * @param {Object} opts opts
 * @param {string=} opts.text text
 * @param {boolean=} opts.basicText useBasicText
 * @param {boolean=} opts.hinting hint
 * @param {Function=} opts.use plugin
 * @return {Object} stream.Transform instance
 * @api public
 */
module.exports = function (opts) {

    opts = _.extend({hinting: true, trim: true}, opts);

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

        // check ttf
        if (!isTtf(file.contents)) {
            cb(null, file);
            return;
        }

        try {

            // write file buffer
            var miniTtf = minifyTtf(
                file.ttfObject || file.contents,
                opts
            );

            file.contents = miniTtf.buffer;
            file.ttfObject = miniTtf.object;

            cb(null, file);

        }
        catch (err) {
            cb(err);
        }

    });

};

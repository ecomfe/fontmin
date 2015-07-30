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

var getPureText = require('../lib/util').getPureText;
var getUniqText = require('../lib/util').getUniqText;

/**
 * basic chars
 *
 * "!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}"
 *
 * @type {string}
 */
var basicText = String.fromCharCode.apply(this, _.range(33, 126));

/**
 * getStringGlyfs
 *
 * @param  {ttfObject} ttf ttfobj
 * @param  {string} str target string
 * @return {Array}     glyfs array
 */
function getStringGlyfs(ttf, str) {

    var glyphs = [];

    var indexList = ttf.findGlyf({
        unicode: str.split('').map(function (s) {
            return s.charCodeAt(0);
        })
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
 * @param  {string} text         text
 * @param  {boolean} useBasicText useBasicText
 * @param  {Function=} plugin       use plugin
 * @return {Object}              ttfObject
 */
function minifyFontObject(ttfObject, text, useBasicText, plugin) {

    // check null
    if (!text) {
        return ttfObject;
    }

    // get pure text
    text = getPureText(text);

    // check null
    if (!text) {
        return ttfObject;
    }

    // uniq text
    text = getUniqText(text + (useBasicText ? basicText : ''));

    // new TTF Object
    var ttf = new TTF(ttfObject);

    // get target glyfs then set
    ttf.setGlyf(getStringGlyfs(ttf, text));

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

    var ttfobj = contents;

    if (Buffer.isBuffer(contents)) {
        ttfobj = new TTFReader(opts).read(b2ab(contents));
    }

    var miniObj = minifyFontObject(
        ttfobj,
        opts.text,
        opts.basicText,
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

    opts = _.extend({hinting: true}, opts);

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


// exports
module.exports.basicText = basicText;

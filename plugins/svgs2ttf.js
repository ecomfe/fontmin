/**
 * @file svgs2ttf
 * @author junmer
 */

/* eslint-env node */

var isSvg = require('is-svg');
var through = require('through2');
var path = require('path');
var replaceExt = require('replace-ext');
var ab2b = require('b3b').ab2b;
var _ = require('lodash');
var bufferToVinyl = require('buffer-to-vinyl');
var TTFWriter = require('fonteditor-core').TTFWriter;
var TTF = require('fonteditor-core').TTF;
var svg2ttfobject = require('fonteditor-core').svg2ttfobject;
var getEmptyttfObject = require('fonteditor-core/lib/ttf/getEmptyttfObject').default;

/**
 * SvgFont
 *
 * @constructor
 * @param {string} name filename
 * @param {Object} opts opts
 */
function SvgFont(name, opts) {

    this.opts = _.extend(
        {
            adjust: {
                leftSideBearing: 0,
                rightSideBearing: 0,
                ajdustToEmBox: true,
                ajdustToEmPadding: 0
            },
            name: {
                fontFamily: name,
                fontSubFamily: name,
                uniqueSubFamily: name,
                postScriptName: name
            }
        },
        opts
    );

    // empty ttfobj
    var ttfobj = getEmptyttfObject();

    // for save name
    ttfobj.post.format = 2;

    // new TTF
    this.ttf = new TTF(ttfobj);

    // set name
    this.ttf.setName(this.opts.name);

    // unicode start
    this.startCode = opts.startCode || 0xe001;

}

/**
 * add svg
 *
 * @param {string} name     svg basename
 * @param {buffer} contents svg contents
 */
SvgFont.prototype.add = function (name, contents) {

    var ttfObj = svg2ttfobject(
        contents.toString('utf-8'),
        {
            combinePath: true
        }
    );

    var glyf = ttfObj.glyf[0];

    glyf.name = path.basename(name, '.svg');

    if (!Array.isArray(glyf.unicode)) {
        glyf.unicode = [this.startCode++];
    }

    this.ttf.addGlyf(glyf);

};

/**
 * compile ttf contents
 *
 */
SvgFont.prototype.compile = function () {

    if (this.opts.adjust) {
        this.ttf.adjustGlyfPos(null, this.opts.adjust);
        this.ttf.adjustGlyf(null, this.opts.adjust);
    }

    this.contents = ab2b(
        new TTFWriter(
            this.opts
        )
        .write(
            this.ttf.ttf
        )
    );

};


/**
 * svgs2ttf fontmin plugin
 *
 * @param {string} file filename
 * @param {Object} opts opts
 * @param {string} opts.fontName font name
 * @return {Object} stream.Transform instance
 * @api public
 */
module.exports = function (file, opts) {

    if (!file) {
        throw new Error('Missing file option for fontmin-svg2ttf');
    }

    opts = _.extend({hinting: true}, opts);

    var firstFile;
    var fileName;
    var svgFont;

    if (typeof file === 'string') {

        // fix file ext
        file = replaceExt(file, '.ttf');

        // set file name
        fileName = file;
    }
    else if (typeof file.path === 'string') {
        fileName = path.basename(file.path);
        firstFile = bufferToVinyl.file(null, fileName);
    }
    else {
        throw new Error('Missing path in file options for fontmin-svg2ttf');
    }


    function bufferContents(file, enc, cb) {

        // ignore empty files
        if (file.isNull()) {
            cb();
            return;
        }

        // check stream
        if (file.isStream()) {
            this.emit('error', new Error('Streaming not supported'));
            cb();
            return;
        }

        // check svg
        if (!isSvg(file.contents)) {
            cb();
            return;
        }

        // set first file if not already set
        if (!firstFile) {
            firstFile = file;
        }

        // construct SvgFont instance
        if (!svgFont) {
            var fontName = opts.fontName || path.basename(fileName, '.ttf');
            svgFont = new SvgFont(fontName, opts);
        }

        // add file to SvgFont instance
        svgFont.add(file.relative, file.contents);

        cb();
    }


    function endStream(cb) {
        // no files passed in, no file goes out
        if (!firstFile || !svgFont) {
            cb();
            return;
        }

        var joinedFile;

        // if file opt was a file path
        // clone everything from the first file
        if (typeof file === 'string') {
            joinedFile = firstFile.clone({
                contents: false
            });

            joinedFile.path = path.join(firstFile.base, file);
        }
        else {
            joinedFile = firstFile;
        }

        // complie svgfont
        svgFont.compile();

        // set contents
        joinedFile.contents = svgFont.contents;
        joinedFile.ttfObject = svgFont.ttf.ttf;

        this.push(joinedFile);
        cb();
    }

    return through.obj(bufferContents, endStream);

};

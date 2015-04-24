/**
 * @file svgs2ttf
 * @author junmer
 */

/* eslint-env node */

var isSvg = require('is-svg');
var through = require('through2');
var TTFWriter = require('fonteditor-ttf').TTFWriter;
var TTF = require('fonteditor-ttf').TTF;
var svg2ttfobject = require('fonteditor-ttf').svg2ttfobject;
var ab2b = require('b3b').ab2b;
var replaceExt = require('replace-ext');
var _ = require('lodash');
var bufferToVinyl = require('buffer-to-vinyl');
var getEmptyttfObject = require('fonteditor-ttf/lib/ttf/getEmptyttfObject');
var path = require('path');


function getFileName(name){
    return name.replace(/\.(\w+)$/, '');
}

/**
 * SvgFont
 *
 * @constructor
 * @param {string} name filename
 * @param {Object} opts opts
 */
function SvgFont(name, opts) {
    this.opts = opts || {};
    this.ttf = new TTF(getEmptyttfObject());
    this.ttf.setName(
        opts.name || {
            fontFamily: name,
            fontSubFamily: name,
            uniqueSubFamily: name,
            postScriptName: name
        }
    );

    this.count = 0;
}

SvgFont.prototype.add = function (name, contents) {

    var ttfObj = svg2ttfobject(
        contents.toString('utf-8'),
        {
            combinePath: true
        }
    );

    var glyf = ttfObj.glyf[0];

    glyf.name = getFileName(name);
    glyf.unicode = glyf.unicode || [this.count++];

    console.log(glyf);

    this.ttf.addGlyf(glyf);
}

SvgFont.prototype.getContents = function () {

    // console.log(this.ttf);

    return ab2b(
        new TTFWriter(
            this.opts
        )
        .write(
            this.ttf.get()
        )
    );

}


/**
 * svgs2ttf fontmin plugin
 *
 * @param {Object} opts opts
 * @return {Object} stream.Transform instance
 * @api public
 */
module.exports = function(file, opts) {

    if (!file) {
        throw new Error('Missing file option for fontmin-svg2ttf');
    }

    opts = _.extend({hinting: true}, opts);

    var firstFile;
    var fileName;
    var svgFont;

    if (typeof file === 'string') {
        fileName = file;
    } else if (typeof file.path === 'string') {
        fileName = path.basename(file.path);
        firstFile = bufferToVinyl.file(null, fileName);
    } else {
        throw new Error('Missing path in file options for fontmin-svg2ttf');
    }


    function bufferContents(file, enc, cb) {

        // ignore empty files
        if (file.isNull()) {
            cb();
            return;
        }

        // we dont do streams (yet)
        if (file.isStream()) {
            this.emit('error', new Error('Streaming not supported'));
            cb();
            return;
        }

        // set first file if not already set
        if (!firstFile) {
            firstFile = file;
        }

        // construct SvgFont instance
        if (!svgFont) {
            svgFont = new SvgFont(getFileName(fileName), opts);
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
        } else {
            joinedFile = firstFile;
        }

        joinedFile.contents = svgFont.getContents();

        this.push(joinedFile);
        cb();
    }

    return through.obj(bufferContents, endStream);
}


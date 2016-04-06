/**
 * @file  fontmin subset
 * @author junmer
 */

/* eslint-env node */
/* global before */

var expect = require('chai').expect;

var fs = require('fs');
var path = require('path');
var clean = require('gulp-clean');
var isTtf = require('is-ttf');
var Fontmin = require('../index');

var fontName = 'SentyBrush';
var srcPath = path.resolve(__dirname, '../fonts/' + fontName + '.ttf');
var destPath = path.resolve(__dirname, '../fonts/dest_ttf');

// first mined ttf
var mined;

// first min
before(function (done) {

    // clean
    new Fontmin()
        .src(destPath)
        .use(clean())
        .run(afterClean);

    // subset first
    var fontmin = new Fontmin()
        .src(srcPath)
        .use(Fontmin.glyph({
            text: 'abcdefg'
        }))
        .dest(destPath);

    function afterClean() {
        fontmin.run(function (err, files, stream) {
            mined = files[0].contents;
            done();
        });
    }


});

describe('subset', function () {

    it('should be ok when unicodes out of subbset', function () {

        // it ttf
        expect(isTtf(mined)).to.be.ok;

    });

    it('dest should be minier ttf', function () {

        var srcFile = fs.readFileSync(srcPath);

        // minier
        expect(mined.length).to.be.below(srcFile.length);

    });

    it('subset of non-existent character shoud be ttf', function (done) {

        var destTtf = path.resolve(destPath, fontName + '.ttf');

        var fontmin = new Fontmin()
            .src(destTtf)
            .use(Fontmin.glyph({
                text: '字体里是没有中文字符的'
            }))
            .dest(destPath);

        fontmin.run(function (err, files, stream) {

            var twiceMined = files[0].contents;

            // it ttf
            expect(isTtf(twiceMined)).to.be.ok;

            done();
        });


    });


});

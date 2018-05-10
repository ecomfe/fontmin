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
var fontDir = path.resolve(__dirname, '../fonts');
var srcPath = path.resolve(fontDir, fontName + '.ttf');
var destPath = path.resolve(fontDir, 'dest_ttf');

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
            text: 'abcd   efg',
            // trim: false
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

    it('input is\'t ttf shoud be pass', function (done) {

        new Fontmin()
            .src(fontDir + '/*.html')
            .use(Fontmin.glyph({
                text: 'test'
            }))
            .run(function (err, files) {
                var ext = path.extname(files[0].path);
                expect(ext).equal('.html');
                done();
            });

    });

    it('should be ok when unicodes out of subbset', function () {

        // it ttf
        expect(isTtf(mined)).to.be.ok;

    });

    it('dest should be minier ttf', function () {

        var srcFile = fs.readFileSync(srcPath);

        // minier
        expect(mined.length).to.be.below(srcFile.length);

    });

    // it('should has whitespace when trim false', function () {

    //     var TTFReader = require('fonteditor-core').TTFReader;
    //     var b2ab = require('b3b').b2ab;
    //     var ttf = new TTFReader().read(b2ab(mined));

    //     // contain whitespace
    //     expect(ttf.cmap).to.contain.any.keys(['32', '160', '202']);

    // });

    it('should has whitespace when mixed text and whitespace', function () {

        var TTFReader = require('fonteditor-core').TTFReader;
        var b2ab = require('b3b').b2ab;
        var ttf = new TTFReader().read(b2ab(mined));

        // contain whitespace
        expect(ttf.cmap).to.contain.any.keys(['32']);

    });

    it('should support empty text', function (done) {

        new Fontmin()
            .src(srcPath)
            .use(Fontmin.glyph({
                text: ''
            }))
            .run(done);

    });

    it('should support use plugin function', function (done) {

        new Fontmin()
            .src(srcPath)
            .use(Fontmin.glyph({
                text: 'test',
                use: function (ttf) {
                    expect(ttf).to.have.any.keys('ttf');
                }
            }))
            .run(done);

    });

    it('should pass use plugin not function', function (done) {

        new Fontmin()
            .src(srcPath)
            .use(Fontmin.glyph({
                use: false
            }))
            .run(done);

    });

    it('subset of non-existent character shoud be ttf', function (done) {

        var destTtf = path.resolve(destPath, fontName + '.ttf');

        var fontmin = new Fontmin()
            .src(destTtf)
            .use(Fontmin.glyph({
                text: '字体里是没有中文字符的',
                basicText: true
            }));

        fontmin.run(function (err, files, stream) {

            var twiceMined = files[0].contents;

            // it ttf
            expect(isTtf(twiceMined)).to.be.ok;

            done();
        });


    });


});

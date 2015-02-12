/**
 * @file  fontmin test
 * @author junmer
 */

var assert = require('chai').assert;
var expect = require('chai').expect;

var fs = require('fs');
var path = require('path');
var clean = require('gulp-clean');
var isTtf = require('is-ttf');
var isEot = require('is-eot');
var isWoff = require('is-woff');
var isSvg = require('is-svg');
var Fontmin = require('../index');

var srcPath = path.resolve(__dirname, '../fonts/eduSong.ttf');
var destPath = path.resolve(__dirname, '../fonts/dest');
var destFile = destPath + '/eduSong';

var text = '细雨带风湿透黄昏的街道 抹去雨水双眼无故地仰望';

function getFile(files, ext) {
    var re = new RegExp(ext + '$');
    var vf = files.filter(function (file) {
        return re.test(file.path);
    });
    return vf[0];
}

var outputFiles;

before(function (done) {

    // clean
    Fontmin()
        .src(destPath)
        .use(clean())
        .run();

    // minfy
    var fontmin = new Fontmin()
        .src(srcPath)
        .use(Fontmin.glyph({
            text: text
        }))
        .use(Fontmin.ttf2eot({
            clone: true
        }))
        .use(Fontmin.ttf2woff({
            clone: true
        }))
        .use(Fontmin.ttf2svg({
            clone: true
        }))
        .dest(path.resolve(__dirname, '../fonts/dest/'));


    fontmin.run(function(err, files, stream) {

        if (err) {
            console.log(err);
            process.exit(-1);
        }

        outputFiles = files;
        done();
    });

});

describe('Fontmin util', function () {

    it('getFontFolder should be string', function () {
        expect(Fontmin.util.getFontFolder()).to.be.a('string');
    });

    it('getFonts should be array', function () {
        expect(Fontmin.util.getFonts()).to.be.a('array');
    });

});

describe('glyph plugin', function () {

    it('output buffer should be ttf', function () {
        assert(isTtf(getFile(outputFiles, 'ttf').contents));
    });

    it('output should miner than input', function () {
        var srcBuffer = fs.readFileSync(srcPath);
        assert(srcBuffer.length > getFile(outputFiles, 'ttf').contents.length);
    });

    it('dest file should exist', function () {
        assert(
            fs.existsSync(destFile + '.ttf')
        );
    });

    it('dest file should be ttf', function () {
        try {
            assert(
                isTtf(
                    fs.readFileSync(destFile + '.ttf')
                )
            );
        }
        catch (ex) {
            assert(false);
        }
    });

});

describe('ttf2eot plugin', function () {

    it('output buffer should be eot', function () {
        assert(isEot(getFile(outputFiles, 'eot').contents));
    });

    it('dest file should exist', function () {
        assert(
            fs.existsSync(destFile + '.eot')
        );
    });

    it('dest file should be eot', function () {
        try {
            assert(
                isEot(
                    fs.readFileSync(destFile + '.eot')
                )
            );
        }
        catch (ex) {
            assert(false);
        }
    });

});

describe('ttf2woff plugin', function () {

    it('output buffer should be woff', function () {
        assert(isWoff(getFile(outputFiles, 'woff').contents));
    });

    it('dest file should exist woff', function () {
        assert(
            fs.existsSync(destFile + '.woff')
        );
    });

    it('dest file should be woff', function () {
        try {
            assert(
                isWoff(
                    fs.readFileSync(destFile + '.woff')
                )
            );
        }
        catch (ex) {
            assert(false);
        }
    });

});

describe('ttf2svg plugin', function () {

    it('output buffer should be svg', function () {
        assert(isSvg(getFile(outputFiles, 'svg').contents));
    });

    it('dest file should exist svg', function () {
        assert(
            fs.existsSync(destFile + '.svg')
        );
    });

    it('dest file should be svg', function () {
        try {
            assert(
                isSvg(
                    fs.readFileSync(destFile + '.svg')
                )
            );
        }
        catch (ex) {
            assert(false);
        }
    });

});

/**
 * @file  fontmin node
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

var text = '春·日光'
    + '殘留的夜蹄在稀薄中消失盡'
    + '遊戲的念頭在泡影中蔓延起'
    + '美好是因為挑戰無私的天真'
    + '罪惡是因為克服背叛的恐懼';

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
        .use(Fontmin.ttf2eot())
        .use(Fontmin.ttf2woff())
        .use(Fontmin.ttf2svg())
        .use(Fontmin.css({
            glyph: true,
            base64: true,
            fontPath: './'
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

    it('output ttf should have `cvt ` table', function () {
        assert(
            isTtf(
                getFile(outputFiles, 'ttf').contents, {
                    tables: ['cvt ']
                }
            )
        );
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

describe('css plugin', function () {

    it('dest file should exist css', function () {
        assert(
            fs.existsSync(destFile + '.css')
        );
    });

    it('dest css should have "@font-face"', function() {
        try {
            expect(fs.readFileSync(destFile + '.css', {
                encoding: 'utf-8'
            })).to.have.string('@font-face');
        }
        catch (ex) {
            assert(false);
        }
    });

    it('dest css should match /\.icon-(\w+):before/', function() {
        try {
            expect(fs.readFileSync(destFile + '.css', {
                encoding: 'utf-8'
            })).to.match(/\.icon-(\w+):before/);
        }
        catch (ex) {
            assert(false);
        }
    });

    it('dest css should have fontPath "./"', function() {
        try {
            expect(fs.readFileSync(destFile + '.css', {
                encoding: 'utf-8'
            })).to.have.string('./');
        }
        catch (ex) {
            assert(false);
        }
    });


});

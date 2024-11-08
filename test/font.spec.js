/**
 * @file  fontmin font
 * @author junmer
 */

/* eslint-env node */
/* global before */

import { assert, expect } from 'chai';

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import clean from 'gulp-clean';
import isTtf from 'is-ttf';
import isOtf from 'is-otf';
import isEot from 'is-eot';
import isWoff from 'is-woff';
import isWoff2 from 'is-woff2';
import isSvg from 'is-svg';
import Fontmin from '../index.js';


var fontName = 'TpldKhangXiDictTrial';
var srcPath = url.fileURLToPath(new URL('../fonts/' + fontName + '.otf', import.meta.url));
var destPath = url.fileURLToPath(new URL('../fonts/dest', import.meta.url));
var destFile = path.resolve(destPath, fontName);

var text = ''
    + '天地玄黄    宇宙洪荒    日月盈昃    辰宿列张'
    + '寒来暑往    秋收冬藏    闰馀成岁    律吕调阳'
    + '云腾致雨    露结为霜    金生丽水    玉出昆冈'
    + '剑号巨阙    珠称夜光    果珍李柰    菜重芥姜';

function getFile(files, ext) {
    var re = new RegExp(ext + '$');
    var vf = files.filter(function (file) {
        return re.test(file.path);
    });
    return vf[0];
}

var outputFiles;

before(function (done) {

    this.timeout(5000);

    // clean
    new Fontmin()
        .src(destPath)
        .use(clean())
        .run(next);

    // minfy
    var fontmin = new Fontmin()
        .src(srcPath)
        .use(Fontmin.otf2ttf({
            text: text
        }))
        .use(Fontmin.glyph({
            text: text
        }))
        .use(Fontmin.ttf2eot())
        .use(Fontmin.ttf2woff({deflate: true}))
        .use(Fontmin.ttf2woff2())
        .use(Fontmin.ttf2svg())
        .use(Fontmin.css({
            glyph: true,
            base64: true,
            fontPath: './',
            local: true,
            fontFamily: function (font, ttf) {
                return ttf.name.fontFamily + ' - Transformed';
            }
        }))
        .dest(destPath);


    function next() {
        fontmin.runAsync().then(files => {
            outputFiles = files;
            done();
        })
        .catch (err => {
            console.log(err);
            process.exit(-1);
        });
    }

});



describe('otf2ttf plugin', function () {

    it('input should be otf', function () {

        var srcBuffer = fs.readFileSync(srcPath);
        assert(isOtf(srcBuffer));

    });

    it('output buffer should be ttf', function () {
        assert(isTtf(getFile(outputFiles, 'ttf').contents));
    });

    it('should keep source when clone true', function (done) {

        new Fontmin()
            .src(srcPath)
            .use(Fontmin.otf2ttf({clone: true, text: 't'}))
            .run(function (err, files) {
                assert.equal(files.length, 2);
                done();
            });

    });

});

describe('glyph plugin', function () {

    it('output buffer should be ttf', function () {
        assert(isTtf(getFile(outputFiles, 'ttf').contents));
    });

    // it('output ttf should have `cvt ` table', function () {
    //     assert(
    //         isTtf(
    //             getFile(outputFiles, 'ttf').contents, {
    //                 tables: ['cvt ']
    //             }
    //         )
    //     );
    // });

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

describe('ttf2woff2 plugin', function () {

    it('output buffer should be woff2', function () {
        assert(isWoff2(getFile(outputFiles, 'woff2').contents));
    });

    it('dest file should exist woff2', function () {
        assert(
            fs.existsSync(destFile + '.woff2')
        );
    });

    it('dest file should be woff2', function () {
        try {
            assert(
                isWoff2(
                    fs.readFileSync(destFile + '.woff2')
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

    it('dest css should have "@font-face"', function () {
        try {
            expect(fs.readFileSync(destFile + '.css', {
                encoding: 'utf-8'
            })).to.have.string('@font-face');
        }
        catch (ex) {
            assert(false);
        }
    });

    it('dest css should match /\.icon-(\w+):before/', function () {
        try {
            expect(fs.readFileSync(destFile + '.css', {
                encoding: 'utf-8'
            })).to.match(/\.icon-(\w+):before/);
        }
        catch (ex) {
            assert(false);
        }
    });

    it('dest css should have fontPath "./"', function () {
        try {
            expect(fs.readFileSync(destFile + '.css', {
                encoding: 'utf-8'
            })).to.have.string('./');
        }
        catch (ex) {
            assert(false);
        }
    });


    it('dest css should have local()', function () {
        try {
            expect(fs.readFileSync(destFile + '.css', {
                encoding: 'utf-8'
            })).to.have.string('local');
        }
        catch (ex) {
            assert(false);
        }
    });

    it('dest css should have transformed @font-family name', function () {

        var content = fs.readFileSync(destFile + '.css', {
            encoding: 'utf-8'
        });
        var matched = content.match(/font-family: \s*"(.*?)"/);
        var fontFamily = matched[1];

        expect(fontFamily).to.be.a('string')
            .that.match(/\s-\sTransformed$/);

    });


});

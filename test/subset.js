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

var fontName = 'FZDBSJW';
var srcPath = path.resolve(__dirname, '../fonts/' + fontName + '.ttf');
var destPath = path.resolve(__dirname, '../fonts/dest_ttf');

var text = ''
    + '天地玄黄    宇宙洪荒    日月盈昃    辰宿列张'
    + '寒来暑往    秋收冬藏    闰馀成岁    律吕调阳'
    + '云腾致雨    露结为霜    金生丽水    玉出昆冈'
    + '剑号巨阙    珠称夜光    果珍李柰    菜重芥姜';

before(function (done) {

    // clean
    new Fontmin()
        .src(destPath)
        .use(clean())
        .run(done);
});

describe('subset', function () {

    var fontmin = new Fontmin()
        .src(srcPath)
        .use(Fontmin.glyph({
            text: text
        }))
        .dest(destPath);

    it('dest should be minier ttf', function (done) {

        var srcFile = fs.readFileSync(srcPath);

        fontmin.run(function (err, files, stream) {

            var fileContent = files[0].contents;

            // it ttf
            expect(isTtf(fileContent)).to.be.ok;

            // minier
            expect(fileContent.length).to.be.below(srcFile.length);

            done();
        });

    });

});

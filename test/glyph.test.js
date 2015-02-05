/**
 * @file  glyph
 * @author junmer
 */

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var isTtf = require('is-ttf');
var Fontmin = require('../index');

var srcPath = path.resolve(__dirname, '../fonts/eduSong.ttf');
var destPath = path.resolve(__dirname, '../fonts/dest/eduSong.ttf');
var text = '细雨带风湿透黄昏的街道 抹去雨水双眼无故地仰望';
// var text = '天地玄黄 宇宙洪荒';


var fontmin = new Fontmin()
    .src(srcPath)
    .use(Fontmin.glyph({
        text: text
    }))
    .dest(path.resolve(__dirname, '../fonts/dest/'));

var outputFiles;
var outputError;

before(function(done) {
    fontmin.run(function(err, files, stream) {
        outputError = err;
        outputFiles = files;
        done();
    });
});

describe('glyph plugin', function() {

    it('should not has err', function() {
        assert(!outputError);
    });

    it('output buffer should be ttf', function() {
        assert(isTtf(outputFiles[0].contents));
    });

    it('output should miner than input', function() {
        var ttfBuffer = fs.readFileSync(srcPath);
        assert(ttfBuffer.length > outputFiles[0].contents.length);
    });

    it('dest file should exist', function() {
        assert(
            fs.existsSync(destPath)
        );
    });

    it('dest file should be ttf', function() {
        try {
            assert(
                isTtf(
                    fs.readFileSync(destPath)
                )
            );
        }
        catch (ex) {
            assert(false);
        }
    });

});

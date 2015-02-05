/**
 * @file  ttf2xxx
 * @author junmer
 */

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var isEot = require('is-eot');
var isWoff = require('is-woff');
var Fontmin = require('../index');

var srcPath = path.resolve(__dirname, '../fonts/eduSong.ttf');
var destPath = path.resolve(__dirname, '../fonts/dest/eduSong');

var text = '细雨带风湿透黄昏的街道 抹去雨水双眼无故地仰望';


function getFile(files, ext) {
    var re = new RegExp(ext + '$');
    var vf = files.filter(function(file) {
        return re.test(file.path);
    });
    return vf[0];
}

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

describe('ttf2eot plugin', function() {

    it('should not has err', function() {
        assert(!outputError);
    });

    it('output buffer should be eot', function() {
        assert(isEot(getFile(outputFiles, 'eot').contents));
    });

    it('dest file should exist', function() {
        assert(
            fs.existsSync(destPath + '.eot')
        );
    });

    it('dest file should be eot', function() {
        try {
            assert(
                isEot(
                    fs.readFileSync(destPath + '.eot')
                )
            );
        } catch (ex) {
            assert(false);
        }
    });

});

describe('ttf2woff plugin', function() {

    it('should not has err', function() {
        assert(!outputError);
    });

    it('output buffer should be woff', function() {
        assert(isWoff(getFile(outputFiles, 'woff').contents));
    });

    it('dest file should exist woff', function() {
        assert(
            fs.existsSync(destPath + '.woff')
        );
    });

    it('dest file should be woff', function() {
        try {
            assert(
                isWoff(
                    fs.readFileSync(destPath + '.woff')
                )
            );
        } catch (ex) {
            assert(false);
        }
    });

});

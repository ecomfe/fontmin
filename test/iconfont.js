/**
 * @file  fontmin iconfont
 * @author junmer
 */

var assert = require('chai').assert;
var expect = require('chai').expect;

var fs = require('fs');
var path = require('path');
var clean = require('gulp-clean');
var isTtf = require('is-ttf');
var isSvg = require('is-svg');
var Fontmin = require('../index');

var srcPath = path.resolve(__dirname, '../fonts/fontawesome-webfont.svg');
var destPath = path.resolve(__dirname, '../fonts/svg_dest');
var destFile = destPath + '/fontawesome-webfont';


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
        .use(Fontmin.svg2ttf())
        .dest(destPath);


    fontmin.run(function(err, files, stream) {

        if (err) {
            console.log(err);
            process.exit(-1);
        }

        outputFiles = files;

        done();
    });


});


describe('svg2ttf plugin', function () {

    it('output buffer should be ttf', function () {
        assert(isTtf(getFile(outputFiles, 'ttf').contents));
    });

    it('dest file should exist ttf', function () {
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

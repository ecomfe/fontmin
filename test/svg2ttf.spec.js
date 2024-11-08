/**
 * @file  fontmin svg2ttf
 * @author junmer
 */

/* eslint-env node */
/* global before */

import { assert } from 'chai';

import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import clean from 'gulp-clean';
import isTtf from 'is-ttf';
import Fontmin from '../index.js';

var srcPath = url.fileURLToPath(new URL('../fonts/fontawesome-webfont.svg', import.meta.url));
var destPath = url.fileURLToPath(new URL('../fonts/dest_svg', import.meta.url));
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
    new Fontmin()
        .src(destPath)
        .use(clean())
        .run(next);

    // minfy
    var fontmin = new Fontmin()
        .src(srcPath)
        .use(Fontmin.svg2ttf())
        .dest(destPath);


    function next() {
        fontmin.run(function (err, files, stream) {

            if (err) {
                console.log(err);
                process.exit(-1);
            }

            outputFiles = files;

            done();
        });
    }


});


describe('svg2ttf plugin', function () {

    it('input is\'t svg shoud be pass', function (done) {

        new Fontmin()
            .src(url.fileURLToPath(new URL('../fonts/*.html', import.meta.url)))
            .use(Fontmin.svg2ttf())
            .run(function (err, files) {
                var ext = path.extname(files[0].path);
                assert.equal(ext, '.html');
                done();
            });

    });

    it('should dest one when clone false', function (done) {

        new Fontmin()
            .src(srcPath)
            .use(Fontmin.svg2ttf({clone: false}))
            .run(function (err, files) {
                assert.equal(files.length, 1);
                done();
            });

    });

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

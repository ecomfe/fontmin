/**
 * @file  fontmin svgs2ttf
 * @author junmer
 */

/* eslint-env node */
/* global before */

import { assert } from 'chai';

import * as fs from 'fs';
import * as url from 'url';
import clean from 'gulp-clean';
import isTtf from 'is-ttf';
import Fontmin from '../index.js';

var srcPath = url.fileURLToPath(new URL('../fonts/svg/*.svg', import.meta.url));
var destPath = url.fileURLToPath(new URL('../fonts/dest_svgs', import.meta.url));
var destFile = destPath + '/iconfont';


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
        .use(Fontmin.svgs2ttf('iconfont.ttf'))
        .use(Fontmin.ttf2svg())
        .use(Fontmin.css({
            glyph: true
        }))
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


describe('svgs2ttf plugin', function () {

    it('should require root path', function () {
        assert.throws(Fontmin.svgs2ttf.bind(), /Missing file option/);
    });

    it('should require root path in file options', function () {
        assert.throws(
            Fontmin.svgs2ttf.bind(null, {path: null}), /file options for fontmin-svg2ttf/
        );
    });

    it('set path in file options', function (done) {

        new Fontmin()
            .src(srcPath)
            .use(Fontmin.svgs2ttf({path: 'test.ttf'}))
            .run(function (err, files) {
                assert(isTtf(files[0].contents));
                done();
            });
    });

    it('input is\'t svg shoud be exclude', function (done) {

        new Fontmin()
            .src(url.fileURLToPath(new URL('../fonts/*.html', import.meta.url)))
            .use(Fontmin.svgs2ttf('test.ttf'))
            .run(function (err, files) {
                assert.equal(files.length, 0);
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

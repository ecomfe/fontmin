#!/usr/bin/env node

/**
 * @file cli
 * @author junmer
 */

/* eslint-env node */

'use strict';

var fs = require('fs');
var meow = require('meow');
var path = require('path');
var stdin = require('get-stdin');
var Fontmin = require('./');

var cli = meow({
    help: [
        'Usage',
        '  $ fontmin <file> <directory>',
        '  $ fontmin <directory> <output>',
        '  $ fontmin <file> > <output>',
        '  $ cat <file> | fontmin > <output>',
        '',
        'Example',
        '  $ fontmin fonts/* build',
        '  $ fontmin fonts build',
        '  $ fontmin foo.ttf > foo-optimized.ttf',
        '  $ cat foo.ttf | fontmin > foo-optimized.ttf',
        '',
        'Options',
        '  -t, --text                          require glyphs by text',
        '  -b, --basic-text                    require glyphs with base chars',
        '  -f, --font-family                   font-family for @font-face CSS',
        '  -T, --show-time                     show time fontmin cost'
    ].join('\n')
}, {
    'boolean': [
        'basic-text',
        'show-time'
    ],
    string: [
        'text'
    ],
    alias: {
        t: 'text',
        b: 'basic-text',
        T: 'show-time'
    }
});

function isFile(path) {
    if (/^[^\s]+\.\w*$/.test(path)) {
        return true;
    }

    try {
        return fs.statSync(path).isFile();
    }
    catch (err) {
        return false;
    }
}


function run(src, dest) {

    cli.flags.showTime && console.time('fontmin use');

    var fontmin = new Fontmin()
        .src(src)
        .use(Fontmin.glyph(cli.flags))
        .use(Fontmin.ttf2eot({clone: true}))
        .use(Fontmin.ttf2svg({clone: true}))
        .use(Fontmin.ttf2woff({clone: true}))
        .use(Fontmin.css(cli.flags));

    if (process.stdout.isTTY) {
        fontmin.dest(dest ? dest : 'build');
    }

    fontmin.run(function (err, files) {
        if (err) {
            console.error(err.message);
            process.exit(1);
        }

        if (!process.stdout.isTTY) {
            files.forEach(function (file) {
                process.stdout.write(file.contents);
            });
        }

        cli.flags.showTime && console.timeEnd('fontmin use');
    });
}

if (process.stdin.isTTY) {
    var src = cli.input;
    var dest;

    if (!cli.input.length) {
        console.error([
            'Provide at least one file to optimize',
            '',
            'Example',
            '  fontmin font/* build',
            '  fontmin foo.ttf > foo-optimized.ttf',
            '  cat foo.ttf | fontmin > foo-optimized.ttf'
        ].join('\n'));

        process.exit(1);
    }

    if (src.length > 1 && !isFile(src[src.length - 1])) {
        dest = src[src.length - 1];
        src.pop();
    }

    src = src.map(function (s) {
        if (!isFile(s) && fs.existsSync(s)) {
            return path.join(s, '**/*');
        }

        return s;
    });

    run(src, dest);
}
else {
    stdin.buffer(run);
}

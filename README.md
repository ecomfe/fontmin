
<p align="center">
    <img height="128" width="128" src="https://raw.githubusercontent.com/ecomfe/fontmin/master/fontmin.png">
</p>

# fontmin
**Minify font seamlessly**

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads][downloads-image]][npm-url]
[![Dependencies][dep-image]][dep-url]
[![Font support][font-image]][font-url]

## Install

```sh
$ npm install --save fontmin
```

## Usage

```js
var Fontmin = require('fontmin');

var fontmin = new Fontmin()
    .src('fonts/*.ttf')
    .dest('build/fonts')

fontmin.run(function (err, files) {
    if (err) {
        throw err;
    }

    console.log(files[0]);
    // => { contents: <Buffer 00 01 00 ...> }
});
```

You can use [gulp-rename](https://github.com/hparra/gulp-rename) to rename your files:

```js
var Fontmin = require('Fontmin');
var rename = require('gulp-rename');

var fontmin = new Fontmin()
    .src('fonts/big.ttf')
    .use(rename('small.ttf'));
```

## API

### new Fontmin()

Creates a new `Fontmin` instance.

### .src(file)

Type: `Array|Buffer|String`

Set the files to be optimized. Takes a buffer, glob string or an array of glob strings
as argument.

### .dest(folder)

Type: `String`

Set the destination folder to where your files will be written. If you don't set
any destination no files will be written.

### .use(plugin)

Type: `Function`

Add a `plugin` to the middleware stack.

### .run(cb)

Type: `Function`

Optimize your files with the given settings.

#### cb(err, files, stream)

The callback will return an array of vinyl files in `files` and a Readable/Writable
stream in `stream`

## Plugins

The following plugins are bundled with fontmin:

* [glyph](#glyph) — Compress ttf by glyph.
* [ttf2eot](#ttf2eot) — Convert ttf to eot.
* [ttf2woff](#ttf2woff) — Convert ttf to woff.
* [ttf2svg](#ttf2svg) — Convert ttf to svg.

### .glyph()

Compress ttf by glyph.

```js
var Fontmin = require('fontmin');

var fontmin = new Fontmin()
    .use(Fontmin.glyph({ 
        text: '天地玄黄 宇宙洪荒'
    }));
```

### .ttf2eot()

Convert ttf to eot.

```js
var Fontmin = require('fontmin');

var fontmin = new Fontmin()
    .use(Fontmin.ttf2eot({ 
        clone: true
    }));
```

### .ttf2woff()

Convert ttf to woff.

```js
var Fontmin = require('fontmin');

var fontmin = new Fontmin()
    .use(Fontmin.ttf2woff({ 
        clone: true
    }));
```

### .ttf2svg()

Convert ttf to svg.

you can use [imagemin-svgo](https://github.com/imagemin/imagemin-svgo) to compress svg:

```js
var Fontmin = require('fontmin');
var svgo = require('imagemin-svgo');

var fontmin = new Fontmin()
    .use(Fontmin.ttf2svg({ 
        clone: true
    }));
    .use(svgo());

```

## CLI

```bash
$ npm install -g fontmin
```

```sh
$ fontmin --help

  Usage
    $ fontmin <file> <directory>
    $ fontmin <directory> <output>
    $ fontmin <file> > <output>
    $ cat <file> | fontmin > <output>

  Example
    $ fontmin fonts/* build
    $ fontmin fonts build
    $ fontmin foo.ttf > foo-optimized.ttf
    $ cat foo.ttf | fontmin > foo-optimized.ttf

  Options
    -t, --text                          require glyphs by text
    -b, --basic-text                    require glyphs with base chars
    -f, --font-family                   font-family for @font-face CSS
    -T, --show-time                     show time fontmin cost
```

you can use `curl` to generate font for websites running on PHP, ASP, Rails and more:

```sh
$ text=`curl www.baidu.com` && fontmin -t $text font.ttf
```
or you can use [html-to-text](https://www.npmjs.com/package/html-to-text) to make it smaller:

```sh
$ npm install -g html-to-text
$ text=`curl www.baidu.com | html-to-text` && fontmin -t $text font.ttf
```

what is more, you can use [phantom-fetch-cli](https://www.npmjs.com/package/phantom-fetch-cli) to generate font for `SPA` running JS template:

```sh
$ npm install -g phantom-fetch-cli
$ text=`phantom-fetch http://www.chinaw3c.org` && fontmin -t $text font.ttf
```

## Related

- [fontmin-app](https://github.com/ecomfe/fontmin-app)
- [fontmin-otf2ttf](https://github.com/junmer/fontmin-otf2ttf)
- [fonteditor](https://github.com/ecomfe/fonteditor)

## Thanks

- [imagemin](https://github.com/imagemin/imagemin)
- [free chinese font](http://zenozeng.github.io/Free-Chinese-Fonts/)
- [浙江民间书刻体][font-url]

## License

MIT © [fontmin](https://raw.githubusercontent.com/ecomfe/fontmin/master/LICENSE)


[downloads-image]: http://img.shields.io/npm/dm/fontmin.svg
[npm-url]: https://npmjs.org/package/fontmin
[npm-image]: http://img.shields.io/npm/v/fontmin.svg

[travis-url]: https://travis-ci.org/ecomfe/fontmin
[travis-image]: http://img.shields.io/travis/ecomfe/fontmin.svg

[dep-url]: https://david-dm.org/ecomfe/fontmin
[dep-image]: http://img.shields.io/david/ecomfe/fontmin.svg

[font-image]:https://img.shields.io/badge/font-eonway-blue.svg
[font-url]: http://item.taobao.com/item.htm?sche=fontmin&id=35030917699

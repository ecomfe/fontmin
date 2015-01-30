# fontmin  [![Build Status](https://travis-ci.org/junmer/fontmin.svg?branch=master)](https://travis-ci.org/junmer/fontmin)


> Minify font seamlessly


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

## thx

- [fonteditor-ttf](https://github.com/keke000/fonteditor-ttf)
- [imagemin](https://github.com/imagemin/imagemin)
- [free chinese font](https://github.com/zenozeng/Free-Chinese-Fonts)

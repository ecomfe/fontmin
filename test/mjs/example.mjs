/**
 * @file esm example
 * @author mengke01(kekee000@gmail.com)
 */
import Fontmin from 'fontmin';
import rename from 'gulp-rename';

{
    const fontmin = new Fontmin()
        .src('fonts/*.ttf')
        .dest('build/fonts');

    fontmin.run(function (err, files) {
        if (err) {
            throw err;
        }

        console.log(files[0]);
    });
}
{
    const fontmin = new Fontmin()
        .src('fonts/big.ttf')
        .use(rename('small.ttf'));
}

{
    const fontmin = new Fontmin()
        .use(Fontmin.glyph({
            text: '天地玄黄 宇宙洪荒',
            hinting: false         // keep ttf hint info (fpgm, prep, cvt). default = true
        }));
}

{
    const fontmin = new Fontmin()
        .use(Fontmin.ttf2eot());
}
{
    const fontmin = new Fontmin()
        .use(Fontmin.ttf2woff({
            deflate: true           // deflate woff. default = false
        }));
}

{
    const fontmin = new Fontmin()
        .use(Fontmin.ttf2woff2());
}


{
    const fontmin = new Fontmin()
        .use(Fontmin.css({
            fontPath: './',         // location of font file
            base64: true,           // inject base64 data:application/x-font-ttf; (gzip font with css).
                                    // default = false
            glyph: true,            // generate class for each glyph. default = false
            iconPrefix: 'my-icon',  // class prefix, only work when glyph is `true`. default to "icon"
            fontFamily: 'myfont',   // custom fontFamily, default to filename or get from analysed ttf file
            asFileName: false,      // rewrite fontFamily as filename force. default = false
            local: true             // boolean to add local font. default = false
        }));
}

{
    const fontmin = new Fontmin()
        .use(Fontmin.css({
            // ...
            fontFamily: function(fontInfo, ttf) {
                return "Transformed Font Family Name"
            },
            // ...
        }));
}

{
    const fontmin = new Fontmin()
        .src('font.svg')
        .use(Fontmin.svg2ttf());
}

{
    const fontmin = new Fontmin()
        .src('svgs/*.svg')
        .use(Fontmin.svgs2ttf('font.ttf', {fontName: 'iconfont'}))
        .use(Fontmin.css({
            glyph: true
        }));
}

{
    const fontmin = new Fontmin()
        .src('fonts/*.otf')
        .use(Fontmin.otf2ttf());
}

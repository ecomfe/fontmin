/**
 * @file fontmin
 * @author kekee000(kekee000@gmail.com)
 */
import {Transform} from 'stream';
import {TTF} from 'fonteditor-core'

type PluginDesc = (...args: any[]) => Transform;
type InternalPlugin<T extends Record<string, any> = {}> = (opts?: T) => PluginDesc;

interface GlyphPluginOptions {
    /**
     * use this text to generate compressed font
     */
    text: string;
    /**
     * add basic chars to glyph, default false
     * @example "!"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}"
     */
    basicText?: boolean;
    /**
     * keep gylph hinting, defaul true
     */
    hinting?: boolean;
    /**
     * use other plugin
     */
    use?: PluginDesc;
}

interface FontInfo {
    fontFile: string;
    fontPath: string;
    base64: string;
    glyph: boolean;
    iconPrefix: string;
    local: boolean;
}

interface CssPluginOptions {
    /**
     * generate class for each glyph. default = false
     */
    glyph?: boolean;
    /**
     *  inject base64 data:application/x-font-ttf; (gzip font with css). default = false
     */
    base64?: boolean;
    /**
     * class prefix, only work when glyph is `true`. default = "icon"
     */
    iconPrefix?: string;
    /**
     * rewrite fontFamily from filename force. default = false
     */
    asFileName?: boolean;
    /**
     * location of font file
     */
    fontPath?: string;
    /**
     * custom fontFamily, default = ttf.fontFamily or filename
     *
     * if opts.fontFamily is funciton, then fontFamily will be function return value
     */
    fontFamily?: string | ((fontInfo: FontInfo, ttf: TTF.TTFObject) => string);
    /**
     *  add local font. default = false
     */
    local?: boolean;
}

interface Svgs2ttfPluginOptions {
    /**
     * set svg font name
     */
    fontName?: string;
}

declare namespace Fontmin {
    /*
     * get font subset with giving text
     */
    const glyph: InternalPlugin<GlyphPluginOptions>;

    /*
     * convert ttf to eot
     */
    const ttf2eot: InternalPlugin;

    /*
     * convert ttf to woff
     */
    const ttf2woff: InternalPlugin<{
        /**
         * use deflate to transform woff, default false
         */
        deflate: boolean;
    }>;

    /*
     * convert ttf to woff2
     */
    const ttf2woff2: InternalPlugin;

    /*
     * convert ttf to svg text
     */
    const ttf2svg: InternalPlugin;

    /*
     * Generate css from ttf, often used to make iconfont.
     */
    const css: InternalPlugin<CssPluginOptions>;

    /**
     * convert font format svg to ttf
     */
    const svg2ttf: InternalPlugin<{hinting?: boolean}>;

    /**
     * concat svg files to a ttf, just like css sprite
     */
    const svgs2ttf: (file: string, opts?: Svgs2ttfPluginOptions) => PluginDesc;

    /**
     * convert otf to ttf
     */
    const otf2ttf: InternalPlugin;
}

type PluginNames = keyof typeof Fontmin;

declare class Fontmin {
    static plugins: PluginNames[];
    /**
     * Get or set the source files
     * @param file files to be optimized
     */
    src(src: ArrayLike<number> | Buffer | string): this;
    /**
     * Get or set the destination folder
     * @param dir folder to written
     */
    dest(dest: string): this;

    /**
     * Add a plugin to the middleware stack
     * @param plugin plugin function
     */
    use(plugin: PluginDesc): this;

    /**
     * run Optimize files with callback
     * @param callback plugin function
     */
    run(callback: (e: Error, files: Buffer[]) => void): Transform;

    /**
     * run Optimize files with return Promise
     */
    runAsync(): Promise<Buffer[]>;
}

export default Fontmin;

export const mime:  {
    '.*': 'application/octet-stream',
    'ttf': 'application/font-sfnt',
    'otf': 'application/font-sfnt',
    'woff': 'application/font-woff',
    'woff2': 'application/font-woff2',
    'eot': 'application/octet-stream',
    'svg': 'image/svg+xml',
    'svgz': 'image/svg+xml'
};

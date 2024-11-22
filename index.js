/**
 * @file fontmin
 * @author junmer
 */

/* eslint-env node */

import combine from 'stream-combiner';
import concat from 'concat-stream';
import { EventEmitter } from 'events';
import { inherits } from 'util';
import * as bufferToVinyl from 'buffer-to-vinyl';
import vfs from 'vinyl-fs';

import * as util from './lib/util.js';
import mime from './lib/mime-types.js';

import glyph from './plugins/glyph.js';
import ttf2eot from './plugins/ttf2eot.js';
import ttf2woff from './plugins/ttf2woff.js';
import ttf2woff2 from './plugins/ttf2woff2.js';
import ttf2svg from './plugins/ttf2svg.js';
import css from './plugins/css.js';
import svg2ttf from './plugins/svg2ttf.js';
import svgs2ttf from './plugins/svgs2ttf.js';
import otf2ttf from './plugins/otf2ttf.js';

/**
 * Initialize Fontmin
 *
 * @constructor
 * @api public
 */
function Fontmin() {
    if (!(this instanceof Fontmin)) {
        return new Fontmin();
    }

    EventEmitter.call(this);
    this.streams = [];
}

/**
 * Inherit from `EventEmitter`
 * @type {Class}
 */
inherits(Fontmin, EventEmitter);

/**
 * Get or set the source files
 *
 * @param {Array|Buffer|string} file files to be optimized
 * @return {Object} fontmin
 * @api public
 */
Fontmin.prototype.src = function (file) {
    if (!arguments.length) {
        return this._src;
    }

    this._src = arguments;
    return this;
};

/**
 * Get or set the destination folder
 *
 * @param {string} dir folder to written
 * @return {Object} fontmin
 * @api public
 */
Fontmin.prototype.dest = function (dir) {
    if (!arguments.length) {
        return this._dest;
    }

    this._dest = arguments;
    return this;
};

/**
 * Add a plugin to the middleware stack
 *
 * @param {Function} plugin plugin
 * @return {Object} fontmin
 * @api public
 */
Fontmin.prototype.use = function (plugin) {
    this.streams.push(typeof plugin === 'function' ? plugin() : plugin);
    return this;
};

/**
 * Optimize files
 *
 * @param {Function} cb callback
 * @return {Stream} file stream
 * @api public
 */
Fontmin.prototype.run = function (cb) {
    cb = cb || function () {};

    var stream = this.createStream();

    stream.on('error', cb);
    stream.pipe(concat(cb.bind(null, null)));

    return stream;
};

/**
 * run Optimize files with return Promise
 *
 * @return {Array<Buffer>} file result
 * @api public
 */
Fontmin.prototype.runAsync = function () {
    return new Promise((resolve, reject) => {
        var stream = this.createStream();
        stream.on('error', reject);

        stream.pipe(concat(resolve));
    });
};


/**
 * Create stream
 *
 * @return {Stream} file stream
 * @api private
 */
Fontmin.prototype.createStream = function () {
    this.streams.unshift(this.getFiles());

    if (this.streams.length === 1) {
        this.use(Fontmin.otf2ttf());
        this.use(Fontmin.ttf2eot());
        this.use(Fontmin.ttf2woff());
        this.use(Fontmin.ttf2woff2());
        this.use(Fontmin.ttf2svg());
        this.use(Fontmin.css());
    }

    if (this.dest()) {
        this.streams.push(
            vfs.dest.apply(vfs, this.dest())
        );
    }

    return combine(this.streams);
};

/**
 * Get files
 *
 * @return {Stream} file stream
 * @api private
 */
Fontmin.prototype.getFiles = function () {

    if (Buffer.isBuffer(this._src[0])) {
        return bufferToVinyl.stream(this._src[0]);
    }

    var [src, options] = this.src();
    return vfs.src(src, {encoding: false, ...options});
};

/**
 * plugins
 *
 * @type {Array}
 */
Fontmin.plugins = [
    'glyph',
    'ttf2eot',
    'ttf2woff',
    'ttf2woff2',
    'ttf2svg',
    'css',
    'svg2ttf',
    'svgs2ttf',
    'otf2ttf'
];

// export pkged plugins
Fontmin.glyph = glyph;
Fontmin.ttf2eot = ttf2eot;
Fontmin.ttf2woff = ttf2woff;
Fontmin.ttf2woff2 = ttf2woff2;
Fontmin.ttf2svg = ttf2svg;
Fontmin.css = css;
Fontmin.svg2ttf = svg2ttf;
Fontmin.svgs2ttf = svgs2ttf;
Fontmin.otf2ttf = otf2ttf;

/**
 * Module exports
 */

export { util, mime };
export default Fontmin;
Fontmin.util = util;
Fontmin.mime = mime;

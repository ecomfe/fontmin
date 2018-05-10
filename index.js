/**
 * @file fontmin
 * @author junmer
 */

/* eslint-env node */

var combine = require('stream-combiner');
var concat = require('concat-stream');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var bufferToVinyl = require('buffer-to-vinyl');
var vfs = require('vinyl-fs');

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

    return vfs.src.apply(vfs, this.src());
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
Fontmin.plugins.forEach(function (plugin) {
    Fontmin[plugin] = require('./plugins/' + plugin);
});

/**
 * Module exports
 */
module.exports = Fontmin;

// exports util, mime
module.exports.util = exports.util = require('./lib/util');
module.exports.mime = exports.mime = require('./lib/mime-types');

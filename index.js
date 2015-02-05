/**
 * @file fontmin
 * @author junmer
 */

/* eslint-env node */

var combine = require('stream-combiner');
var concat = require('concat-stream');
var EventEmitter = require('events').EventEmitter;
var File = require('vinyl');
var fs = require('vinyl-fs');
var inherits = require('util').inherits;
var through = require('through2');

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
 * @param {Array|Buffer|String} file files to be optimized
 * @return {Object} fontmin
 * @api public
 */
Fontmin.prototype.src = function (file) {
    if (!arguments.length) {
        return this._src;
    }

    this._src = file;
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

    this._dest = dir;
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

    if (!this.streams.length) {
        this.use(Fontmin.glyph());
    }

    this.streams.unshift(this.read(this.src()));

    if (this.dest()) {
        this.streams.push(fs.dest(this.dest()));
    }

    var pipe = combine(this.streams);
    var end = concat(function (files) {
        cb(null, files, pipe);
    });

    pipe.on('data', this.emit.bind(this, 'data'));
    pipe.on('end', this.emit.bind(this, 'end'));
    pipe.on('error', cb);
    pipe.pipe(end);

    return pipe;
};

/**
 * Read the source file
 *
 * @param {Array|Buffer|String} src files
 * @return {Stream} file stream
 * @api private
 */
Fontmin.prototype.read = function (src) {
    if (Buffer.isBuffer(src)) {
        var stream = through.obj();

        stream.end(new File({
            contents: src
        }));

        return stream;
    }

    return fs.src(src);
};


/**
 * Module exports
 */

module.exports = Fontmin;

// export pkged plugins

[
    'glyph',
    'ttf2eot',
    'ttf2woff'
    // 'ttf2svg'
].forEach(function (plugin) {
    module.exports[plugin] = require('./plugins/' + plugin);
});

// export optional plugins
//
// [
//     'glyph',
// ].forEach(function (plugin) {
//     module.exports[plugin] = optional('fontmin-' + plugin) || function () {
//         return through.ctor({ objectMode: true });
//     };
// });


// todo
// move to independent project
module.exports.connect = exports.middleware = require('./lib/middleware');

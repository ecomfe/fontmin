/**
 * @file middleware
 * @author junmer
 */

var path = require('path');
var util = require('./util');
var mimeTypes = require('./mime-types');
var Fontmin = require('../index');

/**
 * connect middleware generator
 *
 * @param  {Object} options   connect options
 * @return {Function}         connect middleware
 */
function connect(options) {

    options = options || {};
    var folder = options.fontFolder || util.getFontFolder();
    var fontName = options.fontName || 'Helvetica';
    var fontUrl = path.resolve(folder, fontName);


    return function(req, res, next) {

        var text = req.query.text;

        var fontSource = req.params.fontSource;

        if (fontSource) {
            fontUrl = path.resolve(folder, fontSource);
        }

        var extname = path.extname(fontUrl);

        res.set('Content-Type', mimeTypes[extname] || mimeTypes['.*']);

        var fontmin = new Fontmin()
            .src(fontUrl)
            .use(Fontmin.glyph({ text: text }));

        fontmin.run(function(err, files, stream) {

            if (err) {
                res.end('error');
            }

            stream.pipe(res);
            stream.on('end', res.end.bind(res));
        });


    };

}

exports.connect = connect;

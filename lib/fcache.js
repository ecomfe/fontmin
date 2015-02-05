/**
 * @file util
 * @author junmer
 */


var fs = require('fs');
var path = require('path');

var fcacheDir = path.resolve(require('os').tmpdir(), '.fontmin');

console.log(fcacheDir);

// init
if (!fs.existsSync(fcacheDir)) {
    fs.mkdirSync(fcacheDir);
}

function getDir(name) {
    return path.resolve(fcacheDir, name);
}

function hasFile(name) {
    return fs.existsSync(getDir(name));
}

function getFile(name) {
    if (!hasFile(name)) {
        return;
    }
    return fs.readFileSync(getDir(name));
}

function setFile(name, buf, opts) {
    opts = opts || {};
    if (!name || !buf) {
        return;
    }

    console.log(getDir(name));
    return fs.writeFileSync(getDir(name), buf, opts);
}

exports.get = getFile;
exports.has = hasFile;
exports.set = setFile;

var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');

var bin = path.resolve(path.join(__dirname, '/../cli'));

var run = function (args, onErr, onEnd) {
  var child = spawn('node', [bin].concat(args), { cwd: __dirname });
  var data = '';
  var err = '';

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function (chunk) {
    data += chunk;
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function (chunk) {
    err += chunk;
  });

  child.on('close', function (code) {
    if (err) {
      if (onErr) {
        onErr(err);
      } else {
        throw err;
      }
    } else {
      onEnd(code, data);
    }
  });

  return child;
};

describe('CLI', function () {
  it('should run', function (done) {
    run([]);
  });
});

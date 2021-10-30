import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

var dirname = path.dirname((new URL(import.meta.url)).pathname);

var bin = path.resolve(path.join(dirname, '/../cli.js'));

var run = function (args, onErr, onEnd) {
  var child = spawn('node', [bin].concat(args), { cwd: dirname });
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
    var child = run([], function (err) {
      throw err;
    }, function () {
      done();
    });

    setTimeout(function () {
      child.kill();
    }, 500);
  });
});

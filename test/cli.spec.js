/**
 * @file fontmin cli
 */

/* eslint-env node */

import { expect } from 'chai';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import * as url from 'node:url';

const root = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'cli.js');
const font = path.join(root, 'fonts', 'Helvetica.ttf');

function runCli(args, input) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [cli, ...args], {
            cwd: root,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        const stdout = [];
        const stderr = [];

        child.stdout.on('data', data => stdout.push(data));
        child.stderr.on('data', data => stderr.push(data));
        child.once('error', reject);
        child.once('close', code => resolve({
            code,
            stdout: Buffer.concat(stdout),
            stderr: Buffer.concat(stderr)
        }));
        child.stdin.end(input);
    });
}

describe('fontmin cli', function () {

    this.timeout(30000);

    it('processes a font piped on stdin', async function () {
        const result = await runCli([], await readFile(font));

        expect(result.code).to.equal(0);
        expect(result.stderr).to.have.length(0);
        expect(result.stdout).to.have.length.greaterThan(0);
    });

    it('uses file arguments when stdin is not a TTY', async function () {
        const output = await mkdtemp(path.join(os.tmpdir(), 'fontmin-cli-'));

        try {
            const result = await runCli([font, output]);

            expect(result.code).to.equal(0);
            expect(result.stderr).to.have.length(0);
        }
        finally {
            await rm(output, {recursive: true, force: true});
        }
    });

});

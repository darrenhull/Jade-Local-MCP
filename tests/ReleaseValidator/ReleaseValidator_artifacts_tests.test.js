import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {ReleaseValidator} from '../../src/ReleaseValidator.js';

const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jade-mcp-artifact-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const source = path.join(root, 'packages/jade-cli-win-x64');
  const output = path.join(root, 'dist/jade-mcp-win-x64');
  fs.mkdirSync(path.join(source, 'native'), {recursive: true});
  fs.mkdirSync(path.join(root, 'bin'));
  fs.mkdirSync(output, {recursive: true});
  fs.writeFileSync(path.join(root, 'bin/jade-mcp.js'), 'server');
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({version: '0.3.2', bin: {'jade-mcp': 'bin/jade-mcp.js'}, dependencies: {'@modelcontextprotocol/server': '2.4.0'}}));
  fs.writeFileSync(path.join(source, 'jade-cli.exe'), 'native');
  const runtimeFiles = {};
  for (const name of ['jade-test-helper.exe', 'jade-native-helper.exe', 'jade-debug-helper.exe', 'jade-inspect-helper.exe', 'debugger-abi.json']) {
    fs.writeFileSync(path.join(source, 'native', name), name);
    runtimeFiles['native/' + name] = hash(name);
  }
  const nativeManifest = {formatVersion: 2, runtime: 'native-cpp', platform: 'win32', arch: 'x64', packageVersion: '0.3.1', executable: 'jade-cli.exe', executableSha256: hash('native'), runtimeFiles};
  const officialBytes = JSON.stringify(nativeManifest, null, 2).replaceAll('\n', '\r\n') + '\r\n';
  fs.writeFileSync(path.join(source, 'distribution.json'), officialBytes);
  fs.writeFileSync(path.join(root, 'packages/jade-cli-pin.json'), JSON.stringify({version: '0.3.1', tag: 'v0.3.1', sha256: 'a'.repeat(64), distributionSha256: hash(officialBytes)}));
  fs.cpSync(source, path.join(output, 'native'), {recursive: true});
  fs.writeFileSync(path.join(output, 'jade-mcp.exe'), 'adapter');
  fs.writeFileSync(path.join(root, 'jade-mcp.exe'), 'adapter');
  fs.writeFileSync(path.join(root, 'dist/jade-mcp-win-x64.zip'), 'archive');
  const saveWrapper = () => fs.writeFileSync(path.join(output, 'distribution.json'), JSON.stringify({packageVersion: '0.3.2', executable: 'jade-mcp.exe', executableSha256: hash('adapter'), runtimeFiles: {'native/distribution.json': hash(fs.readFileSync(path.join(output, 'native/distribution.json')))}}));
  saveWrapper();
  return {root, output, saveWrapper};
}

test('artifact validation accepts the exact pinned native release manifest', t => {
  const f = fixture(t);
  assert.equal(new ReleaseValidator(f.root).verifyArtifacts().length, 2);
});

test('artifact validation rejects reformatted native metadata even when wrapper hashes agree', t => {
  const f = fixture(t);
  const file = path.join(f.output, 'native/distribution.json');
  fs.writeFileSync(file, JSON.stringify(JSON.parse(fs.readFileSync(file, 'utf8')), null, 2) + '\n');
  f.saveWrapper();
  assert.throws(() => new ReleaseValidator(f.root).verifyArtifacts(), /manifest.*receipt/i);
  assert.equal(fs.existsSync(path.join(f.root, 'dist/SHA256SUMS')), false);
});

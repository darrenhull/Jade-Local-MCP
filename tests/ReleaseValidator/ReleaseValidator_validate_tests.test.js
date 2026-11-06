import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {ReleaseValidator} from '../../src/ReleaseValidator.js';
function fixture(t){const root=fs.mkdtempSync(path.join(os.tmpdir(),'jade-mcp-release-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));fs.mkdirSync(path.join(root,'bin'));fs.mkdirSync(path.join(root,'packages'));fs.writeFileSync(path.join(root,'bin/jade-mcp.js'),'server');fs.writeFileSync(path.join(root,'packages/cli.tgz'),'release');const manifest={name:'@jade-local-tools/mcp-server',version:'0.1.0',bin:{'jade-mcp':'bin/jade-mcp.js'},dependencies:{'@modelcontextprotocol/server':'2.4.0','jade-tools-cli':'file:packages/cli.tgz'}};fs.writeFileSync(path.join(root,'package.json'),JSON.stringify(manifest));return {root,manifest};}
test('a matching tag accepts a runnable server package and mismatched tags fail',t=>{const {root}=fixture(t),validator=new ReleaseValidator(root);assert.equal(validator.validate('v0.1.0').version,'0.1.0');assert.throws(()=>validator.validate('v0.2.0'),/tag/i);});
test('placeholder releases or missing pinned CLI payloads fail before publication',t=>{const {root,manifest}=fixture(t);manifest.version='0.0.0';fs.writeFileSync(path.join(root,'package.json'),JSON.stringify(manifest));assert.throws(()=>new ReleaseValidator(root).validate('v0.0.0'),/placeholder|version/i);manifest.version='0.1.0';fs.writeFileSync(path.join(root,'package.json'),JSON.stringify(manifest));fs.unlinkSync(path.join(root,'packages/cli.tgz'));assert.throws(()=>new ReleaseValidator(root).validate('v0.1.0'),/CLI/i);});

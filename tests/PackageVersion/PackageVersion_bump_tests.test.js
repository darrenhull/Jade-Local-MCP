import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
const {bumpConsumerVersion}=createRequire(import.meta.url)('../../scripts/bump-consumer-version.cjs');
test('a dependency update bumps both MCP manifests once and preserves their CRLF formatting',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'jade-mcp-version-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for(const [file,value]of [['package.json',{version:'0.2.0'}],['package-lock.json',{version:'0.2.0',packages:{'':{version:'0.2.0'}}}]])fs.writeFileSync(path.join(root,file),JSON.stringify(value,null,2).replace(/\n/g,'\r\n')+'\r\n');
 assert.equal(bumpConsumerVersion(root),'0.2.1');
 for(const file of ['package.json','package-lock.json']){const text=fs.readFileSync(path.join(root,file),'utf8');assert.equal(JSON.parse(text).version,'0.2.1');assert.ok(text.includes('\r\n'));assert.doesNotMatch(text,/(?<!\r)\n/);}
 assert.equal(JSON.parse(fs.readFileSync(path.join(root,'package-lock.json'))).packages[''].version,'0.2.1');
});

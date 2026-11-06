import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {TestRunner} from '../../scripts/TestRunner.js';
test('stages verified native payload before selecting and executing every test group',t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'jade-mcp-test-runner-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 for(const name of ['tests/Example/Example_run_tests.test.js','build-tools/tests/Tool/Tool_run_tests.test.js']){const file=path.join(root,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'');}
 const calls=[];
 const runner=new TestRunner({root,stage:()=>{calls.push('stage');},spawn:(exe,args,options)=>{calls.push('tests');assert.deepEqual(calls,['stage','tests']);assert.equal(args.filter(arg=>arg.endsWith('_tests.test.js')).length,2);assert.ok(args.includes('--test-concurrency=2'));assert.equal(options.env.JADE_MCP_NATIVE_TESTS,undefined);assert.equal(options.env.JADE_MCP_STANDALONE_EXE,'portable.exe');return {status:0};},env:{JADE_MCP_NATIVE_TESTS:'1',JADE_MCP_STANDALONE_EXE:'portable.exe'}});
 assert.equal(runner.run(),0);
});
test('rejects an invalid native payload before any test process starts',()=>{
 let spawned=false;
 const runner=new TestRunner({stage:()=>{throw Error('Native checksum mismatch');},spawn:()=>{spawned=true;return {status:0};}});
 assert.throws(()=>runner.run(),/checksum/);
 assert.equal(spawned,false);
});

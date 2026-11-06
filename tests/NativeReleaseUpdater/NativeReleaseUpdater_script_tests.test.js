import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const directory=path.dirname(fileURLToPath(import.meta.url));
for(const name of ['update','download','repair','poll'])test('MCP-owned native release updater '+name+' contracts',()=>{
 const result=spawnSync('pwsh',['-NoProfile','-NonInteractive','-File',path.join(directory,'NativeReleaseUpdater_'+name+'_tests.ps1')],{encoding:'utf8',windowsHide:true,shell:false,timeout:120000});
 assert.ifError(result.error);assert.equal(result.status,0,result.stdout+'\n'+result.stderr);assert.match(result.stdout,/PASS NativeReleaseUpdater/);
});

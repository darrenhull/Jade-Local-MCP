import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {TemporaryWorkspace} from '../../scripts/TemporaryWorkspace.js';

test('test workspace removal tolerates a brief Windows file handle left during teardown',{skip:process.platform!=='win32'},async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'jade-mcp-teardown-')),file=path.join(root,'owned.lock');fs.writeFileSync(file,'private fixture');
 const child=spawn('pwsh',['-NoProfile','-NonInteractive','-Command','$file=[IO.File]::Open($env:JADE_OWNED_LOCK_FILE,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::None);try{[Console]::WriteLine("locked");Start-Sleep -Milliseconds 350}finally{$file.Dispose()}'],{env:{...process.env,JADE_OWNED_LOCK_FILE:file},windowsHide:true,stdio:['ignore','pipe','pipe']});
 const closed=once(child,'close');let stderr='';child.stderr.on('data',bytes=>stderr+=bytes);
 try{await once(child.stdout,'data');assert.doesNotThrow(()=>TemporaryWorkspace.remove(root));assert.equal(fs.existsSync(root),false);}finally{await closed;fs.rmSync(root,{recursive:true,force:true,maxRetries:10,retryDelay:50});}
 assert.equal(child.exitCode,0,stderr);
});

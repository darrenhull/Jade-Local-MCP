import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {NativeDistribution} from '../../src/NativeDistribution.js';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function fixture(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'jade-mcp-jox-runtime-')),source=path.join(root,'runtime');fs.mkdirSync(source);
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const manifest={formatVersion:2,runtime:'native-cpp',platform:'win32',arch:'x64',packageVersion:'0.11.10',sourceFormats:['jox'],oidFormat:'jade-native',executable:'jade-cli.exe',executableSha256:hash('cli'),runtimeFiles:{},joxRuntime:{format:1,characterSet:'unicode',engineCommit:'a'.repeat(40),managedUpload:true,nativeTests:true,initialization:true,nativeScratch:false,variants:{ansi:{format:1,characterSet:'ansi',managedUpload:true,nativeTests:true,initialization:true,nativeScratch:true,nativeDebug:true}}}};
 const names=['jade-inspect-helper.exe','jade-inspect-helper-ansi.exe','jade-inspect-helper-unicode.exe','jade-debug-helper.exe','jade-debug-helper-ansi.exe','debugger-abi-ansi.json',...['jade-jox-test-helper-unicode.exe','jadegitscm.dll','jadegitdev.dll','runtime-provenance.json'].map(n=>'jox/'+n),...['jade-jox-test-helper-ansi.exe','jadegitscm.dll','jadegitdev.dll','runtime-provenance.json'].map(n=>'jox/ansi/'+n)];
 fs.writeFileSync(path.join(source,'jade-cli.exe'),'cli');for(const name of names){const file=path.join(source,'native',name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,name);manifest.runtimeFiles['native/'+name]=hash(name);}
 const pinFile=path.join(root,'pin.json'),save=()=>{const bytes=Buffer.from(JSON.stringify(manifest));fs.writeFileSync(path.join(source,'distribution.json'),bytes);fs.writeFileSync(pinFile,JSON.stringify({version:manifest.packageVersion,tag:'v'+manifest.packageVersion,sha256:'b'.repeat(64),distributionSha256:hash(bytes)}));};save();
 const script=path.join(root,'verify.ps1');fs.writeFileSync(script,'param([string]$Updater,[string]$Directory)\n$ErrorActionPreference="Stop"\n. $Updater\nTest-NativeDistribution $Directory | Out-Null\n');
 return {source,manifest,save,pinFile,remove(name){delete manifest.runtimeFiles['native/'+name];fs.unlinkSync(path.join(source,'native',name));save();},verify:()=>new NativeDistribution(source).verifyPin(pinFile),verifyUpdater:()=>spawnSync('pwsh',['-NoProfile','-NonInteractive','-File',script,path.resolve('scripts/update-native-cli.ps1'),source],{encoding:'utf8',windowsHide:true,timeout:60000})};
}
test('lean JOX cohort verifies without retired compiler helpers in runtime and ZIP updater',t=>{const f=fixture(t);assert.equal(f.verify().manifest.packageVersion,'0.11.10');const p=f.verifyUpdater();assert.ifError(p.error);assert.equal(p.status,0,p.stdout+p.stderr);});
for(const name of ['jade-debug-helper.exe','jade-debug-helper-ansi.exe','debugger-abi-ansi.json','jox/ansi/jade-jox-test-helper-ansi.exe'])test('qualified JOX runtime refuses missing '+name,t=>{const f=fixture(t);f.remove(name);assert.throws(f.verify,new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));const p=f.verifyUpdater();assert.ifError(p.error);assert.notEqual(p.status,0);assert.ok((p.stdout+p.stderr).includes(name));});
test('unqualified JOX debug stays unavailable without requiring a fictitious debug payload',t=>{const f=fixture(t);f.manifest.joxRuntime.variants.ansi.nativeDebug=false;for(const n of ['jade-debug-helper.exe','jade-debug-helper-ansi.exe','debugger-abi-ansi.json'])f.remove(n);f.save();assert.equal(f.verify().manifest.joxRuntime.variants.ansi.nativeDebug,false);const p=f.verifyUpdater();assert.ifError(p.error);assert.equal(p.status,0,p.stdout+p.stderr);});

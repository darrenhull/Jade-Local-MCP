import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {NativeDistribution} from '../../src/NativeDistribution.js';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function fixture(t){const root=fs.mkdtempSync(path.join(os.tmpdir(),'mcp-native-pin-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));const source=path.join(root,'distribution');fs.mkdirSync(path.join(source,'native'),{recursive:true});const runtimeFiles={};for(const name of ['jade-test-helper.exe','jade-native-helper.exe','jade-debug-helper.exe','jade-inspect-helper.exe','debugger-abi.json']){const relative='native/'+name;fs.writeFileSync(path.join(source,relative),name);runtimeFiles[relative]=hash(name);}fs.writeFileSync(path.join(source,'jade-cli.exe'),'native');const manifest={formatVersion:2,runtime:'native-cpp',platform:'win32',arch:'x64',packageVersion:'0.2.0',executable:'jade-cli.exe',executableSha256:hash('native'),runtimeFiles};const file=path.join(source,'distribution.json');fs.writeFileSync(file,JSON.stringify(manifest));const pinFile=path.join(root,'jade-cli-pin.json'),pin={version:'0.2.0',tag:'v0.2.0',sha256:'a'.repeat(64),distributionSha256:hash(fs.readFileSync(file))};const save=()=>fs.writeFileSync(pinFile,JSON.stringify(pin));save();return{source,pinFile,pin,manifest,file,save};}
test('verifies native payload identity against the install receipt, version and release tag',t=>{const f=fixture(t);assert.equal(new NativeDistribution(f.source).verifyPin(f.pinFile).manifest.packageVersion,'0.2.0');});
for(const change of ['missing','version','tag','archiveHash','manifestHash','selfConsistentReplacement','helper'])test('rejects invalid native pin '+change,t=>{const f=fixture(t);if(change==='missing')fs.unlinkSync(f.pinFile);if(change==='version')f.pin.version='0.3.0';if(change==='tag')f.pin.tag='v0.3.0';if(change==='archiveHash')f.pin.sha256='not-a-hash';if(change==='manifestHash')f.pin.distributionSha256='0'.repeat(64);if(change==='selfConsistentReplacement'){fs.writeFileSync(path.join(f.source,'jade-cli.exe'),'replacement');f.manifest.executableSha256=hash('replacement');fs.writeFileSync(f.file,JSON.stringify(f.manifest));}if(change==='helper'){delete f.manifest.runtimeFiles['native/jade-debug-helper.exe'];fs.writeFileSync(f.file,JSON.stringify(f.manifest));f.pin.distributionSha256=hash(fs.readFileSync(f.file));}if(change!=='missing')f.save();assert.throws(()=>new NativeDistribution(f.source).verifyPin(f.pinFile));});

test('a canonical-identity consumer rejects a verified older native release',t=>{
 const f=fixture(t);
 assert.throws(()=>new NativeDistribution(f.source).verifyPin(f.pinFile,{oidFormat:'jade-native'}),/identity capability|oidFormat/i);
 f.manifest.oidFormat='jade-native';fs.writeFileSync(f.file,JSON.stringify(f.manifest));f.pin.distributionSha256=hash(fs.readFileSync(f.file));f.save();
 assert.equal(new NativeDistribution(f.source).verifyPin(f.pinFile,{oidFormat:'jade-native'}).manifest.oidFormat,'jade-native');
});

test('canonical identity requirements accept newer native versions and reject an older version even with a marker',t=>{
 for(const [version,accepted] of [['0.3.1',false],['0.3.2',true],['0.4.1',true],['1.0.0',true]]){
  const f=fixture(t);f.manifest.packageVersion=version;f.manifest.oidFormat='jade-native';fs.writeFileSync(f.file,JSON.stringify(f.manifest));
  f.pin.version=version;f.pin.tag='v'+version;f.pin.distributionSha256=hash(fs.readFileSync(f.file));f.save();
  const verify=()=>new NativeDistribution(f.source).verifyPin(f.pinFile,{minimumVersion:'0.3.2',oidFormat:'jade-native'});
  if(accepted)assert.equal(verify().manifest.packageVersion,version);
  else assert.throws(verify,/version.*0\.3\.2/i);
 }
});

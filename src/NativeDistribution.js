import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function requiredRuntimeFiles(manifest){
 if(!Object.hasOwn(manifest,'joxRuntime'))return ['jade-test-helper.exe','jade-native-helper.exe','jade-debug-helper.exe','jade-inspect-helper.exe','debugger-abi.json'].map(name=>'native/'+name);
 const runtime=manifest.joxRuntime;
 if(!runtime||runtime.format!==1||runtime.characterSet!=='unicode'||!manifest.sourceFormats?.includes('jox'))throw Error('Invalid JOX runtime declaration.');
 const required=['native/jade-inspect-helper.exe','native/jade-inspect-helper-ansi.exe','native/jade-inspect-helper-unicode.exe'];
 const cohort=(mode,prefix)=>{for(const name of ['jade-jox-test-helper-'+mode+'.exe','jadegitscm.dll','jadegitdev.dll','runtime-provenance.json'])required.push(prefix+name);};
 cohort('unicode','native/jox/');
 for(const [mode,variant]of Object.entries({unicode:runtime,...(runtime.variants||{})})){
  if(!['ansi','unicode'].includes(mode)||variant?.characterSet!==mode||variant.format!==1||variant.nativeDebug!==undefined&&typeof variant.nativeDebug!=='boolean')throw Error('Invalid JOX character/runtime capability.');
  if(mode==='ansi')cohort(mode,'native/jox/ansi/');
  if(variant.nativeDebug===true)required.push('native/jade-debug-helper.exe','native/jade-debug-helper-'+mode+'.exe','native/debugger-abi-'+mode+'.json');
 }
 return required;
}

/** Build-time validation of the pinned native CLI; never executes its contents. */
export class NativeDistribution {
  constructor(source){this.source=path.resolve(source);}
  verifyPin(pinFile,{oidFormat,minimumVersion}={}){
    const pin=JSON.parse(fs.readFileSync(pinFile,'utf8'));
    if(typeof pin.version!=='string'||!/^\d+\.\d+\.\d+$/.test(pin.version)||pin.tag!=='v'+pin.version||typeof pin.sha256!=='string'||!/^[a-f0-9]{64}$/i.test(pin.sha256)||typeof pin.distributionSha256!=='string'||!/^[a-f0-9]{64}$/i.test(pin.distributionSha256))throw Error('Invalid native CLI release pin receipt.');
    const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(this.source,'distribution.json'))).digest('hex');
    if(actual!==pin.distributionSha256.toLowerCase())throw Error('Native CLI manifest differs from the release install receipt.');
    const result=this.verify();
    if(result.manifest.packageVersion!==pin.version)throw Error('Native CLI release version differs from its pin.');
    if(minimumVersion&&(!/^\d+\.\d+\.\d+$/.test(minimumVersion)||pin.version.localeCompare(minimumVersion,'en',{numeric:true})<0))throw Error('Native CLI version '+minimumVersion+' or newer is required.');
    if(oidFormat&&result.manifest.oidFormat!==oidFormat)throw Error('Required native object identity capability oidFormat '+oidFormat+' is missing. Use an official compatible Jade CLI release.');
    for(const name of requiredRuntimeFiles(result.manifest))if(!result.files.has(name))throw Error('Mandatory native CLI helper is missing: '+name);
    return result;
  }
  verify(){
    const manifest=JSON.parse(fs.readFileSync(path.join(this.source,'distribution.json'),'utf8'));
    if(manifest.formatVersion!==2||manifest.runtime!=='native-cpp'||manifest.platform!=='win32'||manifest.arch!=='x64'||manifest.executable!=='jade-cli.exe')throw Error('A native C++ Windows x64 CLI distribution is required.');
    const sourceRoot=fs.realpathSync(this.source),files=new Map();let total=0;
    for(const [relative,hash]of Object.entries({...manifest.runtimeFiles,'jade-cli.exe':manifest.executableSha256})){
      if(path.isAbsolute(relative)||relative.includes('\\')||relative.split('/').some(part=>!part||part==='.'||part==='..')||!/^([a-f0-9]{64})$/i.test(hash))throw Error('Invalid native runtime path or checksum: '+relative);
      const file=path.join(this.source,relative),resolved=path.relative(sourceRoot,fs.realpathSync(file));
      if(resolved==='..'||resolved.startsWith('..'+path.sep)||path.isAbsolute(resolved)||!fs.statSync(file).isFile())throw Error('Invalid native runtime path: '+relative);
      total+=fs.statSync(file).size;if(total>256*1024*1024)throw Error('Native CLI runtime exceeds the 256 MiB size limit.');
      const bytes=fs.readFileSync(file);if(crypto.createHash('sha256').update(bytes).digest('hex')!==hash)throw Error('Native CLI checksum mismatch: '+relative);
      files.set(relative,bytes);
    }
    return {manifest,files};
  }
  stage(destination){
    const target=path.resolve(destination);
    if(this.source===target||this.source.startsWith(target+path.sep)||target.startsWith(this.source+path.sep))throw Error('Native source and destination must be separate.');
    const {files}=this.verify();fs.rmSync(target,{recursive:true,force:true});fs.mkdirSync(target,{recursive:true});
    for(const [relative,bytes]of files){const file=path.join(target,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);}
    fs.copyFileSync(path.join(this.source,'distribution.json'),path.join(target,'distribution.json'));return target;
  }
}

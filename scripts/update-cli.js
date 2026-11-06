import path from 'node:path';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {NativeDistribution} from '../src/NativeDistribution.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
try{
  if(process.argv[2]==='--verify-lock'){new NativeDistribution(process.env.JADE_CLI_DISTRIBUTION||path.join(root,'packages/jade-cli-win-x64')).verifyPin(path.join(root,'packages/jade-cli-pin.json'));console.log('Native CLI release pin and distribution integrity verified.');}
  else {
    const script=path.join(root,'scripts/update-native-cli.ps1');
    if(!fs.existsSync(script))throw Error('The local native ZIP updater is missing.');
    const result=spawnSync('pwsh',['-NoProfile','-NonInteractive','-File',script,'-Root',root,...(process.argv[2]?['-Tag',process.argv[2]]:[])],{stdio:'inherit',windowsHide:true,shell:false});
    if(result.error)throw result.error;if(result.status!==0)process.exitCode=result.status||1;
  }
}catch(error){console.error(error.message);process.exitCode=1;}

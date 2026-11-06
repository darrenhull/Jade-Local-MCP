import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),CliReleaseUpdater=require('jade-tools-cli/automation/cli-release-updater');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
try{
  if(process.argv[2]==='--verify-lock'){CliReleaseUpdater.verifyLock(root);console.log('CLI lockfile integrity verified.');}
  else{const result=await new CliReleaseUpdater({root}).run(process.argv[2]||'');if(process.env.GITHUB_OUTPUT)for(const key of ['updated','tag','version','sha','branch'])if(result[key]!==undefined)fs.appendFileSync(process.env.GITHUB_OUTPUT,key+'='+result[key]+'\n');console.log(JSON.stringify(result,null,2));}
}catch(error){console.error(error.message);process.exitCode=1;}

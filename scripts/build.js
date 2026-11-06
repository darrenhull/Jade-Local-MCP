import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {ReleaseValidator} from '../src/ReleaseValidator.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
try{
  const manifest=new ReleaseValidator(root).validate();
  for(const folder of ['src','bin'])for(const file of fs.readdirSync(path.join(root,folder)).filter(name=>name.endsWith('.js'))){const checked=spawnSync(process.execPath,['--check',path.join(root,folder,file)],{stdio:'inherit'});if(checked.status!==0)throw Error('MCP source validation failed: '+file);}
  fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/build-status.json'),JSON.stringify({name:manifest.name,version:manifest.version,serverImplemented:true,transport:'stdio',sdk:'@modelcontextprotocol/server',source:'saved workspace files'},null,2)+'\n');
  console.log('MCP server source and release identity validated. Protocol tests run with npm test.');
}catch(error){console.error(error.message);process.exitCode=1;}

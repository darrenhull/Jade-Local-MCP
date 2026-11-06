import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {stageNative} from './stage-native.js';

/** Stages the verified pinned runtime before running bounded, database-free tests. */
export class TestRunner {
  constructor({root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),stage=stageNative,spawn=spawnSync,env=process.env}={}) {
    this.root=root;this.stage=stage;this.spawn=spawn;this.env=env;
  }
  run() {
    this.stage();
    const files=[];
    const collect=folder=>{
      if(!fs.existsSync(folder))return;
      for(const entry of fs.readdirSync(folder,{withFileTypes:true})) {
        const file=path.join(folder,entry.name);
        if(entry.isDirectory())collect(file);
        else if(entry.name.endsWith('_tests.test.js'))files.push(file);
      }
    };
    collect(path.join(this.root,'tests'));
    collect(path.join(this.root,'build-tools/tests'));
    if(!files.length)throw Error('No grouped MCP tests found.');
    const env={...this.env};
    for(const key of Object.keys(env))if(key.startsWith('JADE_')&&key!=='JADE_MCP_STANDALONE_EXE')delete env[key];
    const result=this.spawn(process.execPath,['--test','--test-concurrency=2',...files.sort()],{cwd:this.root,env,stdio:'inherit'});
    if(result.error)throw result.error;
    return result.status??1;
  }
}

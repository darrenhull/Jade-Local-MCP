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
    const native=this.env.JADE_MCP_NATIVE_TESTS==='1';
    if(native){const context=this.env.JADE_MCP_NATIVE_CONTEXT;if(!context||!fs.existsSync(context)||!fs.statSync(context).isFile())throw Error('Explicit native tests require JADE_MCP_NATIVE_CONTEXT pointing to the private fixture description.');JSON.parse(fs.readFileSync(context,'utf8'));}
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
    const allowed=new Set(['JADE_MCP_STANDALONE_EXE',...(native?['JADE_MCP_NATIVE_TESTS','JADE_MCP_NATIVE_CONTEXT','JADE_MCP_NATIVE_EVIDENCE']:[])]);
    for(const key of Object.keys(env))if(key.startsWith('JADE_')&&!allowed.has(key))delete env[key];
    const result=this.spawn(process.execPath,['--test','--test-concurrency=2',...files.sort()],{cwd:this.root,env,stdio:'inherit'});
    if(result.error)throw result.error;
    return result.status??1;
  }
}

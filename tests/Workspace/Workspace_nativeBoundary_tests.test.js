import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Workspace} from '../../src/Workspace.js';
import {CliClient} from '../../src/CliClient.js';

test('native command preparation accepts configured sibling roots and rejects physical escapes without connecting to Jade',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'jade-mcp-boundary-')),workspaceRoot=path.join(root,'workspace'),first=path.join(root,'first'),second=path.join(root,'second'),outside=path.join(root,'outside');
 for(const directory of [workspaceRoot,first,second,outside])fs.mkdirSync(directory);
 for(const directory of [first,second,outside])fs.writeFileSync(path.join(directory,'Fish.cls'),'local source');
 fs.symlinkSync(outside,path.join(first,'escape'),'junction');
 fs.writeFileSync(path.join(workspaceRoot,'jade.json'),JSON.stringify({workspaceRoots:['../first','../second']}));
 const prior=process.env.JADE_TOOLS_STATE_DIRECTORY;process.env.JADE_TOOLS_STATE_DIRECTORY=path.join(root,'broker');
 const workspace=new Workspace({cwd:workspaceRoot}),client=new CliClient();
 const prepare=files=>client.submit({...workspace.prepare('build',{files}),command:'prepare'}).completion;
 try{
  const accepted=await prepare([path.join(first,'Fish.cls'),path.join(second,'Fish.cls')]);assert.equal(accepted.passed,true,JSON.stringify(accepted));
  for(const file of [path.join(outside,'Fish.cls'),path.join(first,'escape/Fish.cls')]){
   const rejected=await prepare([file]);assert.equal(rejected.passed,false,JSON.stringify(rejected));assert.match(rejected.report.error,/workspace|outside|escape/i);
  }
 }finally{
  try{await client.submit({command:'shutdown'}).completion;}finally{await client.close();if(prior===undefined)delete process.env.JADE_TOOLS_STATE_DIRECTORY;else process.env.JADE_TOOLS_STATE_DIRECTORY=prior;fs.rmSync(root,{recursive:true,force:true});}
 }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {Workspace} from '../../src/Workspace.js';

test('native CLI owns configuration, source discovery and multi-file command preparation',async()=>{
 const workspace=new Workspace({cwd:process.cwd(),configFile:'jade.json'});let request;
 await workspace.run(workspace.prepare('test',{files:['FishTest.cls','HampsterTests.cls'],methods:['verify']}),async value=>(request=value,{code:0,passed:true}));
 assert.equal(request.command,'cli');assert.equal(request.operation,'test');assert.equal(request.cwd,process.cwd());
 assert.deepEqual(request.argv,['--config',path.resolve('jade.json'),'--','FishTest.cls','HampsterTests.cls']);
 assert.deepEqual(request.methods,['verify']);assert.equal(request.config,undefined);
 assert.equal(request.restrictToWorkspace,true);
});

test('model file arguments cannot introduce options and native CLI owns configured-root validation',()=>{
 const workspace=new Workspace({cwd:process.cwd()});
 assert.throws(()=>workspace.prepare('build',{files:['--config','C:/other/jade.json']}),/source.*path/i);
 const request=workspace.prepare('build',{files:['../configured-sibling/Fish.cls']});
 assert.equal(request.restrictToWorkspace,true);assert.deepEqual(request.argv,['--','../configured-sibling/Fish.cls']);
});

test('workspace resource exposes only whitelisted identity from native preparation',async()=>{
 const workspace=new Workspace({cwd:process.cwd()});let request;
 const identity=await workspace.describe(async value=>(request=value,{code:0,passed:true,prepared:{configFile:'jade.json',config:{workspaceRoots:['C:/pets'],schema:'Pets',password:'secret'}}}));
 assert.equal(request.command,'prepare');assert.equal(request.operation,'doctor');assert.equal(identity.schema,'Pets');assert.equal(identity.password,undefined);
});

test('broker lifecycle commands go directly to the native broker without configuration preparation',async()=>{
 const workspace=new Workspace({configFile:'deliberately-missing.json'});
 for(const command of ['status','disconnect','shutdown'])assert.deepEqual(workspace.prepare(command),{command});
});

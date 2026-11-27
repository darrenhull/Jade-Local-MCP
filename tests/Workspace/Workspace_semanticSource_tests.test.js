import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {Workspace} from '../../src/Workspace.js';
test('JOX source preparation delegates native discovery without a CLS index or database target',()=>{
 const workspace=new Workspace({cwd:process.cwd(),configFile:'jade.json'}),request=workspace.prepare('source.semantic.prepare');
 assert.deepEqual(request,{command:'source.semantic.prepare',cwd:process.cwd(),configFile:path.resolve('jade.json'),config:{sourceFormat:'jox'},restrictToWorkspace:true});
});
test('native source lookup preserves opaque project generation and exact origin selector',()=>{
 const workspace=new Workspace({cwd:process.cwd()}),input={provider:'jox',projectId:'opaque-project',generation:'exact-generation',originUri:'file:///C:/repo/Fish.jox',originText:'<source/>',position:{line:3,character:8}};
 assert.deepEqual(workspace.prepare('source.semantic.read',input),{command:'source.semantic.read',cwd:process.cwd(),restrictToWorkspace:true,...input});
 assert.throws(()=>workspace.prepare('source.semantic.applyEdit',{replacementText:'x'}),/unsupported|read-only/i);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {Workspace} from '../../src/Workspace.js';
import {JadeOperations} from '../../src/JadeOperations.js';
test('job list keeps the user operation name while transport uses a native cli envelope',async()=>{
 let finish;const operations=new JadeOperations({workspace:new Workspace(),client:{submit:()=>({id:'owned',completion:new Promise(resolve=>finish=resolve)})}});
 const pending=operations.execute('test',{files:['FishTest.cls']});
 assert.deepEqual(operations.jobs(),[{id:'owned',command:'test'}]);
 finish({code:0,passed:true});await pending;assert.deepEqual(operations.jobs(),[]);
});

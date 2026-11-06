import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {CliClient} from '../../src/CliClient.js';
test('cancellation owns queued requests before the native connection is ready',async()=>{
 let connected;const sent=[];
 const client=new CliClient({connect:()=>new Promise(resolve=>connected=resolve)});
 const operation=client.submit({command:'cli',operation:'test'});
 assert.equal(client.cancel(operation.id).cancelled,true);
 connected({socket:new EventEmitter(),onEvent:()=>()=>{},send:packet=>sent.push(packet),close(){}});
 assert.deepEqual(await operation.completion,{code:130,passed:false,cancelled:true});
 assert.deepEqual(sent,[]);assert.equal(client.cancel(operation.id).cancelled,false);await client.close();
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {PassThrough} from 'node:stream';
import {NativeConnection} from '../../src/NativeConnection.js';

function child(){const value=new EventEmitter();value.stdin=new PassThrough();value.stdout=new PassThrough();value.stderr=new PassThrough();value.kill=()=>value.emit('close',0);return value;}

test('starts the native executable directly and frames split UTF-8 responses',async()=>{
 const process=child(),packets=[];let invocation;
 const connection=new NativeConnection({entry:'C:/tools/jade-cli.exe',spawn:(...args)=>(invocation=args,process)});
 connection.onEvent(packet=>packets.push(packet));connection.send({id:'x',command:'status'});
 assert.equal(invocation[0],'C:/tools/jade-cli.exe');assert.deepEqual(invocation[1],['service','--stdio']);
 assert.equal(invocation[2].shell,false);assert.equal(invocation[2].env.ELECTRON_RUN_AS_NODE,undefined);
 const data=Buffer.from(JSON.stringify({id:'x',event:'output',text:'Fish 🐟'})+'\n');
 process.stdout.write(data.subarray(0,data.length-4));process.stdout.write(data.subarray(data.length-4));
 assert.equal(packets[0].text,'Fish 🐟');connection.close();
});

test('rejects script entrypoints and never falls back to a Node CLI',()=>{
 assert.throws(()=>new NativeConnection({entry:'jade-cli.js'}),/native.*executable/i);
});

test('malformed native output closes the connection and exposes the failure',async()=>{
 const process=child(),connection=new NativeConnection({entry:'jade-cli.exe',spawn:()=>process});
 let failure;connection.socket.on('error',error=>failure=error);
 connection.send({id:'x',command:'status'});process.stdout.write('not json\n');
 assert.match(failure.message,/invalid.*response/i);assert.equal(connection.closed,true);
});

test('unexpected native process exit retains stderr and rejects further sends',()=>{
 const process=child(),connection=new NativeConnection({entry:'jade-cli.exe',spawn:()=>process});let failure;
 connection.socket.on('error',error=>failure=error);connection.send({id:'x',command:'status'});
 process.stderr.write('native startup failed');process.emit('close',7);
 assert.match(failure.message,/exit 7.*native startup failed/);assert.throws(()=>connection.send({id:'y',command:'status'}),/closed/i);
});

test('oversized unterminated native frames close the service before unbounded buffering',()=>{
 const process=child(),connection=new NativeConnection({entry:'jade-cli.exe',spawn:()=>process});let failure;
 connection.socket.on('error',error=>failure=error);connection.send({id:'x',command:'status'});
 process.stdout.write(Buffer.alloc(8*1024*1024+1,65));assert.match(failure.message,/limit/i);assert.equal(connection.closed,true);
});
for(const stream of ['stdout','stderr'])test('native '+stream+' stream errors close safely without an unhandled exception',()=>{
 const process=child(),connection=new NativeConnection({entry:'jade-cli.exe',spawn:()=>process});let failure,closed=0;
 connection.socket.on('error',error=>failure=error);connection.socket.on('close',()=>closed++);connection.send({id:'x',command:'status'});
 assert.doesNotThrow(()=>process[stream].emit('error',Error('pipe failure')));assert.match(failure.message,new RegExp(stream+'.*pipe failure'));assert.equal(connection.closed,true);assert.equal(closed,1);
 assert.doesNotThrow(()=>process[stream].emit('error',Error('late pipe failure')));assert.equal(closed,1);
});

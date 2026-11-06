import test from 'node:test';
import assert from 'node:assert/strict';
import {CliClient} from '../../src/CliClient.js';
import {NativeConnection} from '../../src/NativeConnection.js';
test('missing native distribution reports the startup failure instead of a generic broker disconnect',async()=>{
 const client=new CliClient({connect:async()=>new NativeConnection({entry:'Z:/nonexistent-jade-cli/no-such-native-cli.exe'})});
 try{await assert.rejects(client.submit({command:'status'}).completion,/native Jade CLI could not start/i);}finally{await client.close();}
});

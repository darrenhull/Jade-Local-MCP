import test from 'node:test';
import assert from 'node:assert/strict';
import {Client,InMemoryTransport} from '@modelcontextprotocol/client';
import {JadeServer} from '../../src/JadeServer.js';
const binding={provider:'jox',projectId:'opaque-project',generation:'exact-generation'};
async function fixture(t){const calls=[];const api=new JadeServer({operations:{execute:async(command,input)=>{calls.push({command,input});return{code:0,passed:true,body:{projection:{text:'value();',mapping:[{native:'untouched'}]},warnings:[{path:'schemas/Pets/types/Fish.jox',reason:'native reason'}],capabilities:{nativeDebug:false,originLookup:true}}};}},workspace:{describe:()=>({})}});const [ct,st]=InMemoryTransport.createLinkedPair(),client=new Client({name:'source-tools-control',version:'1'});await api.server.connect(st);await client.connect(ct);t.after(async()=>{await client.close();await api.server.close();});return{client,calls};}
test('official protocol exposes bounded read-only JOX source tools and preserves native maps/errors/capabilities',async t=>{
 const {client,calls}=await fixture(t),listed=await client.listTools();
 for(const name of ['jade_prepare_sources','jade_query_source','jade_read_source','jade_close_sources']){const tool=listed.tools.find(row=>row.name===name);assert.ok(tool,name);assert.equal(tool.annotations.readOnlyHint,true);assert.equal(tool.annotations.destructiveHint,false);}
 const response=await client.callTool({name:'jade_read_source',arguments:{...binding,entityId:'opaque-method'}});
 assert.equal(response.isError,false);assert.deepEqual(response.structuredContent.body.projection.mapping,[{native:'untouched'}]);assert.equal(response.structuredContent.body.capabilities.nativeDebug,false);assert.equal(response.structuredContent.body.warnings[0].path,'schemas/Pets/types/Fish.jox');assert.deepEqual(calls,[{command:'source.semantic.read',input:{...binding,entityId:'opaque-method'}}]);
 const resource=JSON.parse((await client.readResource({uri:'jade://capabilities'})).contents[0].text);assert.equal(resource.debugging.mcpDebugger,false);assert.equal(resource.debugging.runtimeCapabilityTool,'jade_doctor');
});
test('source tool schemas reject mutations, invalid positions, ambiguity and unbounded pages before native dispatch',async t=>{
 const {client,calls}=await fixture(t);
 for(const [name,args] of [['jade_prepare_sources',{config:{databasePath:'other'}}],['jade_query_source',{...binding,kind:'type',limit:1000}],['jade_read_source',{...binding}],['jade_read_source',{...binding,originUri:'file:///x',originText:'x',position:{line:-1,character:0}}],['jade_read_source',{...binding,entityId:'method',replacementText:'changed'}],['jade_close_sources',{provider:'jox',projectId:'project',operation:'publish'}]]){
  const result=await client.callTool({name,arguments:args});assert.equal(result.isError,true,name);
 }
 assert.equal(calls.length,0);
});

test('MCP initialization and guidance distinguish direct Working from optional source-backed mode',async t=>{
 const {client}=await fixture(t),instructions=client.getInstructions(),skill=(await client.callTool({name:'jade_get_guidance',arguments:{}})).structuredContent.skill;
 assert.match(instructions,/configured existing Working/i);assert.match(instructions,/jade_prepare_sources/);assert.match(skill,/source-backed/);assert.match(skill,/originLookup/);assert.match(skill,/zero-based UTF16/);assert.doesNotMatch(instructions,/Build\/test run in private Working/);
});

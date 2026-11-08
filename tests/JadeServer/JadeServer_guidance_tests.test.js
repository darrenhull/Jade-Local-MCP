import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Client,InMemoryTransport} from '@modelcontextprotocol/client';
import {JadeServer} from '../../src/JadeServer.js';

async function connect(t) {
  let calls=0;
  const api=new JadeServer({operations:{execute:async()=>{calls++;return {code:0,passed:true};}},workspace:{describe:()=>({})}});
  const [clientTransport,serverTransport]=InMemoryTransport.createLinkedPair();
  const client=new Client({name:'jade-guidance-test',version:'1.0.0'});
  await api.server.connect(serverTransport);await client.connect(clientTransport);
  t.after(async()=>{await client.close();await api.server.close();});
  return {client,calls:()=>calls};
}

test('initialization tells agents where to retrieve the development skill before native operations',async t=>{
  const {client,calls}=await connect(t);
  assert.match(client.getInstructions(),/jade_get_guidance/);
  assert.match(client.getInstructions(),/jade:\/\/skills\/jade-development/);
  assert.equal(calls(),0);
});

test('resource and read-only tool deliver the exact same versioned skill without invoking the CLI',async t=>{
  const {client,calls}=await connect(t);
  const listed=await client.listResources();
  assert.ok(listed.resources.some(resource=>resource.uri==='jade://skills/jade-development'));
  const tool=(await client.listTools()).tools.find(tool=>tool.name==='jade_get_guidance');
  assert.ok(tool);assert.equal(tool.annotations.readOnlyHint,true);assert.equal(tool.annotations.destructiveHint,false);
  const resource=await client.readResource({uri:'jade://skills/jade-development'});
  const result=await client.callTool({name:'jade_get_guidance',arguments:{}});
  assert.equal(result.isError,false);
  assert.equal(result.structuredContent.skill,resource.contents[0].text);
  assert.equal(result.structuredContent.skill,fs.readFileSync(new URL('../../skills/jade-development/SKILL.md',import.meta.url),'utf8'));
  assert.equal(result.structuredContent.uri,'jade://skills/jade-development');
  assert.equal(calls(),0);
});

test('guidance refuses unexpected arguments and capability/prompt discovery points to the same resource',async t=>{
  const {client,calls}=await connect(t);
  const invalid=await client.callTool({name:'jade_get_guidance',arguments:{path:'C:/private'}});
  assert.equal(invalid.isError,true);assert.equal(calls(),0);
  const resource=await client.readResource({uri:'jade://capabilities'});
  assert.equal(JSON.parse(resource.contents[0].text).guidance.resource,'jade://skills/jade-development');
  const prompt=await client.getPrompt({name:'jade_check_changes',arguments:{}});
  assert.match(prompt.messages[0].content.text,/jade_get_guidance/);
});

test('MCP guidance delivers native creation and updating rules without opening a database',async t=>{
 const {client,calls}=await connect(t);
 const result=await client.callTool({name:'jade_get_guidance',arguments:{}});
 const resource=await client.readResource({uri:'jade://skills/jade-development'});
 const skill=result.structuredContent.skill;
 assert.equal(skill,resource.contents[0].text);
 assert.match(skill,/create cow transient;/);
 assert.match(skill,/cow := create NamedCow\("Bessie"\) transient;/);
 assert.match(skill,/updating[^\n]*does not (?:begin|start) a transaction/i);
 for(const usage of ['constant','input','io','output'])assert.ok(skill.includes('`'+usage+'`'));
 assert.match(skill,/create_instruction\.htm/);assert.match(skill,/updating_option\.htm/);
 assert.match(skill,/Persistent create\/update\/delete/);
 assert.equal(calls(),0);
});

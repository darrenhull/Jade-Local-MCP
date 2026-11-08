import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';
import {TemporaryWorkspace} from '../../scripts/TemporaryWorkspace.js';

for(const mode of ['legacy',{pin:'2026-07-28'}])test('real stdio server discovers config and queries schema-qualified files: '+JSON.stringify(mode),async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'jade-mcp-stdio-'));
  const executable=process.env.JADE_MCP_STANDALONE_EXE;
  const entry=fileURLToPath(new URL('../../bin/jade-mcp.js',import.meta.url));
  const env={...process.env,JADE_TOOLS_STATE_DIRECTORY:path.join(root,'broker')};
  if(executable)env.PATH=path.join(process.env.SystemRoot||'C:/Windows','System32');
  fs.writeFileSync(path.join(root,'jade.json'),JSON.stringify({workspaceRoots:['.']}));
  fs.writeFileSync(path.join(root,'Fish.cls'),'jadeVersionNumber "25.0.02";\nschemaDefinition\nAquarium subschemaOf RootSchema partialDefinition;\ntypeHeaders\nFish subclassOf Object transient;\ntypeDefinitions\nFish completeDefinition\n(\n)\ntypeSources\n');
  const transport=new StdioClientTransport({command:executable||process.execPath,args:executable?['--workspace',root]:[entry,'--workspace',root],cwd:root,env,stderr:'pipe'});
  const client=new Client({name:'jade-real-stdio-test',version:'1.0.0'},{versionNegotiation:{mode}});
  let stderr='';transport.stderr?.on('data',chunk=>stderr+=chunk);
  try{
    await client.connect(transport);
    const tools=(await client.listTools()).tools;
    assert.ok(tools.some(tool=>tool.name==='jade_build'));
    for(const tool of tools.filter(tool=>/^jade_(inspect_|release_cursor|close_inspection)/.test(tool.name))){assert.equal(tool.annotations.readOnlyHint,true);assert.equal(tool.annotations.destructiveHint,false);}
    const doctor=await client.callTool({name:'jade_doctor',arguments:{}});
    assert.equal(doctor.isError,false,JSON.stringify(doctor));
    assert.equal(doctor.structuredContent.capabilities.sharedWorkingInspection,true);
    assert.ok(doctor.structuredContent.sdkVersion.localeCompare('0.5.0','en',{numeric:true})>=0);
    assert.match(client.getInstructions(),/jade_get_guidance/);
    const guidance=await client.readResource({uri:'jade://skills/jade-development'});
    const guidanceTool=await client.callTool({name:'jade_get_guidance',arguments:{}});
    assert.equal(guidanceTool.isError,false,JSON.stringify(guidanceTool));
    assert.equal(guidanceTool.structuredContent.skill,guidance.contents[0].text);
    assert.match(guidanceTool.structuredContent.skill,/^---\r?\nname: jade-development\r?\n/);
    assert.match(guidanceTool.structuredContent.skill,/create cow transient;/);
    assert.match(guidanceTool.structuredContent.skill,/updating[^\n]*does not (?:begin|start) a transaction/i);
    const found=await client.callTool({name:'jade_search_source',arguments:{query:'Fish',limit:10}});
    assert.equal(found.isError,false,JSON.stringify(found));assert.equal(found.structuredContent.rows[0].schema,'Aquarium');
    const workspace=await client.readResource({uri:'jade://workspace'});assert.deepEqual(JSON.parse(workspace.contents[0].text).workspaceRoots,[root]);
    const status=await client.callTool({name:'jade_status',arguments:{}});assert.ok(status.structuredContent.brokerPID>0);
  }catch(error){throw Error(error.message+'\nServer stderr: '+stderr,{cause:error});}
  finally{try{await client.callTool({name:'jade_shutdown',arguments:{}});}catch{}await client.close();TemporaryWorkspace.remove(root);}
});

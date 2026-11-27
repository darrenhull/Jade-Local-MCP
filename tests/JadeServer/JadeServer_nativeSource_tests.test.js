import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn,execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {Client,InMemoryTransport} from '@modelcontextprotocol/client';
import {JadeServer} from '../../src/JadeServer.js';
import {JadeOperations} from '../../src/JadeOperations.js';
import {Workspace} from '../../src/Workspace.js';
import {CliClient} from '../../src/CliClient.js';
import {NativeConnection} from '../../src/NativeConnection.js';
test('actual native JOX source API crosses MCP with exact mappings, errors and no database',{skip:!process.env.JADE_MCP_SOURCE_CLI,timeout:120000},async()=>{
 const owned=fs.mkdtempSync(path.join(os.tmpdir(),'jade-mcp-source-')),project=path.join(owned,'project'),schemas=path.join(project,'schemas'),origin=path.join(schemas,'McpSourceSchema/types/McpSource.jox');
 let connection,closed=false,protocol,server;
 const native=new CliClient({connect:async()=>(connection=new NativeConnection({entry:process.env.JADE_MCP_SOURCE_CLI,spawn:(exe,args,options)=>spawn(exe,args,{...options,cwd:owned,env:{...options.env,JADE_TOOLS_STATE_DIRECTORY:path.join(owned,'broker')}})}))});
 const workspace=new Workspace({cwd:project}),operations=new JadeOperations({workspace,client:native});
 try{
  fs.mkdirSync(path.dirname(origin),{recursive:true});
  fs.writeFileSync(path.join(schemas,'McpSourceSchema.jox'),'<Schema name="McpSourceSchema" id="621d2877-683f-48de-8d76-71834edb4ede"><superschema name="RootSchema"/></Schema>');
  const text='<Class name="McpSource" id="972f0104-2276-47da-be10-d7d3453681d9">\r\n<superclass name="Object"/>\r\n<JadeMethod name="value" id="05ecdb32-a0ba-4d44-8c4f-624ce11b2695"><source>value();\r\nbegin\r\n write "A &amp; B";\r\nend;</source></JadeMethod></Class>';
  assert.ok(text.includes('\r\n'),'Fixture must contain actual CRLF lines');fs.writeFileSync(origin,text);fs.writeFileSync(path.join(project,'jade.json'),JSON.stringify({sourceFormat:'jox',workingMode:'source-backed',characterSet:'ansi',workspaceRoots:[project]}));fs.writeFileSync(path.join(project,'.gitignore'),'/.jade/\n');
  const git=(...args)=>execFileSync('git.exe',['-C',project,...args],{timeout:15000,windowsHide:true,stdio:'pipe'});
  git('init','--quiet');git('config','commit.gpgsign','false');git('config','core.hooksPath',path.join(project,'.git/hooks'));git('config','user.name','MCP source control');git('config','user.email','source@example.invalid');git('add','--all');git('commit','--quiet','-m','Owned MCP source fixture');
  const before=fs.readFileSync(origin),index=fs.readFileSync(path.join(project,'.git/index'));
  assert.deepEqual((await operations.invoke({command:'status'})).nativePIDs,[]);
  server=new JadeServer({operations,workspace});const [ct,st]=InMemoryTransport.createLinkedPair();protocol=new Client({name:'native-source-control',version:'1'});await server.server.connect(st);await protocol.connect(ct);
  const prepared=await protocol.callTool({name:'jade_prepare_sources',arguments:{}});assert.equal(prepared.isError,false,JSON.stringify(prepared));const body=prepared.structuredContent.body,binding={provider:body.provider,projectId:body.projectId,generation:body.generation};assert.equal(body.capabilities.nativeDebug,false);assert.equal(body.capabilities.originLookup,true);
  const page=await protocol.callTool({name:'jade_query_source',arguments:{...binding,kind:'type',limit:10}});assert.equal(page.isError,false,JSON.stringify(page));assert.equal(page.structuredContent.body.items[0].qualifiedName.type,'McpSource');
  const originUri=pathToFileURL(origin).href,offset=text.indexOf('&amp;')+2,prefix=text.slice(0,offset).split('\n'),position={line:prefix.length-1,character:prefix.at(-1).length};
  const read=await protocol.callTool({name:'jade_read_source',arguments:{...binding,originUri,originText:text,position}});assert.equal(read.isError,false,JSON.stringify(read));assert.equal(read.structuredContent.body.entity.qualifiedName.member,'value');assert.ok(read.structuredContent.body.projection.mapping.length);assert.match(read.structuredContent.body.projection.text,/A & B/);
  const stale=await protocol.callTool({name:'jade_read_source',arguments:{...binding,originUri,originText:text+' ',position}});assert.equal(stale.isError,true);assert.equal(stale.structuredContent.passed,false);assert.match(stale.structuredContent.report.error,/stale|saved|match/i);
  await protocol.callTool({name:'jade_close_sources',arguments:{provider:binding.provider,projectId:binding.projectId}});
  assert.deepEqual(fs.readFileSync(origin),before);assert.deepEqual(fs.readFileSync(path.join(project,'.git/index')),index);assert.deepEqual((await operations.invoke({command:'status'})).nativePIDs,[]);
 }finally{
  const failures=[];try{await protocol?.close();await server?.server.close();}catch(error){failures.push(error);}
  if(connection?.child){try{const status=await operations.invoke({command:'status'});assert.deepEqual(status.nativePIDs,[]);await operations.invoke({command:'broker.retire'});closed=true;}catch(error){failures.push(error);}}
  else closed=true;
  let timer;const child=connection?.child,exit=child&&child.exitCode===null?new Promise(resolve=>child.once('close',resolve)):Promise.resolve();
  try{await native.close();await Promise.race([exit,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Owned native API did not exit.')),3000);})]);}catch(error){closed=false;failures.push(error);}finally{clearTimeout(timer);}
  if(closed){assert.equal(path.dirname(owned),os.tmpdir());assert.ok(path.basename(owned).startsWith('jade-mcp-source-'));fs.rmSync(owned,{recursive:true,force:true});}
  if(failures.length)throw new AggregateError(failures,'Owned MCP source fixture cleanup not confirmed: '+owned);
 }
});

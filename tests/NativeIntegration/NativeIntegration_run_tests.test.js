import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';

function privateContext() {
  const file=process.env.JADE_MCP_NATIVE_CONTEXT;
  assert.ok(file,'Set JADE_MCP_NATIVE_CONTEXT to a disposable fixture description.');
  const context=JSON.parse(fs.readFileSync(file,'utf8'));
  const temp=fs.realpathSync(os.tmpdir());
  const inside=(root,value)=>{const relative=path.relative(root,fs.realpathSync(value));return relative!==''&&!relative.startsWith('..')&&!path.isAbsolute(relative);};
  const root=fs.realpathSync(context.root),source=fs.realpathSync(context.databasePath);
  assert.ok(inside(temp,root)&&path.basename(root).startsWith('jade-mcp-native-integration-'),'A private TEMP fixture root is required.');
  const sourceRelative=path.relative(temp,source);
  assert.ok(!sourceRelative.startsWith('..')&&!path.isAbsolute(sourceRelative)&&sourceRelative.startsWith('jade-cli-integration-seed-'),'User Source, normal Working and IDE databases are forbidden.');
  for(const key of ['workspace','storagePath','domainFile','testFile'])assert.ok(inside(root,context[key]),'Fixture path must stay inside its TEMP root: '+key);
  const settings=JSON.parse(fs.readFileSync(path.join(context.workspace,'jade.json'),'utf8'));
  assert.equal(fs.realpathSync(settings.databasePath),source,'The actual project configuration must use the guarded private Source.');
  assert.ok(inside(path.dirname(source),settings.iniPath),'The connection INI must belong to the private Source seed.');
  assert.equal(fs.realpathSync(settings.storagePath),fs.realpathSync(context.storagePath));
  assert.equal(settings.workingDatabaseDirectory,undefined,'Do not override Working into another database.');
  assert.equal(settings.files,undefined,'The test must prove automatic workspace dependency discovery.');
  assert.deepEqual(settings.workspaceRoots,['.']);
  return context;
}

test('native CLI and official MCP client use unpublished workspace dependencies and report real failures',{
  skip:process.env.JADE_MCP_NATIVE_TESTS!=='1',timeout:180000
},async()=>{
  const fixture=privateContext(),records=[];
  const environment={...process.env,JADE_TOOLS_STATE_DIRECTORY:path.join(fixture.root,'broker'),PATH:path.join(process.env.SystemRoot||'C:/Windows','System32')};
  delete environment.ELECTRON_RUN_AS_NODE;
  const source=fs.readFileSync(fixture.domainFile,'utf8');
  const selected=path.relative(fixture.workspace,fixture.testFile);
  const cli=args=>{
    const started=performance.now();
    const result=spawnSync(fixture.cliExecutable,args,{cwd:fixture.workspace,env:environment,encoding:'utf8',timeout:90000,maxBuffer:16*1024*1024,windowsHide:true});
    assert.ifError(result.error);
    const body=JSON.parse(result.stdout);
    records.push({operation:'cli '+args.join(' '),milliseconds:performance.now()-started,exitCode:result.status,result:body});
    return {body,exitCode:result.status};
  };
  let client,transport,passed=false,errorText,stderr='';
  try {
    // No project build comes first: neither this unique schema nor CliDomain
    // exists in the restored Source. Only the selected test filename is supplied.
    const fresh=cli(['test',selected,'--json']);
    assert.equal(fresh.exitCode,0,JSON.stringify(fresh));
    assert.equal(fresh.body.passed,true,JSON.stringify(fresh));
    assert.equal(fresh.body.report.tests_completed,true);
    assert.equal(fresh.body.report.results[0].status,'passed');
    const cliStatus=cli(['status','--json']).body;
    assert.ok(cliStatus.nativePIDs.length>0);

    const executable=process.env.JADE_MCP_STANDALONE_EXE;
    const entry=fileURLToPath(new URL('../../bin/jade-mcp.js',import.meta.url));
    transport=new StdioClientTransport({command:executable||process.execPath,args:executable?['--workspace',fixture.workspace]:[entry,'--workspace',fixture.workspace],cwd:fixture.workspace,env:environment,stderr:'pipe'});
    client=new Client({name:'jade-native-integration-proof',version:'1.0.0'});
    transport.stderr?.on('data',bytes=>{stderr+=bytes.toString();});
    await client.connect(transport);
    const call=async(name,args={})=>{
      const started=performance.now(),result=await client.callTool({name,arguments:args});
      records.push({operation:name,arguments:args,milliseconds:performance.now()-started,result});
      return result;
    };
    const status=await call('jade_status');
    assert.equal(status.structuredContent.brokerPID,cliStatus.brokerPID,'MCP and the standalone CLI must share the native broker.');
    assert.deepEqual(status.structuredContent.nativePIDs,cliStatus.nativePIDs);
    const built=await call('jade_build',{files:[path.relative(fixture.workspace,fixture.domainFile)]});
    assert.equal(built.isError,false,JSON.stringify(built));
    const warm=await call('jade_test',{files:[selected]});
    assert.equal(warm.isError,false,JSON.stringify(warm));
    assert.equal(warm.structuredContent.report.tests_completed,true);
    assert.equal(warm.structuredContent.report.loaded_files,0);
    assert.deepEqual((await call('jade_status')).structuredContent.nativePIDs,cliStatus.nativePIDs);

    fs.writeFileSync(fixture.domainFile,source.replace('return 42;','return 43;'));
    const assertion=await call('jade_test',{files:[selected]});
    assert.equal(assertion.isError,true,JSON.stringify(assertion));
    assert.equal(assertion.structuredContent.report.tests_completed,true);
    assert.equal(assertion.structuredContent.report.results[0].status,'failed');
    assert.match(assertion.structuredContent.report.results[0].message,/42.*43/);

    fs.writeFileSync(fixture.domainFile,source.replace('return 42;','return self.missingNativeProperty;'));
    const compiler=await call('jade_build',{files:[path.relative(fixture.workspace,fixture.domainFile)]});
    assert.equal(compiler.isError,true,JSON.stringify(compiler));
    assert.ok(compiler.structuredContent.report.diagnostics.some(row=>Number(row.compiler_error??row.code)===6026),JSON.stringify(compiler));

    fs.writeFileSync(fixture.domainFile,source);
    const recovered=await call('jade_test',{files:[selected]});
    assert.equal(recovered.isError,false,JSON.stringify(recovered));
    assert.equal(recovered.structuredContent.report.results[0].status,'passed');
    assert.notEqual(recovered.structuredContent.report.logFile,warm.structuredContent.report.logFile,'Test results must be rerun, not cached.');

    const original=await call('jade_inspect_catalog',{target:'source',schema:fixture.schema,limit:10});
    assert.equal(original.isError,false,JSON.stringify(original));
    assert.equal(original.structuredContent.body.readOnly,true);
    assert.equal(original.structuredContent.body.total,0,'The new workspace schema must never have been published to Source.');
    const sessions=path.join(os.tmpdir(),'jade-tools-inspection');
    const owned=fs.readdirSync(sessions).filter(name=>name.endsWith('.json')).map(name=>path.join(sessions,name)).filter(file=>{
      try{return JSON.parse(fs.readFileSync(file,'utf8')).databasePath===fixture.databasePath;}catch{return false;}
    });
    assert.equal(owned.length,1,'An active native inspection retains its owned configuration.');
    assert.equal((await call('jade_close_inspection',{target:'source'})).isError,false);
    assert.equal(fs.existsSync(owned[0]),false,'The configuration must be removed after the native process has exited.');
    passed=true;
  } catch(error) {
    errorText=error.message;
    throw Error(error.message+'\nMCP stderr: '+stderr,{cause:error});
  } finally {
    fs.writeFileSync(fixture.domainFile,source);
    try {if(client)await client.callTool({name:'jade_shutdown',arguments:{}});else cli(['shutdown','--json']);}catch {}
    await client?.close();
    const evidence=process.env.JADE_MCP_NATIVE_EVIDENCE||path.join(fixture.root,'native-evidence.json');
    fs.writeFileSync(evidence,JSON.stringify({passed,error:errorText,standaloneCli:true,standaloneMcp:Boolean(process.env.JADE_MCP_STANDALONE_EXE),noNodeOnPATH:true,sourceNeverPublished:passed,records},null,2));
  }
});

#!/usr/bin/env node
import fs from 'node:fs';
import {serveStdio} from '@modelcontextprotocol/server/stdio';
import {CliClient} from '../src/CliClient.js';
import {Workspace} from '../src/Workspace.js';
import {JadeOperations} from '../src/JadeOperations.js';
import {JadeServer} from '../src/JadeServer.js';

const manifest=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
try{
  const args=process.argv.slice(2),options={};
  for(let i=0;i<args.length;i++){
    if(args[i]==='--help'){console.log('jade-mcp --workspace <folder> [--config <jade.json>]\nLocal MCP stdio server over the native Jade CLI. No Source publication tools are exposed.');process.exit(0);}
    if(args[i]==='--version'){console.log(manifest.version);process.exit(0);}
    if(!['--workspace','--config'].includes(args[i])||!args[i+1])throw Error('Use --workspace <folder> and optionally --config <jade.json>.');
    options[args[i].slice(2)]=args[++i];
  }
  const workspace=new Workspace({cwd:options.workspace||process.cwd(),configFile:options.config}),client=new CliClient(),operations=new JadeOperations({workspace,client});
  const handle=serveStdio(()=>new JadeServer({operations,workspace,version:manifest.version}).server,{onerror:error=>console.error(error.message)});
  process.stdin.once('end',()=>void client.close());
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{void client.close().then(()=>handle.close()).catch(error=>{console.error(error.message);process.exitCode=1;});});
}catch(error){console.error(error.message);process.exitCode=2;}

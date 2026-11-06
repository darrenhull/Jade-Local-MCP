import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

/** Adapts tool arguments to the CLI's shared discovery and command preparation. */
export class Workspace {
  constructor({cwd=process.cwd(),configFile,commands}={}) {this.cwd=path.resolve(cwd);this.configFile=configFile;this.commands=commands||require('jade-tools-cli/commands');}
  prepare(command,input={}) {
    const argv=[];
    if(this.configFile)argv.push('--config',path.resolve(this.cwd,this.configFile));
    for(const key of ['query','limit','offset','target'])if(input[key]!==undefined)argv.push('--'+key,String(input[key]));
    if(input.files)argv.push(...input.files);
    const prepared=this.commands.prepareCommand(command,argv,this.cwd);
    if(input.methods?.length)prepared.config.methods=input.methods;
    return prepared;
  }
  run(prepared,execute) {return this.commands.runCommand(prepared,execute);}
  describe() {const {config,configFile}=this.prepare('doctor');return {configFile:configFile||null,workspaceRoots:config.workspaceRoots,installPath:config.installPath||null,databasePath:config.databasePath||null,server:config.server||'singleUser',schema:config.schema||null,source:'saved files on disk'};}
}

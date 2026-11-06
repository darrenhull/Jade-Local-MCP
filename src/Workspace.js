import path from 'node:path';

/** Encodes tool inputs; native CLI owns discovery, configuration and dependency selection. */
export class Workspace {
  constructor({cwd=process.cwd(),configFile}={}) {this.cwd=path.resolve(cwd);this.configFile=configFile;}
  prepare(command,input={}) {
    if(['status','disconnect','shutdown'].includes(command))return {command};
    const argv=[];
    if(this.configFile)argv.push('--config',path.resolve(this.cwd,this.configFile));
    for(const key of ['query','limit','offset','target'])if(input[key]!==undefined)argv.push('--'+key,String(input[key]));
    if(input.files?.length){
      for(const file of input.files){
        if(typeof file!=='string'||!file||file.startsWith('-'))throw Error('A source file must be a positional path.');
      }
      argv.push('--',...input.files);
    }
    const request={command:'cli',operation:command,argv,cwd:this.cwd,restrictToWorkspace:true};
    if(input.methods?.length)request.methods=input.methods;
    if(command.startsWith('inspect.')){
      request.target=input.target||'working';request.sessionId=input.sessionId||'default';
      request.args=Object.fromEntries(['oid','classOid','cursor','limit','includeSubclasses','includeSystem'].filter(key=>input[key]!==undefined).map(key=>[key,input[key]]));
      if(command==='inspect.catalog')request.args={...request.args,limit:input.limit??50,offset:input.offset??0,...Object.fromEntries(['query','schema','refresh'].filter(key=>input[key]!==undefined).map(key=>[key,input[key]]))};
    }
    return request;
  }
  run(prepared,execute){return execute(prepared);}
  async describe(execute){
    if(typeof execute!=='function')throw Error('Native workspace preparation requires a CLI connection.');
    const result=await execute({...this.prepare('doctor'),command:'prepare'});
    if(!result.passed)throw Error(result.report?.error||'Native workspace preparation failed.');
    const {config={},configFile}=result.prepared;
    return {configFile:configFile||null,workspaceRoots:config.workspaceRoots,installPath:config.installPath||null,databasePath:config.databasePath||null,server:config.server||'singleUser',schema:config.schema||null,source:'saved files on disk'};
  }
}

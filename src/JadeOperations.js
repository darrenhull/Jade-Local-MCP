/** Applies MCP paging and job tracking; all native semantics stay in the CLI SDK. */
export class JadeOperations {
  constructor({workspace,client}) {this.workspace=workspace;this.client=client;this.active=new Map();}
  jobs() {return [...this.active.values()].map(({id,command})=>({id,command}));}
  cancel(id) {return this.client.cancel(id);}
  async invoke(request,context={}) {
    let nativeOutput='',progress=0,lastNotification=0;
    const signal=context.mcpReq?.signal;
    const operation=this.client.submit(request,text=>{
      nativeOutput=(nativeOutput+text).slice(-32768);
      const token=context.mcpReq?._meta?.progressToken;
      if(token!==undefined&&Date.now()-lastNotification>=200){lastNotification=Date.now();void context.mcpReq.notify({method:'notifications/progress',params:{progressToken:token,progress:++progress,message:text.slice(-2000)}}).catch(()=>{});}
    },signal);
    this.active.set(operation.id,{id:operation.id,command:request.command});
    try{const result=await operation.completion;return nativeOutput?{...result,nativeOutput}:result;}finally{this.active.delete(operation.id);}
  }
  async execute(command,input={},context={}) {
    if(command==='jobs')return {code:0,passed:true,rows:this.jobs()};
    if(command==='cancel')return this.cancel(input.operationId);
    const prepared=this.workspace.prepare(command,input);
    if(['build','test'].includes(command))return this.workspace.run(prepared,request=>this.invoke(request,context));
    const request={command,config:prepared.config,query:input.query,limit:input.limit,offset:input.offset};
    if(command.startsWith('inspect.')){
      request.target=input.target||'working';request.sessionId=input.sessionId||'default';
      request.args=Object.fromEntries(['oid','classOid','cursor','limit','includeSubclasses','includeSystem'].filter(key=>input[key]!==undefined).map(key=>[key,input[key]]));
    }
    let result=await this.invoke(request,context);
    if(command.startsWith('inspect.'))result={...result,target:request.target,sessionId:request.sessionId};
    if(command==='inspect.catalog'&&result.passed){
      const query=(input.query||'').toLowerCase(),schema=(input.schema||'').toLowerCase(),offset=input.offset||0,limit=input.limit||50;
      const rows=(result.body.schemas||[]).flatMap(s=>(s.classes||[]).map(c=>({...c,schema:s.name}))).filter(c=>(!schema||c.schema.toLowerCase()===schema)&&(!query||(c.schema+'::'+c.name).toLowerCase().includes(query)));
      return {...result,body:{readOnly:true,rows:rows.slice(offset,offset+limit),total:rows.length,offset,next_offset:offset+limit<rows.length?offset+limit:null}};
    }
    if(Array.isArray(result.rows))return {...result,next_offset:result.offset+result.rows.length<result.total?result.offset+result.rows.length:null};
    return result;
  }
}

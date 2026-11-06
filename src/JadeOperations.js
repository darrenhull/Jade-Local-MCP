/** Applies MCP output bounds and job tracking; native CLI owns database paging. */
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
    this.active.set(operation.id,{id:operation.id,command:request.operation||request.command});
    try{let result=await operation.completion;if(typeof result.report?.log==='string'&&result.report.log.length>32768)result={...result,report:{...result.report,log:result.report.log.slice(-32768)}};return nativeOutput?{...result,nativeOutput}:result;}finally{this.active.delete(operation.id);}
  }
  async execute(command,input={},context={}) {
    if(command==='jobs')return {code:0,passed:true,rows:this.jobs()};
    if(command==='cancel')return this.cancel(input.operationId);
    const prepared=this.workspace.prepare(command,input);
    let result=await this.workspace.run(prepared,request=>this.invoke(request,context));
    if(command.startsWith('inspect.'))result={...result,target:input.target||'working',sessionId:input.sessionId||'default'};
    if(command==='inspect.catalog'&&result.passed&&!Array.isArray(result.body?.rows))throw Error('Native CLI did not return a paged class catalogue. Update the pinned CLI distribution.');
    if(Array.isArray(result.rows))return {...result,next_offset:result.offset+result.rows.length<result.total?result.offset+result.rows.length:null};
    return result;
  }
}

import {randomUUID} from 'node:crypto';
import {NativeConnection} from './NativeConnection.js';

/** Owns only this MCP client's requests; native CLI owns broker and native leases. */
export class CliClient {
  constructor({connect=async()=>new NativeConnection()}={}) { this.connectBroker=connect; this.pending=new Map(); this.owned=new Set();this.cancelled=new Set();this.closed=false; }
  async connect() {
    if(this.closed)throw Error('The Jade MCP client is closed.');
    // Permit status/shutdown recovery; the broker still validates every native request.
    if(!this.connection)this.connection=this.connectBroker({allowMismatch:true}).then(client=>{
      if(this.closed){client.close();throw Error('The Jade MCP client closed during broker startup.');}
      this.client=client;
      this.unsubscribe=client.onEvent(packet=>{
        const request=this.pending.get(String(packet.id));if(!request)return;
        if(packet.event==='output')request.output(packet.text||'');
        if(packet.event==='result'){
          const result=packet.result;
          if(!result||typeof result.passed!=='boolean'||!Number.isInteger(result.code))request.reject(Error('The Jade broker returned an incomplete result.'));
          else request.resolve(result);
          this.pending.delete(String(packet.id));
        }
      });
      let failure;
      const fail=()=>{for(const request of this.pending.values())request.reject(failure||Error('The Jade broker connection closed. Retry after checking jade_status.'));this.pending.clear();this.connection=undefined;this.client=undefined;};
      client.socket.once('close',fail);client.socket.on('error',error=>failure=error);
      return client;
    }).catch(error=>{this.connection=undefined;throw error;});
    return this.connection;
  }
  submit(request,output=()=>{},signal) {
    const id=randomUUID();this.owned.add(id);
    const completion=(async()=>{
      if(signal?.aborted||this.cancelled.has(id))return {code:130,passed:false,cancelled:true};
      const client=await this.connect();
      if(signal?.aborted||this.cancelled.has(id))return {code:130,passed:false,cancelled:true};
      const abort=()=>this.cancel(id);
      try{return await new Promise((resolve,reject)=>{
        this.pending.set(id,{resolve,reject,output});signal?.addEventListener('abort',abort,{once:true});
        try{client.send({...request,id});}catch(error){this.pending.delete(id);reject(error);}
      });}finally{signal?.removeEventListener('abort',abort);}
    })().finally(()=>{this.owned.delete(id);this.cancelled.delete(id);});
    return {id,completion};
  }
  cancel(id) {
    const owned=this.owned.has(id);
    if(owned){this.cancelled.add(id);if(this.pending.has(id))this.client?.send({id:randomUUID(),command:'cancel',operationId:id});}
    return {code:0,passed:true,cancelled:owned};
  }
  async close() {this.closed=true;this.unsubscribe?.();this.client?.close();for(const request of this.pending.values())request.reject(Error('The Jade MCP client closed.'));this.pending.clear();}
}

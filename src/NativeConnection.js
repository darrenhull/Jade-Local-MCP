import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {EventEmitter} from 'node:events';
import {StringDecoder} from 'node:string_decoder';

/** Thin JSONL transport. The native executable owns command and broker semantics. */
export class NativeConnection {
  constructor({entry=fileURLToPath(new URL('../native/jade-cli.exe',import.meta.url)),spawn:spawnProcess=spawn}={}) {
    if(path.extname(entry).toLowerCase()!=='.exe')throw Error('The Jade CLI must be a native Windows executable.');
    this.entry=entry;this.spawn=spawnProcess;this.socket=new EventEmitter();this.socket.on('error',()=>{});
    this.events=new Set();this.decoder=new StringDecoder('utf8');this.buffer='';this.stderr='';this.closed=false;
  }
  start() {
    if(this.closed)throw Error('The native Jade CLI connection is closed.');
    if(this.child)return;
    const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
    const child=this.child=this.spawn(this.entry,['service','--stdio'],{env,windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']});
    child.once('error',error=>this.fail(Error('The native Jade CLI could not start: '+error.message)));
    child.stdin.on('error',error=>this.fail(Error('The native Jade CLI input failed: '+error.message)));
    for(const name of ['stdout','stderr'])child[name].on('error',error=>this.fail(Error('The native Jade CLI '+name+' failed: '+error.message)));
    child.stderr.on('data',data=>this.stderr=(this.stderr+data.toString('utf8')).slice(-8192));
    child.once('close',code=>{if(!this.closed)this.fail(Error('The native Jade CLI closed (exit '+code+'). '+this.stderr));});
    child.stdout.on('data',bytes=>{
      try {
        this.buffer+=this.decoder.write(bytes);
        if(Buffer.byteLength(this.buffer)>8*1024*1024)throw Error('Response exceeds the 8 MiB limit.');
        let end;
        while((end=this.buffer.indexOf('\n'))>=0){
          const line=this.buffer.slice(0,end).trim();this.buffer=this.buffer.slice(end+1);if(!line)continue;
          const packet=JSON.parse(line);for(const handler of this.events)handler(packet);
        }
      }catch(error){this.fail(Error('Invalid native Jade CLI response: '+error.message));}
    });
  }
  onEvent(handler){this.events.add(handler);return ()=>this.events.delete(handler);}
  send(packet){this.start();this.child.stdin.write(JSON.stringify(packet)+'\n');}
  fail(error){if(this.closed)return;this.socket.emit('error',error);this.close();}
  close(){if(this.closed)return;this.closed=true;this.child?.stdin.end();this.child?.kill();this.events.clear();this.socket.emit('close');}
}

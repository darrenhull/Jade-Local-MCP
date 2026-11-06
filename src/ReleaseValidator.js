import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {NativeDistribution} from './NativeDistribution.js';

/** Validates this adapter's identity and built distribution, never a Jade database. */
export class ReleaseValidator {
  constructor(root){this.root=path.resolve(root);}
  validate(tag){
    const manifest=JSON.parse(fs.readFileSync(path.join(this.root,'package.json'),'utf8'));
    if(!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(manifest.version)||manifest.version==='0.0.0')throw Error('A non-placeholder MCP package version is required.');
    if(tag!==undefined&&tag!=='v'+manifest.version)throw Error('Release tag must match package version v'+manifest.version+'.');
    const entry=manifest.bin?.['jade-mcp'];
    if(typeof entry!=='string'||path.isAbsolute(entry)||entry.split(/[\\/]/).includes('..')||!fs.existsSync(path.join(this.root,entry)))throw Error('A local jade-mcp entrypoint is required.');
    if(!manifest.dependencies?.['@modelcontextprotocol/server'])throw Error('The official MCP server SDK is required.');
    new NativeDistribution(path.join(this.root,'packages/jade-cli-win-x64')).verify();
    return manifest;
  }
  verifyArtifacts(){
    const manifest=this.validate(),directory=path.join(this.root,'dist/jade-mcp-win-x64'),distribution=JSON.parse(fs.readFileSync(path.join(directory,'distribution.json'),'utf8'));
    const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    if(distribution.packageVersion!==manifest.version||distribution.executable!=='jade-mcp.exe')throw Error('MCP distribution identity does not match the release.');
    if(sha(path.join(directory,'jade-mcp.exe'))!==distribution.executableSha256)throw Error('MCP executable checksum mismatch.');
    for(const [relative,expected] of Object.entries(distribution.runtimeFiles)){
      if(path.isAbsolute(relative)||relative.split(/[\\/]/).includes('..')||sha(path.join(directory,relative))!==expected)throw Error('MCP runtime checksum mismatch: '+relative);
    }
    const files=[path.join(this.root,'dist/jade-mcp-win-x64.zip'),path.join(this.root,'jade-mcp.exe')];
    fs.writeFileSync(path.join(this.root,'dist/SHA256SUMS'),files.map(file=>sha(file)+'  '+path.basename(file)).join('\n')+'\n');
    return files;
  }
}

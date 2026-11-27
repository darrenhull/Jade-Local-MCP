import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
test('Git keeps exact bundled release bytes under Windows newline conversion',()=>{
 const content=Buffer.from('native release\r\nexact bytes\r\n');
 const git=args=>{const result=spawnSync('git.exe',['-c','core.autocrlf=true',...args],{cwd:root,input:content,encoding:'utf8',windowsHide:true});assert.ifError(result.error);assert.equal(result.status,0,result.stderr);return result.stdout.trim();};
 const literal=git(['hash-object','--no-filters','--stdin']);
 for(const file of ['licenses/tomlplusplus-LICENSE.txt','distribution.json','README.md'])assert.equal(git(['hash-object','--path=packages/jade-cli-win-x64/'+file,'--stdin']),literal,'Git changed bundled '+file);
});

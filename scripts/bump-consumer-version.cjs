'use strict';
const fs=require('node:fs'),path=require('node:path');
function bumpConsumerVersion(root){
 const files=['package.json','package-lock.json'].filter(file=>fs.existsSync(path.join(root,file)));
 const values=files.map(file=>{const text=fs.readFileSync(path.join(root,file),'utf8');return{file,value:JSON.parse(text),newline:text.includes('\r\n')?'\r\n':'\n'};});
 const current=values.find(item=>item.file==='package.json')?.value.version;
 if(!/^\d+\.\d+\.\d+$/.test(current||''))throw Error('Expected a stable consumer version.');
 const parts=current.split('.').map(Number);parts[2]++;const version=parts.join('.');
 for(const item of values){if(item.value.version!==current)throw Error('Consumer package versions must match before updating.');item.value.version=version;if(item.file==='package-lock.json'&&item.value.packages?.[''])item.value.packages[''].version=version;}
 for(const item of values)fs.writeFileSync(path.join(root,item.file),(JSON.stringify(item.value,null,2)+'\n').replace(/\n/g,item.newline));
 return version;
}
module.exports={bumpConsumerVersion};
if(require.main===module)console.log(bumpConsumerVersion(process.cwd()));

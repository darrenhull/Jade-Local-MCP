/** Copy only locked production packages and the CLI's runtime sidecars. */
export function productionDependencyFilter(lock){
  const packages=Object.entries(lock.packages||{}).filter(([name,value])=>name.startsWith('node_modules/')&&!value.dev).map(([name])=>name);
  return relative=>{
    if(relative!=='node_modules'&&!relative.startsWith('node_modules/'))return true;
    if(relative.startsWith('node_modules/jade-tools-cli/')){
      const local=relative.slice('node_modules/jade-tools-cli/'.length);
      if(!['bin','sdk','licenses'].some(folder=>local===folder||local.startsWith(folder+'/'))&&!['package.json','ThirdPartyNotices.txt','README.md'].includes(local))return false;
    }
    return packages.some(folder=>relative===folder||relative.startsWith(folder+'/')||folder.startsWith(relative+'/'));
  };
}

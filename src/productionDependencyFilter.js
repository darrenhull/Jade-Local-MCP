/** Copy official MCP production packages; the CLI is a separate native payload. */
export function productionDependencyFilter(lock){
  const packages=Object.entries(lock.packages||{}).filter(([name,value])=>name.startsWith('node_modules/')&&!value.dev&&!(value.link&&lock.packages?.[value.resolved]?.dev)).map(([name])=>name);
  return relative=>{
    if(['src/NativeDistribution.js','src/ReleaseValidator.js','src/productionDependencyFilter.js'].includes(relative))return false;
    if(relative!=='node_modules'&&!relative.startsWith('node_modules/'))return true;
    if(relative==='node_modules/jade-tools-cli'||relative.startsWith('node_modules/jade-tools-cli/'))return false;
    return packages.some(folder=>relative===folder||relative.startsWith(folder+'/')||folder.startsWith(relative+'/'));
  };
}

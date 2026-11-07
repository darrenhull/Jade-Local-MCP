import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {NativeDistribution} from '../src/NativeDistribution.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function stageNative(){const distribution=new NativeDistribution(process.env.JADE_CLI_DISTRIBUTION||path.join(root,'packages/jade-cli-win-x64'));const oidFormat=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).jadeMcp?.requiredOidFormat;distribution.verifyPin(path.join(root,'packages/jade-cli-pin.json'),{oidFormat});return distribution.stage(path.join(root,'native'));}

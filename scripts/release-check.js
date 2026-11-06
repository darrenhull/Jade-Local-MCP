import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ReleaseValidator} from '../src/ReleaseValidator.js';
const validator=new ReleaseValidator(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
try{if(!process.env.RELEASE_TAG)throw Error('Set RELEASE_TAG to the matching v<package version> tag.');validator.validate(process.env.RELEASE_TAG);if(process.argv.includes('--artifacts'))validator.verifyArtifacts();console.log('MCP release version'+(process.argv.includes('--artifacts')?' and distribution checksums':'')+' validated.');}catch(error){console.error(error.message);process.exitCode=1;}

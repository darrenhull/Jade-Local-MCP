import test from 'node:test';
import assert from 'node:assert/strict';
import {semanticSourceTools} from '../../src/SemanticSourceTools.js';
import {tools} from '../../src/tools.js';
test('raw JOX editor text respects the native four MiB UTF8 boundary before dispatch',()=>{
 const schema=tools().find(tool=>tool.name==='jade_read_source').inputSchema;
 const input={provider:'jox',projectId:'project',generation:'generation',originUri:'file:///C:/project/schemas/Fish.jox',position:{line:0,character:0},originText:'€'.repeat(Math.floor(4*1024*1024/3)+1)};
 assert.equal(schema.safeParse(input).success,false,'Native byte limit must reject multibyte text before transport');
 assert.equal(semanticSourceTools().length,4);
});

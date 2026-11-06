import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const read=file=>fs.readFileSync(fileURLToPath(new URL('../../'+file,import.meta.url)),'utf8');
test('MCP workflows use only local integration automation and never an extension checkout or SHA',()=>{
 for(const name of fs.readdirSync(fileURLToPath(new URL('../../.github/workflows/',import.meta.url)))){
  const workflow=read('.github/workflows/'+name);
  assert.doesNotMatch(workflow,/Jade-VSCode-Extension|consumer_automation_ref|\.jade-automation/);
  for(const call of workflow.matchAll(/uses: (\.\/\.github\/workflows\/[^\s]+)/g))assert.ok(fs.existsSync(fileURLToPath(new URL('../../'+call[1],import.meta.url))));
 }
});
test('CLI publication is detected every five minutes with manual override and no external application credentials',()=>{
 const update=read('.github/workflows/update-cli.yml');
 assert.match(update,/4-59\/5 \* \* \* \*/);assert.match(update,/workflow_dispatch:/);assert.match(update,/uses: \.\/\.github\/workflows\/update-consumer.yml/);
 assert.match(update,/group: mcp-cli-release-update/);assert.match(update,/cancel-in-progress: false/);
 assert.doesNotMatch(update,/repository_dispatch:|secrets:|APP_TOKEN|consumer_automation_ref/);
 assert.match(update,/scripts\/update-cli\.js/);assert.match(read('.github/workflows/update-consumer.yml'),/github\.token/);
});

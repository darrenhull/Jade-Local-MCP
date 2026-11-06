import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const read=name=>fs.readFileSync(fileURLToPath(new URL('../../.github/workflows/'+name,import.meta.url)),'utf8');
test('full MCP builds are restricted to PR events, main pushes, manual requests and release tags',()=>{
 const workflow=read('build.yml');
 assert.match(workflow,/branches: \['main'\]/);
 assert.match(workflow,/pull_request:/);assert.match(workflow,/workflow_dispatch:/);assert.match(workflow,/tags: \['v\*'\]/);
 assert.doesNotMatch(workflow,/\n  open-agent-pr:/);assert.match(workflow,/\n  build:/);
});
test('MCP agent pushes reuse only the pinned consumer bot PR workflow without dispatching builds',()=>{
 const workflow=read('agent-pr.yml');
 assert.match(workflow,/branches: \['codex\/agent\/\*\*'\]/);
 assert.match(workflow,/uses: darrenhull\/Jade-VSCode-Extension\/\.github\/workflows\/open-agent-pr\.yml@(?:[a-f0-9]{40}|TODO_ROOT_AUTOMATION_SHA)/);
 assert.doesNotMatch(workflow,/npm |setup-node@|actions: write|gh workflow run|workflow_dispatch/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('actual draft opener creates or reuses drafts without requesting human review or merge',()=>{
  const result=spawnSync('pwsh',['-NoProfile','-File',fileURLToPath(new URL('./AgentPullRequest_workflow_tests.ps1',import.meta.url))],{encoding:'utf8',windowsHide:true,timeout:30000});
  assert.equal(result.status,0,(result.error?.message||'')+result.stdout+result.stderr);
});

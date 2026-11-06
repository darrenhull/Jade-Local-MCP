import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const workflow = fs.readFileSync(new URL('../../.github/workflows/build.yml', import.meta.url), 'utf8');
const conditions = [...workflow.matchAll(/^  (release-guard|release):\r?\n    if: (.+)$/gm)];

test('manual release recovery runs both ancestry and publication gates only on main', () => {
  assert.equal(conditions.length, 2);
  for (const [, job, expression] of conditions) {
    assert.match(expression, /^[a-zA-Z0-9_. '\/()&|=!]+$/);
    for (const [event, ref, expected] of [
      ['push', 'refs/heads/main', true],
      ['workflow_dispatch', 'refs/heads/main', true],
      ['workflow_dispatch', 'refs/heads/feature', false],
      ['pull_request', 'refs/pull/8/merge', false],
      ['push', 'refs/tags/v0.3.1', false],
    ]) {
      const evaluate = new Function('github', `return (${expression});`);
      assert.equal(evaluate({event_name: event, ref}), expected, `${job}: ${event} ${ref}`);
    }
  }
  assert.match(workflow, /needs: \[build, release-guard\]/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {Client, InMemoryTransport} from '@modelcontextprotocol/client';
import {JadeServer} from '../../src/JadeServer.js';
import {JadeOperations} from '../../src/JadeOperations.js';
import {Workspace} from '../../src/Workspace.js';

const oid = 'a'.repeat(44);
const inspections = [
  ['jade_inspect_catalog', 'inspect.catalog', {}],
  ['jade_inspect_instances', 'inspect.instances', {classOid: oid}],
  ['jade_inspect_object', 'inspect.object', {oid}],
  ['jade_inspect_collection', 'inspect.collection', {oid}],
  ['jade_release_cursor', 'inspect.release', {cursor: 'owned-cursor'}],
  ['jade_close_inspection', 'inspect.close', {}],
];
const reads = [...inspections, ['jade_doctor', 'doctor', {}], ['jade_list_tests', 'tests.list', {}], ['jade_search_source', 'source.search', {}], ['jade_status', 'status', {}], ['jade_list_jobs', 'jobs', {}]];

async function connect(t) {
  const requests = [];
  const native = {submit(request) {
    requests.push(request);
    return {id: String(requests.length), completion: Promise.resolve({code: 0, passed: true, body: {rows: []}})};
  }};
  const workspace = new Workspace({cwd: process.cwd()});
  const api = new JadeServer({operations: new JadeOperations({workspace, client: native}), workspace});
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({name: 'jade-read-only-boundary-test', version: '1.0.0'});
  await api.server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => { await client.close(); await api.server.close(); });
  return {client, requests};
}

test('all read tools reject mutation-shaped extra and nested arguments before native dispatch', async t => {
  const {client, requests} = await connect(t);
  for (const [name, , input] of reads) {
    for (const mutation of [
      {command: 'native.run'}, {operation: 'publish'}, {readOnly: false},
      {config: {readOnly: false, target: 'source'}}, {args: {command: 'delete', value: {updating: true}}},
      {property: 'name', value: 'changed'}, {transaction: 'commit'}, {sourceText: 'beginTransaction;'},
    ]) {
      const result = await client.callTool({name, arguments: {...input, ...mutation}});
      assert.equal(result.isError, true, `${name}: ${JSON.stringify(mutation)}`);
    }
  }
  assert.equal(requests.length, 0);
});

test('inspection tools preserve valid Source and Working identity through fixed allowlisted operations', async t => {
  const {client, requests} = await connect(t);
  for (const target of ['source', 'working']) {
    for (const [name, operation, input] of inspections) {
      const result = await client.callTool({name, arguments: {...input, target, sessionId: 'read-only-session'}});
      assert.equal(result.isError, false, name);
      assert.equal(result.structuredContent.target, target);
      assert.equal(result.structuredContent.sessionId, 'read-only-session');
      const request = requests.at(-1);
      assert.equal(request.command, 'cli');
      assert.equal(request.operation, operation);
      assert.equal(request.target, target);
      assert.equal(request.sessionId, 'read-only-session');
      assert.equal(request.restrictToWorkspace, true);
      assert.equal(request.config, undefined);
      assert.equal(request.readOnly, undefined);
      assert.ok(Object.keys(request.args).every(key => ['oid', 'classOid', 'cursor', 'limit', 'offset', 'includeSubclasses', 'includeSystem', 'query', 'schema', 'refresh'].includes(key)));
    }
  }
});

test('invalid database identity and nested OID inputs cannot reach inspection handlers', async t => {
  const {client, requests} = await connect(t);
  for (const input of [{oid: {value: oid, set: true}}, {oid: 'delete Object'}, {oid, target: 'source --write'}, {oid, sessionId: {path: '../source'}}]) {
    const result = await client.callTool({name: 'jade_inspect_object', arguments: input});
    assert.equal(result.isError, true);
  }
  assert.equal(requests.length, 0);
});

test('mutation-looking search text remains a filter value on a fixed read operation', async t => {
  const {client, requests} = await connect(t);
  const query = 'beginTransaction; delete Object; --config other.json';
  for (const [name, operation] of [['jade_inspect_catalog', 'inspect.catalog'], ['jade_search_source', 'source.search']]) {
    const result = await client.callTool({name, arguments: {query}});
    assert.equal(result.isError, false);
    const request = requests.at(-1);
    assert.equal(request.operation, operation);
    assert.deepEqual(request.argv.slice(0, 2), ['--query', query]);
    assert.equal(request.config, undefined);
    assert.equal(request.sourceText, undefined);
  }
});

test('discovery distinguishes read-only inspection of both targets from Working execution', async t => {
  const {client} = await connect(t);
  const tools = (await client.listTools()).tools;
  for (const [name] of inspections) {
    const tool = tools.find(value => value.name === name);
    assert.equal(tool.annotations.readOnlyHint, true, name);
    assert.equal(tool.annotations.destructiveHint, false, name);
    assert.match(tool.description, /read.only.*(?:Source.*Working|Working.*Source)/i);
  }
  for (const name of ['jade_build', 'jade_test']) assert.equal(tools.find(value => value.name === name).annotations.readOnlyHint, false);
  for (const name of ['jade_execute', 'jade_query', 'jade_publish', 'jade_set_property', 'jade_delete_object', 'native.run']) assert.equal(tools.some(tool => tool.name === name), false);
  const resource = await client.readResource({uri: 'jade://capabilities'});
  assert.deepEqual(JSON.parse(resource.contents[0].text).inspection, {targets: ['source', 'working'], readOnly: true, arbitraryEvaluation: false});
  assert.match(client.getInstructions(), /read.only.*(?:Source.*Working|Working.*Source)/i);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {Client, InMemoryTransport} from '@modelcontextprotocol/client';
import {JadeServer} from '../../src/JadeServer.js';
import {JadeOperations} from '../../src/JadeOperations.js';
import {Workspace} from '../../src/Workspace.js';

async function connect(t, response) {
  const requests = [];
  const clientAdapter = {submit(request) { requests.push(request); return {id: String(requests.length), completion: Promise.resolve(response)}; }};
  const workspace = new Workspace({cwd: process.cwd()});
  const api = new JadeServer({operations: new JadeOperations({workspace, client: clientAdapter}), workspace});
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({name: 'jade-native-identity-contract', version: '1.0.0'});
  await api.server.connect(serverTransport); await client.connect(clientTransport);
  t.after(async () => { await client.close(); await api.server.close(); });
  return {client, requests};
}

test('bounded identity text reaches the fixed native parser unchanged for both targets', async t => {
  const {client, requests} = await connect(t, {code: 0, passed: true, body: {oidFormat: 'jade-native'}});
  // These are transport sentinels, not claims of vendor-format validity.
  // Native integration tests own real formatter/parser validity.
  for (const value of ['Native vendor formatter output', 'a'.repeat(44), 'é'.repeat(256)]) {
    for (const target of ['source', 'working']) {
      for (const [name, key, operation] of [['jade_inspect_object', 'oid', 'inspect.object'], ['jade_inspect_collection', 'oid', 'inspect.collection'], ['jade_inspect_instances', 'classOid', 'inspect.instances']]) {
        const result = await client.callTool({name, arguments: {[key]: value, target, sessionId: 'identity-session'}});
        assert.equal(result.isError, false);
        const request = requests.at(-1);
        assert.equal(request.operation, operation);
        assert.equal(request.args[key], value);
        assert.equal(request.target, target);
        assert.equal(request.sessionId, 'identity-session');
      }
    }
  }
});

test('native parser failures remain read-only tool errors without rewriting the native report', async t => {
  const response = {code: 2, passed: false, report: {error: 'Native object identity parser rejected input.'}};
  const {client, requests} = await connect(t, response);
  const result = await client.callTool({name: 'jade_inspect_object', arguments: {oid: 'invalid native identity', target: 'source'}});
  assert.equal(result.isError, true);
  assert.equal(result.structuredContent.code, response.code);
  assert.deepEqual(result.structuredContent.report, response.report);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].operation, 'inspect.object');
  assert.equal(requests[0].config, undefined);
});

test('native identities and non-identity data pass through every response shape without conversion', async t => {
  const nativeObject = 'native object identity';
  const nativeClass = 'native class identity';
  const nativeReference = 'native reference identity';
  const body = {
    oidFormat: 'jade-native', oid: nativeObject, classOid: nativeClass, readOnly: true,
    properties: [{name: 'friend', type: 'Object', value: nativeReference, oid: nativeReference}, {name: 'name', type: 'String', value: 'ordinary text'}, {name: 'age', type: 'Integer', value: 12}],
    rows: [{oid: nativeObject, classOid: nativeClass, keys: [{value: nativeReference, oid: nativeReference}]}],
    cursor: 'opaque-cursor-token', sessionId: 'opaque-native-session',
  };
  const {client} = await connect(t, {code: 0, passed: true, body});
  for (const name of ['jade_inspect_catalog', 'jade_inspect_object', 'jade_inspect_collection']) {
    const result = await client.callTool({name, arguments: name === 'jade_inspect_catalog' ? {} : {oid: nativeObject}});
    assert.equal(result.isError, false);
    assert.deepEqual(result.structuredContent.body, body);
  }
});

test('identity bounds and strict mutation rejection remain before native dispatch', async t => {
  const {client, requests} = await connect(t, {code: 0, passed: true});
  for (const oid of ['', 'x'.repeat(513), 'é'.repeat(257), 'native\0identity', 'native\nidentity', 'native\u007fidentity', {oid: 'nested'}]) {
    const result = await client.callTool({name: 'jade_inspect_object', arguments: {oid}});
    assert.equal(result.isError, true);
  }
  const mutation = await client.callTool({name: 'jade_inspect_object', arguments: {oid: 'native identity', command: 'delete', readOnly: false}});
  assert.equal(mutation.isError, true);
  assert.equal(requests.length, 0);
});

test('an older backend cannot return raw serialized identities as canonical Jade data', async t => {
  const {client} = await connect(t, {code: 0, passed: true, body: {oid: 'a'.repeat(44)}});
  const result = await client.callTool({name: 'jade_inspect_object', arguments: {oid: 'a'.repeat(44)}});
  assert.equal(result.isError, true);
  assert.match(JSON.stringify(result.content), /Jade CLI.*0\.3\.2|jade-native/i);
  assert.equal(JSON.stringify(result.content).includes('a'.repeat(44)), false);
});

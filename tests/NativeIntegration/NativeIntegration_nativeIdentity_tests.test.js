import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {Client, InMemoryTransport} from '@modelcontextprotocol/client';
import {JadeServer} from '../../src/JadeServer.js';
import {JadeOperations} from '../../src/JadeOperations.js';
import {Workspace} from '../../src/Workspace.js';
import {CliClient} from '../../src/CliClient.js';
import {NativeConnection} from '../../src/NativeConnection.js';

const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function privateContext() {
  const context = JSON.parse(fs.readFileSync(process.env.JADE_MCP_NATIVE_OID_CONTEXT, 'utf8'));
  const root = fs.realpathSync(context.root), temporary = fs.realpathSync(os.tmpdir());
  const inside = (base, value) => {
    const relative = path.relative(base, fs.realpathSync(value));
    return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
  };
  assert.ok(inside(temporary, root) && ['jade-mcp-native-identity-', 'jade-cli-integration-seed-oids-mcp-'].some(prefix => path.basename(root).startsWith(prefix)));
  for (const key of ['workspace', 'storagePath', 'databasePath', 'cliExecutable']) assert.ok(inside(root, context[key]), key);
  const settings = JSON.parse(fs.readFileSync(path.join(context.workspace, 'jade.json'), 'utf8'));
  assert.equal(fs.realpathSync(settings.databasePath), fs.realpathSync(context.databasePath));
  assert.equal(fs.realpathSync(settings.storagePath), fs.realpathSync(context.storagePath));
  assert.ok(inside(root, settings.iniPath));
  const ini = fs.readFileSync(settings.iniPath, 'utf8');
  for (const [, value] of ini.matchAll(/^(?:CrashLogDirectory|ProcessDumpDirectory|ProgramDataDirectory|JadeWorkDirectory|ActivityLogDirectory|JournalRootDirectory|FileDirectory|LogDirectory|DefaultLogDirectory)=(.+)$/gm)) {
    const relative = path.relative(root, path.resolve(value.trim()));
    assert.ok(relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative), 'Fixture INI directories must stay in the owned root.');
  }
  assert.equal(settings.schema, 'RootSchema');
  assert.equal(settings.workingDatabaseDirectory, undefined);
  assert.equal(digest(context.cliExecutable), context.cliSha256);
  assert.equal(digest(path.join(path.dirname(context.cliExecutable), 'native/jade-inspect-helper.exe')), context.nativeInspectorSha256);
  const manifest = JSON.parse(fs.readFileSync(path.join(path.dirname(context.cliExecutable), 'distribution.json'), 'utf8'));
  assert.equal(manifest.oidFormat, 'jade-native');
  return context;
}

test('real MCP inspection preserves native identities and read-only session boundaries', {
  skip: !process.env.JADE_MCP_NATIVE_OID_CONTEXT, timeout: 240000,
}, async t => {
  const fixture = privateContext(), records = [], identities = [];
  const previous = {state: process.env.JADE_TOOLS_STATE_DIRECTORY, path: process.env.PATH};
  process.env.JADE_TOOLS_STATE_DIRECTORY = path.join(fixture.root, 'broker');
  process.env.PATH = path.join(process.env.SystemRoot || 'C:/Windows', 'System32');
  const native = new CliClient({connect: async () => new NativeConnection({entry: fixture.cliExecutable})});
  const workspace = new Workspace({cwd: fixture.workspace});
  const api = new JadeServer({operations: new JadeOperations({workspace, client: native}), workspace});
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({name: 'jade-native-identity-proof', version: '1.0.0'});
  let passed = false, error;
  const inspect = async (name, args) => {
    const result = await client.callTool({name, arguments: args});
    records.push({name, args, result});
    return result;
  };
  const verifyIdentities = value => {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      if (['oid', 'classOid'].includes(key) && typeof child === 'string') {
        assert.ok(!/^[a-f0-9]{44}$/i.test(child), 'Native output must not expose serialized 22-byte IDs.');
        identities.push(child);
        if (key === 'oid' && typeof value.value === 'string') assert.equal(value.value, child);
      }
      verifyIdentities(child);
    }
  };
  const body = (result, target, sessionId) => {
    assert.equal(result.isError, false, JSON.stringify(result));
    assert.equal(result.structuredContent.target, target);
    assert.equal(result.structuredContent.sessionId, sessionId);
    assert.equal(result.structuredContent.body.oidFormat, 'jade-native');
    verifyIdentities(result.structuredContent.body);
    return result.structuredContent.body;
  };
  try {
    await api.server.connect(serverTransport); await client.connect(clientTransport);
    const configuration = await native.submit({...workspace.prepare('doctor'), command: 'prepare'}).completion;
    assert.equal(configuration.passed, true, JSON.stringify(configuration));
    const preparation = native.submit({command: 'working.prepare', config: configuration.prepared.config, cwd: fixture.workspace});
    const prepared = await preparation.completion;
    records.push({name: 'private-fixture Working preparation (not a data tool)', result: prepared});
    assert.equal(prepared.passed, true, JSON.stringify(prepared));
    // Prepare private Working before opening a Source SingleUser inspection.
    body(await inspect('jade_inspect_catalog', {target: 'working', sessionId: 'prepare-working', includeSystem: true, query: 'Schema', limit: 10}), 'working', 'prepare-working');
    await inspect('jade_close_inspection', {target: 'working', sessionId: 'prepare-working'});
    let sourceCursor;
    for (const target of ['source', 'working']) {
      const sessionId = 'identity-' + target;
      const catalogue = body(await inspect('jade_inspect_catalog', {target, sessionId, includeSystem: true, query: 'Schema', limit: 100}), target, sessionId);
      assert.equal(catalogue.readOnly, true);
      const configurations = fs.readdirSync(path.join(fixture.root, 'broker/inspection')).filter(name => name.endsWith('.json')).map(name => JSON.parse(fs.readFileSync(path.join(fixture.root, 'broker/inspection', name), 'utf8')));
      const sourcePath = fs.realpathSync(fixture.databasePath);
      const selected = configurations.find(config => target === 'source' ? fs.realpathSync(config.databasePath) === sourcePath : fs.realpathSync(config.databasePath) !== sourcePath);
      assert.ok(selected, 'Inspect the actual helper database selection, not only echoed target text.');
      assert.equal(selected.readOnly, true);
      if (target === 'working') assert.ok(!path.relative(fs.realpathSync(fixture.storagePath), fs.realpathSync(selected.databasePath)).startsWith('..'));
      const schemaClass = catalogue.rows.find(row => row.name === 'Schema' && row.schema === 'RootSchema');
      assert.ok(schemaClass, 'Find the actual native class identity rather than invent one.');
      const object = body(await inspect('jade_inspect_object', {target, sessionId, oid: '1.1'}), target, sessionId);
      assert.equal(object.oid, '1.1');
      assert.equal(object.readOnly, true);
      const instances = body(await inspect('jade_inspect_instances', {target, sessionId, classOid: schemaClass.oid, limit: 2}), target, sessionId);
      assert.equal(instances.readOnly, true);
      if (instances.cursor) await inspect('jade_release_cursor', {target, sessionId, cursor: instances.cursor});
      let collection;
      for (const reference of object.properties.filter(property => typeof property.oid === 'string').slice(0, 20)) {
        const referenced = body(await inspect('jade_inspect_object', {target, sessionId, oid: reference.oid}), target, sessionId);
        assert.equal(referenced.oid, reference.oid);
        if (referenced.collection) { collection = referenced.oid; break; }
      }
      assert.ok(collection, 'A real Schema collection reference is required.');
      const page = body(await inspect('jade_inspect_collection', {target, sessionId, oid: collection, limit: 2}), target, sessionId);
      assert.equal(page.readOnly, true);
      if (target === 'source') sourceCursor = page.cursor;
      if (target === 'working' && sourceCursor) {
        const crossed = await inspect('jade_inspect_collection', {target, sessionId, oid: collection, cursor: sourceCursor, limit: 2});
        assert.equal(crossed.isError, true, 'A Source cursor cannot page a Working query.');
      }
      if (page.cursor && target === 'working') await inspect('jade_release_cursor', {target, sessionId, cursor: page.cursor});
      const invalid = await inspect('jade_inspect_object', {target, sessionId, oid: 'not a native Jade object identity'});
      assert.equal(invalid.isError, true);
      const recovered = body(await inspect('jade_inspect_object', {target, sessionId, oid: object.oid}), target, sessionId);
      assert.equal(recovered.oid, object.oid);
      if (target === 'working') body(await inspect('jade_close_inspection', {target, sessionId}), target, sessionId);
    }
    if (sourceCursor) await inspect('jade_release_cursor', {target: 'source', sessionId: 'identity-source', cursor: sourceCursor});
    body(await inspect('jade_close_inspection', {target: 'source', sessionId: 'identity-source'}), 'source', 'identity-source');
    assert.ok(identities.length > 10);
    passed = true;
  } catch (failure) { error = failure.message; throw failure; }
  finally {
    try { await client.callTool({name: 'jade_shutdown', arguments: {}}); } catch {}
    await client.close(); await api.server.close(); await native.close();
    if (previous.state === undefined) delete process.env.JADE_TOOLS_STATE_DIRECTORY; else process.env.JADE_TOOLS_STATE_DIRECTORY = previous.state;
    if (previous.path === undefined) delete process.env.PATH; else process.env.PATH = previous.path;
    fs.writeFileSync(path.join(fixture.root, 'mcp-native-identity-evidence.json'), JSON.stringify({passed, error, devCandidateOnly: true, sourceNeverPublished: true, noNodeOnChildPath: true, identities, records}, null, 2));
  }
});

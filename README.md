# Jade Local MCP

Local MCP server over the native C++ Jade CLI, using the official MCP TypeScript SDK v2. The server exposes native compile/test and read-only browsing to compatible clients without opening the Jade IDE. Native operations require the configured Windows Jade installation.

## Run the portable server

Download and extract the complete `jade-mcp-win-x64.zip` release. Keep its `bin`, `src`, `skills`, `native` and `node_modules` sidecars next to `jade-mcp.exe`. The MCP protocol adapter still uses the official JavaScript SDK and embeds Node in `jade-mcp.exe`; end users do not need a separate Node installation or VS Code. The separate `native/jade-cli.exe` is C++ and has no Node runtime. No JavaScript CLI/broker is used or included in the runtime bundle.

```powershell
C:\Tools\jade-mcp\jade-mcp.exe --workspace C:\repos\MyJadeProject
```

The server reserves standard output for the MCP protocol and writes errors to standard error. Its shared CLI backend discovers the nearest `jade.json` in the workspace or its parent folders. Paths inside that configuration are relative to the configuration file. `--config <file>` selects another configuration explicitly. Source files are saved files on disk; unsaved editor buffers are not implicitly included.

A minimal VS Code `.vscode/mcp.json` configuration is:

```json
{
  "servers": {
    "jade": {
      "type": "stdio",
      "command": "C:\\Tools\\jade-mcp\\jade-mcp.exe",
      "args": ["--workspace", "${workspaceFolder}"]
    }
  }
}
```

VS Code and other Copilot clients have different configuration file formats. See the [VS Code MCP configuration reference](https://code.visualstudio.com/docs/agents/reference/mcp-configuration) and [GitHub Copilot CLI setup](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers) for the client-specific location. The server itself uses standard local stdio.

## Tools

| Tool | Purpose |
|---|---|
| `jade_get_guidance` | Read the bundled Jade development skill without opening a database. |
| `jade_doctor` | Check native tool availability and resolved configuration. |
| `jade_build` | Compile selected CLS files or incrementally build the configured project when files are omitted. |
| `jade_test` | Run selected test files and optional method names in the warm native Working session. |
| `jade_list_tests` | Search and page schema-qualified tests from workspace files. |
| `jade_search_source` | Search and page schema-qualified workspace classes. |
| `jade_status` | Read shared broker and native process status. |
| `jade_list_jobs`, `jade_cancel` | Inspect or cancel requests owned by this MCP client. |
| `jade_inspect_catalog` | Search and page database classes and their native OIDs. |
| `jade_inspect_instances` | Read a bounded page of persistent instance identities. |
| `jade_inspect_object` | Read object properties without evaluating arbitrary code. |
| `jade_inspect_collection` | Read paged collection members and dictionary keys. |
| `jade_release_cursor`, `jade_close_inspection` | Release inspection state in its original target/session. |
| `jade_disconnect` | Explicitly release idle shared native sessions. |
| `jade_shutdown` | Explicitly stop the shared user broker and its owned native processes. |

All inspection tools default to `working`; `target: "source"` selects the configured Source database read-only. Class identities are schema-qualified; object OIDs and cursors remain tied to a target/session. Catalogue, test and source queries return bounded pages. Keep the same inspection session when paging a collection and close it before switching database identity.

Database catalogue filtering and paging happen in the native helper before its response crosses the transport boundary. Progress output and embedded report logs retain at most their last 32,768 characters; diagnostics, test results and the full native log file path remain available.

Build/test reuse the native CLI broker and its Jade session. C++ owns configuration discovery, dependency selection, successful-input change tracking and native operations. The MCP adapter only validates tool inputs and exchanges JSONL requests with `jade-cli.exe service --stdio`. Results preserve real Jade codes, source diagnostics and individual test failures. A failed build or test is an MCP tool error with a structured result. Cancellation covers owned requests waiting for startup as well as running operations.

Resources `jade://capabilities` and `jade://workspace` describe the actual implemented surface and non-secret resolved workspace identity. Prompt `jade_check_changes` guides a compile/test workflow.

## Agent skill and instructions

The versioned [Jade development skill](skills/jade-development/SKILL.md) is included in every portable distribution. MCP initialization instructions direct agents to read it using `jade_get_guidance` or `jade://skills/jade-development`; the tool supports clients that do not present resources. Both return the same packaged file, without opening a database or starting native work.

The skill covers Source versus Working, native build/test and inspection, saved files versus scratch snapshots, schema-qualified identity, formatting/Error Lens, recovery 3094, collection/designer limits, Workspace/JadeScript semantics and the native CLI architecture. It requires agents to consult installed capabilities rather than treating a plan as an implemented feature. Source recovery is distinct from compilation and publication and must not be performed silently.

Jade is a trademark of Jade Software Corporation Limited. This is independent third-party tooling; the project does not claim official endorsement. Native Jade terminology identifies the compatible platform and its features.

For local Codex discovery, copy the `skills/jade-development` folder into your Codex skills directory (normally `~/.codex/skills/`). Other clients can install the same SKILL.md using their supported skill location or retrieve it through MCP. Server instructions guide the model; they do not grant permissions or guarantee that every host automatically loads resources. No secrets or machine-specific connection settings are included.

Publication, extraction, source authoring, DAP debugging, arbitrary native utilities and object editing are not exposed by this server. Those require additional typed SDK interfaces and, for publication, a user-reviewed plan; an arbitrary model-supplied approval flag is not a substitute. The VS Code extension retains its existing publishing and debugger interfaces.

## Build and test

Development requires the pinned Node v24.22.1 runtime and npm. End users of the release ZIP do not.

```text
npm ci --ignore-scripts
npm test
npm run build
npm run package:standalone
```

`npm test` uses the official MCP client for both in-memory protocol validation and a real stdio server/source-query integration. Default tests never connect to a Jade database. Native connected tests require `JADE_MCP_NATIVE_TESTS=1` and `JADE_MCP_NATIVE_CONTEXT` pointing to a disposable fixture description; the connected test validates its private paths before opening a database. Missing context fails instead of silently skipping an explicit request. To exercise the packaged EXE with Node removed from its PATH, set `JADE_MCP_STANDALONE_EXE` to the generated executable and run the tests again.

The official native CLI distribution is committed under `packages/jade-cli-win-x64/`, with its identity and hashes in `distribution.json`. The reviewed release pin records the downloaded ZIP checksum and the exact manifest digest verified during installation. Build/test/package commands verify that receipt and stage only declared files into `native/`. The ZIP checksum is an installation receipt; it cannot be recomputed from extracted files. Normal builds use the committed package. This repository contains neither a second compiler nor a custom MCP protocol implementation. Its own `build-tools/` development package supplies the MCP executable packager and Node license. The lockfile references this committed local directory; no duplicate build-tools archive or legacy JavaScript CLI is installed or shipped.

## GitHub Actions and linked builds

`main` is the default branch and the target for review pull requests. Your code-owner approval is required before merging; automation must open a PR rather than push product changes directly to `main`.

Each pull request runs source validation, protocol tests, Windows executable packaging, a no-Node-PATH executable test and distribution checksum checks. Agent branch pushes create or update one review pull request rather than running a duplicate branch build. After approval and merge, the single `main` build publishes that tested package as its versioned GitHub release. An existing release is reused only after verifying its tag is on reviewed `main` and its published assets match their checksums. Tag pushes do not start duplicate builds or publish releases. Download the complete ZIP: the standalone EXE asset alone still needs its sidecars.

`node scripts/update-cli.js --verify-lock` verifies the release version/tag, manifest receipt and all runtime hashes, including mandatory helpers. `node scripts/update-cli.js` checks the latest stable official CLI release; append a tag such as `v0.3.0` to select one explicitly. The updater and release publisher are small, tested modules owned by this repository. No extension checkout, external workflow reference or additional application token is required. The updater verifies the official release origin, ZIP checksum, size limits, archive paths and native hashes before an atomic install. Downgrades are rejected. An unchanged verified release downloads only its metadata and small checksum file; missing or corrupt local files trigger a verified repair.

The repository checks for new CLI releases every five minutes and also supports a manual update run. A new dependency bumps the MCP patch version once and opens a bot-authored review PR; repairing the same dependency does not bump it. The normal PR workflow performs the full build/test/package validation once, and protected squash auto-merge waits for your required approval. The resulting `main` build publishes the consumer version. Enable GitHub Actions' permission to create pull requests; its existing repository token is sufficient. Updating the dependency never publishes to a Source database. Editable diagrams and source are tracked; research notes, credentials, databases, caches, execution reports and generated distributions stay outside Git.

## Architecture diagram

![Architecture](docs/architecture.drawio.svg)

[Edit the diagram in draw.io](docs/architecture.drawio). The SVG is the rendered companion to the editable source.

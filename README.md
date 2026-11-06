# Jade Local MCP

Local MCP server over the Jade CLI/shared SDK, using the official MCP TypeScript SDK v2. The server exposes native compile/test and read-only browsing to compatible clients without opening the Jade IDE. Native operations require the configured Windows Jade installation.

## Run the portable server

Download and extract the complete `jade-mcp-win-x64.zip` release. Keep its `bin`, `src` and `node_modules` sidecars next to `jade-mcp.exe`. Node is embedded in the executable; end users do not need a separate Node installation or VS Code.

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

Build/test reuse the CLI broker and its native Jade session. The SDK handles dependency selection, successful-input change tracking and native errors. Results preserve real Jade codes, source diagnostics and individual test failures. A failed build or test is an MCP tool error with a structured result, not an empty success. MCP cancellation is forwarded to the owned broker operation.

Resources `jade://capabilities` and `jade://workspace` describe the actual implemented surface and non-secret resolved workspace identity. Prompt `jade_check_changes` guides a compile/test workflow.

Publication, extraction, source authoring, DAP debugging, arbitrary native utilities and object editing are not exposed by this server. Those require additional typed SDK interfaces and, for publication, a user-reviewed plan; an arbitrary model-supplied approval flag is not a substitute. The VS Code extension retains its existing publishing and debugger interfaces.

## Build and test

Development requires the pinned Node v24.22.1 runtime and npm. End users of the release ZIP do not.

```text
npm ci --ignore-scripts
npm test
npm run build
npm run package:standalone
```

`npm test` uses the official MCP client for both in-memory protocol validation and a real stdio server/source-query integration. Default tests never connect to a Jade database. Native connected tests require explicit opt-in and disposable fixtures. To exercise the packaged EXE with Node removed from its PATH, set `JADE_MCP_STANDALONE_EXE` to the generated executable and run the tests again.

The CLI release archive is committed under `packages/` and pinned by `package-lock.json`. Native semantics, broker ownership and the generic executable packager are reused from that package; this repository does not contain a second compiler or MCP protocol implementation. The runtime bundle includes only production dependencies and the CLI runtime sidecars, not development tools or a second Node executable.

## GitHub Actions and linked builds

Builds and pull requests run source validation, protocol tests, Windows executable packaging, a no-Node-PATH executable test and distribution checksum checks. Tags matching `v<package version>` publish the tested ZIP, executable and `SHA256SUMS`. Download the complete ZIP: the standalone EXE asset alone still needs its sidecars.

The CLI updater polls stable CLI releases hourly and also accepts a manual release tag or `jade-cli-released` repository dispatch. Its shared SDK updater verifies release URLs, SHA-256 checksums, archive paths, version metadata and npm lock integrity. It then tests and packages the MCP server before opening a dependency PR. CI is explicitly dispatched on that branch because commits made with `GITHUB_TOKEN` do not trigger ordinary push workflows. Updates are reviewed before merge; they do not automatically change a Source database.

Enable GitHub Actions' permission to create pull requests for the updater. A dedicated cross-repository token is optional for immediate release dispatch; polling and manual runs do not require one. Editable diagrams and source are tracked. Research notes, credentials, databases, caches, execution reports and generated distributions stay outside Git.

## Architecture diagram

![Architecture](docs/architecture.drawio.svg)

[Edit the diagram in draw.io](docs/architecture.drawio). The SVG is the rendered companion to the editable source.

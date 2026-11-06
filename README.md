# Jade Local MCP

Local MCP server over the native C++ Jade CLI, using the official MCP TypeScript SDK v2. The server exposes native compile/test and read-only browsing to compatible clients without opening the Jade IDE. Native operations require the configured Windows Jade installation.

## Run the portable server

Download and extract the complete `jade-mcp-win-x64.zip` release. Keep its `bin`, `src`, `native` and `node_modules` sidecars next to `jade-mcp.exe`. The MCP protocol adapter still uses the official JavaScript SDK and embeds Node in `jade-mcp.exe`; end users do not need a separate Node installation or VS Code. The separate `native/jade-cli.exe` is C++ and has no Node runtime. No JavaScript CLI/broker is used or included in the runtime bundle.

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

Database catalogue filtering and paging happen in the native helper before its response crosses the transport boundary. Progress output and embedded report logs retain at most their last 32,768 characters; diagnostics, test results and the full native log file path remain available.

Build/test reuse the native CLI broker and its Jade session. C++ owns configuration discovery, dependency selection, successful-input change tracking and native operations. The MCP adapter only validates tool inputs and exchanges JSONL requests with `jade-cli.exe service --stdio`. Results preserve real Jade codes, source diagnostics and individual test failures. A failed build or test is an MCP tool error with a structured result. Cancellation covers owned requests waiting for startup as well as running operations.

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

`npm test` uses the official MCP client for both in-memory protocol validation and a real stdio server/source-query integration. Default tests never connect to a Jade database. Native connected tests require `JADE_MCP_NATIVE_TESTS=1` and `JADE_MCP_NATIVE_CONTEXT` pointing to a disposable fixture description; the connected test validates its private paths before opening a database. Missing context fails instead of silently skipping an explicit request. To exercise the packaged EXE with Node removed from its PATH, set `JADE_MCP_STANDALONE_EXE` to the generated executable and run the tests again.

The official native CLI 0.2.0 distribution is committed under `packages/jade-cli-win-x64/`, with its identity and hashes in `distribution.json`. The reviewed release pin records the downloaded ZIP checksum and the exact manifest digest verified during installation. Build/test/package commands verify that receipt and stage only declared files into `native/`. The ZIP checksum is an installation receipt; it cannot be recomputed from extracted files. Normal builds use the committed package. This repository contains neither a second compiler nor a custom MCP protocol implementation. Its own `build-tools/` development package supplies the MCP executable packager and Node license. The lockfile references this committed local directory; no duplicate build-tools archive or legacy JavaScript CLI is installed or shipped.

## GitHub Actions and linked builds

`main` is the default branch and the target for review pull requests. Your code-owner approval is required before merging; automation must open a PR rather than push product changes directly to `main`.

Each pull request runs source validation, protocol tests, Windows executable packaging, a no-Node-PATH executable test and distribution checksum checks. Agent branch pushes create or update one review pull request rather than running a duplicate branch build. After approval and merge, the single `main` build publishes that tested package as its versioned GitHub release; an existing matching release is reused rather than duplicated. Explicit version tags remain guarded to reviewed `main`. Download the complete ZIP: the standalone EXE asset alone still needs its sidecars.

The native migration replaces the old npm/TGZ runtime updater. `node scripts/update-cli.js --verify-lock` verifies the release version/tag, manifest receipt and all runtime hashes, including mandatory helpers. For updates, CI supplies `JADE_NATIVE_UPDATER_SCRIPT`, the absolute path to the product-integration PowerShell updater from an explicitly pinned extension automation checkout. The CLI repository owns only the CLI and Jade integration. The updater accepts only official stable CLI releases, verifies the ZIP checksum, bounds download and expanded sizes, rejects unsafe archive entries and validates every native manifest hash before atomically replacing the runtime. Downgrades are rejected. Updates must pass server/package tests and enter a reviewable dependency PR; auto-merge waits for your required approval and checks. Updating the dependency never publishes to a Source database.

Enable GitHub Actions' permission to create pull requests for the updater. A dedicated cross-repository token is optional for immediate release dispatch; polling and manual runs do not require one. Editable diagrams and source are tracked. Research notes, credentials, databases, caches, execution reports and generated distributions stay outside Git.

## Architecture diagram

![Architecture](docs/architecture.drawio.svg)

[Edit the diagram in draw.io](docs/architecture.drawio). The SVG is the rendered companion to the editable source.

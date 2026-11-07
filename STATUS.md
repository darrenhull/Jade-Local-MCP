# Jade Local MCP status

Updated: 7 November 2026.

## Released and installed

- MCP **0.3.3** is released from approved `main`, including the read-only data-tool audit. The verified local installation remains **0.3.2**, bundling native C++ Jade CLI **0.3.1**; no unreleased identity candidate was installed.
- The complete official release ZIP is installed at `%LOCALAPPDATA%\JadeTools\mcp`; its stable entry point is `jade-mcp.exe`. Keep all sidecars together. No separate Node installation is required.
- The VS Code user MCP configuration has a `jade` stdio server pointing to that stable executable. It has no hardcoded project path, extra arguments or environment overrides. Existing configuration content was preserved and backed up privately outside Git.
- The installed executable and every declared runtime file passed their manifest checksum checks. The official ZIP checksum is `e6163bfcdd35fdd807e00a6a1d18d9df42383d1ae1a71df2e2e351d5d62cac30`.

## Verification and practical limits

- Default regression suite: **79 passed**, one explicitly guarded native test skipped.
- The actual installed executable passed official MCP SDK stdio handshakes, guidance/resources, tool discovery, schema-qualified source query and owned broker status checks in both legacy and `2026-07-28` protocol modes. The child executable had no Node on its PATH. Tests used a disposable source fixture; no Source database was opened or modified.
- The final MCP ZIP preserves the official bundled CLI manifest bytes and native helper hashes. The previous MCP 0.3.1 release had a manifest-formatting receipt defect; it remains immutable. MCP 0.3.2 corrects it.
- MCP automatic CLI dependency polling was verified by scheduled run `42316273620` on 7 November 2026, created at 00:07:33 UTC and completed successfully. The earlier CLI 0.3.1 dependency update was started manually; extension scheduling remains a separate unverified item. Main release publication after approved merges was verified.
- VS Code may need its `jade` MCP server restarted to pick up the new command. The configuration update and standalone proof do not establish that an already-running VS Code MCP session has reconnected.

## Relocation handoff

The source checkout/workspaces are scheduled to move to `C:\Git` after all agents finish. This document is a checkpoint; the root coordinator owns that move and final path verification. The installed MCP runtime and VS Code command are outside the development checkout, so they do not depend on its OneDrive path. No relocation is claimed complete here.

## Read-only data-tools audit

- The focused read-only audit merged through approved PR #11 and shipped in MCP 0.3.3. Local installed MCP 0.3.2 remains unchanged pending a reviewed upgrade.
- Audit verification: five focused read-only protocol regressions passed; full default suite **84 passed**, one explicitly guarded native test skipped. Build, hosted CI, standalone packaging and actual executable protocol checks passed.
- Strict official-SDK tool schemas reject command/config/read-only overrides, nested native arguments, property writes, transaction requests and script input before native dispatch. Valid catalogue/object/instance/collection reads retain their selected Source/Working target and session. Search strings remain filter values on fixed read operations.
- Native enforcement was traced separately: the CLI forces read-only selection for both targets; the production inspection helper independently signs on with Object Manager `DB_READ_ONLY` (usage 1). Caller configuration cannot make that helper writable. Operation names and transport request IDs are set by the trusted session, OIDs are validated, and cursors remain bound to their inspection query/session.
- No writable inspection route was found. Data tools cannot persistently update either database or select arbitrary Jade scripts/methods. Fixed `allowedToInspect`/development-security and iterator callbacks remain intact; database read-only mode is not an operating-system sandbox for their external effects.
- Build/test and broker lifecycle tools remain separate from read-only data tools. Default audit tests use mocked native transport and real MCP protocol validation; no Source database was opened or modified.

## Native Jade identity candidate

- A separate MCP 0.3.4 candidate requires an official CLI **0.3.2 or newer** and `oidFormat: jade-native`; a compatible 0.4.1 release also satisfies this gate. The installed MCP remains 0.3.2; this checkpoint does not claim that its old bundled CLI already returns canonical identities.
- MCP passes native identity fields and all non-identity data through unchanged. Bounded scalar lookup input goes to the fixed native parser, with legacy 44-hex input compatibility. Opaque cursor/session/job tokens remain separate.
- Protocol regressions cover input byte/control limits, both-target/session routing, native error preservation, every nested response shape and rejection of an old backend's unmarked raw identity output. Direct unit/protocol suite: **91 passed**, two explicitly guarded native tests skipped. A separately selected real native/MCP integration proof passed **39 actual tool calls** and checked **92 native identity fields** against the DEV candidate.
- Build/release is deliberately blocked until a verified official native distribution advertises the required identity capability. CLI 0.4.0 is released, but version alone does not satisfy the required capability; the native identity hotfix is being finalized as 0.4.1. No fabricated receipt, vendor binary or guessed ID conversion is included. PR #12 has been rebased onto approved read-only audit main; the audit is no longer a pending dependency.
- Actual candidate integration uses an explicitly selected immutable DEV copy and a fresh exclusive native backup/restore fixture with isolated journal/log/transient INI paths. The proof verifies real helper database selection and read-only access on both targets, native object/reference lookup, nonempty collection members and keys, malformed-ID errors and recovery, and cursor/session context separation. The helper-supplied collection identity `126.55.2.3.12` was used unchanged on each target; it was not computed by the MCP adapter. All owned proof processes exited. No CLI adapter fix was needed: catalogue queries match qualified schema/class names, and cursor token strings are scoped to sessions rather than globally unique.
- The verified DEV executable SHA-256 is `7467f73a6e226b5e3256f2534509b63524174fbee02dac3fb63073e11540ae2e`; inspector SHA-256 is `0e062c99b29e1200cfd4691509486e2915d87e4e61eeab8a84fdba8aa921ec25`. These are proof artifacts, not an official release pin. The compatible official backend, its verified pin and final packaged/hosted checks remain the readiness gates.

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
- MCP automatic CLI dependency polling was verified by scheduled runs `42316273620` and `42344515644` on 7 November 2026; the latter created the CLI 0.4.0 Draft dependency PR. Extension scheduling is now separately verified by successful scheduled run `42345193609`. Main release publication after approved merges was verified.
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

## Native Jade identity delivery

- The MCP 0.3.4 feature branch now bundles official CLI **0.4.1**, verified against the trusted release ZIP checksum, exact manifest receipt and every runtime hash. Compatible backends must advertise `oidFormat: jade-native`; the existing minimum-version guard remains in place. The installed MCP remains 0.3.2; this checkpoint does not claim that its old bundled CLI already returns canonical identities.
- MCP passes native identity fields and all non-identity data through unchanged. Bounded scalar lookup input goes to the fixed native parser, with legacy 44-hex input compatibility. Opaque cursor/session/job tokens remain separate.
- Protocol regressions cover input byte/control limits, both-target/session routing, native error preservation, every nested response shape and rejection of an old backend's unmarked raw identity output. Current default unit/protocol suite: **94 passed**, two explicitly guarded native tests skipped. A separately selected real native/MCP integration proof passed **39 actual tool calls** and checked **92 native identity fields** again using the verified official 0.4.1 executable and inspector.
- The official backend dependency is satisfied. PR #12 is based on approved read-only audit main; packaging, current-head hosted CI, latest review findings and coordinator readiness verification remain separate delivery gates. CLI 0.4.0 alone lacks the required identity capability; its maintenance-only MCP PR #13 can be superseded once this complete 0.4.1 update is verified. No fabricated receipt, vendor binary or guessed ID conversion is included.
- Actual integration uses an explicitly selected immutable official CLI copy and an exclusive native backup/restore fixture with isolated journal/log/transient INI paths. The proof verifies real helper database selection and read-only access on both targets, native object/reference lookup, nonempty collection members and keys, malformed-ID errors and recovery, and cursor/session context separation. The helper-supplied collection identity `126.55.2.3.12` was used unchanged on each target; it was not computed by the MCP adapter. All owned proof processes exited. No CLI adapter fix was needed: catalogue queries match qualified schema/class names, and cursor token strings are scoped to sessions rather than globally unique.
- Official CLI 0.4.1 ZIP SHA-256: `d9cb7959945bf005988528a29e2686f59208e18ca08d03b866bd68dbed5765ce`; executable: `fb5b7105facbdd7562bc9b5cc1e13a223568ce06e2f5fdcc1a44a86ad635954c`; inspector: `0e062c99b29e1200cfd4691509486e2915d87e4e61eeab8a84fdba8aa921ec25`. The exact official manifest digest is recorded in the committed release pin.

## Customer release notes

- Publication now reads only `.github/release-notes/<package-version>.md` for new releases and retryable drafts, never generated PR history. Missing or blank current-version notes fail before a release mutation. Already-published immutable releases remain untouched.
- TDD evidence: three focused new publisher regressions failed before the change; all eight publisher tests passed afterward. MCP 0.3.4 notes describe only the native identity browsing feature; build/review/dependency details stay in this developer checkpoint.

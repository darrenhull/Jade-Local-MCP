# Jade Local MCP status

Updated: 6 November 2026.

## Released and installed

- MCP **0.3.2** is released from approved `main`; it bundles the native C++ Jade CLI **0.3.1**.
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

- A focused MCP 0.3.3 candidate adds protocol regression coverage and clearer guidance; the installed, released runtime remains 0.3.2 until the candidate completes normal review and release.
- Candidate verification: five focused read-only protocol regressions passed; full default suite **84 passed**, one explicitly guarded native test skipped. Build and whitespace checks passed. Hosted portable packaging remains a required review gate.
- Strict official-SDK tool schemas reject command/config/read-only overrides, nested native arguments, property writes, transaction requests and script input before native dispatch. Valid catalogue/object/instance/collection reads retain their selected Source/Working target and session. Search strings remain filter values on fixed read operations.
- Native enforcement was traced separately: the CLI forces read-only selection for both targets; the production inspection helper independently signs on with Object Manager `DB_READ_ONLY` (usage 1). Caller configuration cannot make that helper writable. Operation names and transport request IDs are set by the trusted session, OIDs are validated, and cursors remain bound to their inspection query/session.
- No writable inspection route was found. Data tools cannot persistently update either database or select arbitrary Jade scripts/methods. Fixed `allowedToInspect`/development-security and iterator callbacks remain intact; database read-only mode is not an operating-system sandbox for their external effects.
- Build/test and broker lifecycle tools remain separate from read-only data tools. Default audit tests use mocked native transport and real MCP protocol validation; no Source database was opened or modified.

## Native Jade identity candidate

- A separate MCP 0.3.4 candidate requires an official CLI **0.3.2 or newer** and `oidFormat: jade-native`; a compatible 0.4.1 release also satisfies this gate. The installed MCP remains 0.3.2; this checkpoint does not claim that its old bundled CLI already returns canonical identities.
- MCP passes native identity fields and all non-identity data through unchanged. Bounded scalar lookup input goes to the fixed native parser, with legacy 44-hex input compatibility. Opaque cursor/session/job tokens remain separate.
- Protocol regressions cover input byte/control limits, both-target/session routing, native error preservation, every nested response shape and rejection of an old backend's unmarked raw identity output. These are transport contract tests; actual vendor formatter/parser validity requires the native candidate/official release proof.
- Build/release is deliberately blocked until a verified official native distribution advertises the required identity capability. No fabricated receipt, vendor binary or guessed ID conversion is included. The original read-only audit remains an independent review item.
- Actual candidate integration uses an explicitly selected DEV copy, never a fake official pin or installation. A fixture audit found shared journal/log paths in a copied INI; all owned processes were closed and the proof now rejects escaping paths before connection. A fresh exclusive fixture was provisioned by verified native backup/restore with isolated INI paths. Private Working preparation and real canonical catalogue/read-only responses succeeded. The proof then found a CLI adapter bug that overwrites typed inspection arguments with default CLI arguments, losing filters/identities; the native owner is fixing that before the full lookup/reference/collection/both-target proof resumes.

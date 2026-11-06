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
- CLI dependency polling is configured, but **automatic scheduled execution remains unverified**. The CLI 0.3.1 dependency update was started manually. Main release publication after approved merges was verified.
- VS Code may need its `jade` MCP server restarted to pick up the new command. The configuration update and standalone proof do not establish that an already-running VS Code MCP session has reconnected.

## Relocation handoff

The source checkout/workspaces are scheduled to move to `C:\Git` after all agents finish. This document is a checkpoint; the root coordinator owns that move and final path verification. The installed MCP runtime and VS Code command are outside the development checkout, so they do not depend on its OneDrive path. No relocation is claimed complete here.

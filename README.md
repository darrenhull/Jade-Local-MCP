# Jade Local MCP

Independent workspace for the planned local Jade MCP adapter. **No MCP server or executable is implemented yet.** The private `0.0.0` package is a placeholder, not an installable integration.

The adapter will expose the Jade CLI/shared SDK to compatible clients, including GitHub Copilot. It will consume a pinned, tested package artifact; it must not import a sibling checkout or an installed VS Code extension.

Open `Jade-Local-MCP.code-workspace` or this folder directly. There are no build, start or test commands until implementation begins.

The native compiler, runtime, database ownership and helpers belong to the separate CLI/SDK product. Vendor Jade DLLs, databases, credentials and caches are not part of this repository.

Local plans and research notes are retained in ignored folders. They are not required to clone or build the eventual adapter. This repository currently contains only its package manifest, workspace, ignore rules and this usage/status file.

# Pinned native Jade CLI

`jade-cli-win-x64/` contains the native C++ Jade CLI and its owned native helpers from the official `darrenhull/Jade-CLI` release. It builds independently of a sibling checkout and contains no Node CLI, JavaScript SDK, private database or vendor Jade DLLs.

`jade-cli-pin.json` records the release version, tag, verified downloaded ZIP SHA-256 and the SHA-256 of the exact extracted `distribution.json` bytes. This repository's updater verifies the ZIP checksum before recording this receipt. The manifest then binds every executable, helper and runtime file to that verified payload.

`node scripts/update-cli.js --verify-lock` validates the pin identity, receipt manifest digest and all runtime file hashes, including required helpers. The ZIP digest is an installation receipt: it cannot be reconstructed from extracted files and is not independently re-proven by this command. Changing both the receipt and payload requires code review.

Upgrade with `node scripts/update-cli.js`, using the local `scripts/update-native-cli.ps1`. Commit the payload and pin together; do not edit generated `native/` files. The MCP server uses the official JavaScript MCP SDK; its portable executable embeds its own Node runtime. The Jade CLI itself is native C++.

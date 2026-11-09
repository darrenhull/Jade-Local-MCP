# Adopt official native CLI 0.5.2 in MCP

Issue: #23. Package: MCP 0.3.9. Base: approved main a7f5a93.

## Intent

Bundle the latest compatible official stable native CLI. This changes only the verified dependency and package metadata/documentation; the official MCP SDK and existing adapter continue to own protocol behavior. Native CLI owns backup reuse, error decoding, compilation and database coordination.

## Implementation

1. Fetch CLI v0.5.2 from the official darrenhull/Jade-CLI release using the existing bounded updater.
2. Verify release checksum, archive paths, distribution identity and all manifest payload hashes. Preserve the exact official manifest bytes.
3. Bump the MCP package and lockfile to 0.3.9. Record only included user-visible improvements in release notes.
4. Run existing pin/staging/protocol/read-only/default tests, package the standalone executable, then exercise the extracted package outside the checkout without Node on PATH.
5. Push a bot-backed PR linked to #23, complete current-head CI and automated review, and request required owner approval. Do not approve or merge as owner.

## Boundaries and validation

No adapter behavior or new interface is introduced, so no implementation-mirroring test is added. Existing tests validate the actual pinned dependency, protocol negotiation, subprocess behavior and read-only data annotations. Default tests must not open a developer database. Native connected proofs for the CLI changes belong to their reviewed CLI PRs; this update does not claim to repeat them in MCP.

Keep the stable installation path `%LOCALAPPDATA%/JadeTools/mcp` and separate installation from PR verification. No user database, credentials, vendor DLLs, development candidate bytes or local paths enter the package. CLI 0.6 ANSI support remains outside this release until it is approved and officially released.

## Delivery gates

- [x] Official CLI0.5.2 archive and native payload verification.
- [x] Default protocol/read-only/build/package checks: 97 passed, two guarded native tests skipped.
- [x] Actual extracted standalone/no-Node checks: 97 passed, two guarded native tests skipped; both protocol modes used the extracted executable. Exact artifact hashes verified; owned extraction cleaned after child exit.
- [ ] Current-head CI and Codex review.
- [ ] Owner approval and official release.
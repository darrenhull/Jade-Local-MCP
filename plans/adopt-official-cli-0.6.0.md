# Adopt official ANSI and Unicode helpers in MCP

Issue: #25. Package: MCP 0.3.10. Base: approved main 52831301a1bb6e0f2be276384400474ae9cf0b64.

## Intent and approach

Bundle the approved official native CLI 0.6.0 release, including both ABI helper variants and the neutral launchers. Keep ABI detection, SDK conversion, database coordination and native compile/test behavior in C++. The MCP adapter stays unchanged and preserves its typed read-only data interface.

1. Use the existing bounded official-release updater, verify archive identity/checksum and every listed runtime payload, preserving exact native manifest bytes.
2. Bump the package and lockfile to 0.3.10; document native `characterSet` auto/explicit configuration and honest support limits.
3. Run existing pin/staging/default protocol/read-only tests, build and standalone packaging; exercise the actual extracted EXE outside the checkout with no Node on its PATH.
4. Push the linked bot-authored PR, mark Ready after local gates, fix current-head CI/review findings, and retain required owner approval before protected squash/release.

## Test boundaries

This is an official dependency/documentation update without an MCP interface or adapter behavior change. Existing meaningful pin, staging, protocol, cancellation and read-only tests cover the consumer boundary; no implementation-mirroring test is added. CLI 0.6's reviewed native proof covers actual ANSI/Unicode operations and its large-log truncation regression. MCP's default/package tests do not open a developer database or independently repeat those connected proofs.

ANSI debugger and legacy offline compiler/cache remain unsupported. Vendor DLLs, credentials, user databases, candidate artifacts and local machine configuration are excluded. Installed MCP location/configuration remain unchanged by the PR. Clean owned test extraction after child exit and keep only compact verification receipts/logs.

## Validation gates

- [x] Adopt and verify official CLI0.6 release.
- [x] Default protocol/read-only/build/package suite: 97 passed, two guarded native opt-ins skipped.
- [x] Actual extracted standalone/no-Node suite: 97 passed, two guarded native opt-ins skipped; both MCP protocol modes passed, all artifact hashes validated, owned extraction cleaned after child exit.
- [ ] Exact-head CI and automated review.
- [ ] Required owner approval and official release.
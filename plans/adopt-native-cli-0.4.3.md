# Adopt native CLI0.4.3

Issue: https://github.com/darrenhull/Jade-Local-MCP/issues/18

## Change

Consume the official native CLI0.4.3 release produced from approved main414b732. Keep the MCP adapter, tool schemas, protocol transport and read-only data boundary unchanged. Jade/native CLI owns structural detection, schema versioning/reorganisation, reconnection and failure inventory handling.

## Delivery plan

1. Use the existing release updater to verify official origin, tag, ZIP SHA-2560fc44b1b345fce251c4b9baaee13523cc6d492e41218b3520c35351e2978c1d6, exact manifest bytes and all native file hashes. Commit the complete runtime and pin together.
2. Validate the pinned distribution and current lockfile, then run existing database-free MCP regressions with tests grouped by owning module. No Source access or database publication is required for this dependency change.
3. Add feature-only MCP0.3.6 release notes explaining automatic structural loading. Update the documented bundled version without inventing new tool capabilities or requiring another Node installation.
4. Build and package the actual MCP executable, then test the complete extracted artifact outside the checkout with Node absent from PATH. Verify real stdio negotiation, repeated calls, stable native-ID/read-only schemas and runtime hashes.
5. Keep the bot PR Draft until implementation and required local validation are complete. Mark Ready to start automatic Codex review; do not make that review a prerequisite for its trigger. Fix findings, verify current-head CI/review, then request owner approval and protected squash.
6. After approved merge, verify the official MCP release and install its complete ZIP at the existing stable path without overwriting an active executable or force-reloading the user's editor. Never substitute an unpublished local CLI build.

## Evidence boundary

The official CLI's own checked-in native proof established6281 under Current Schema Version, automatic latest-schema reorganisation, retained persistent OID/data, original6023 failure/retry and one actual cancellation boundary. MCP's default protocol checks are database-free and do not claim to repeat that licensed native proof. Connected data inspection remains read-only; compiling/executing Working code is a separate explicit tool action.

## Verification completed

- Official CLI ZIP, manifest receipt and all seven declared native runtime hashes match the released0.4.3 package.
- Default MCP regressions:95 passed, two explicit connected-test skips.
- Actual packaged MCP EXE:95 passed, two explicit connected-test skips; real stdio negotiation and source discovery work in both supported protocol modes with Node removed from the child PATH.
- Source/build validation, native staging, release identity and complete runtime manifest checks passed.
- Candidate MCP ZIP SHA-256: 127466ba6f8c7d9b88bf12fa4643d71b09ce3cbae68cca337fbedc57bf7824ed.
- Candidate standalone EXE SHA-256: 8199ee342f495f9eea1239acf73e603928aadf215c6a44835bdc5c761f11c684.
- Full distribution runtime hashes verified: 1018.
- No Source database was opened, no stable install changed, and owned protocol brokers/proof stages exited and were removed. Hosted CI and current-head Codex review are recorded on the linked PR before owner approval.

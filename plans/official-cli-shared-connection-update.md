# Official CLI shared-connection consumer update

Issue: https://github.com/darrenhull/Jade-Local-MCP/issues/21

1. Add a real bundled-release baseline regression and record failure against the 0.4.3 pin.
2. Use this repository's existing official release updater for v0.5.0, preserving original manifest bytes and verifying the official ZIP, pin and native runtime hashes.
3. Use the normal consumer bump to 0.3.8, with customer-facing notes. Preserve existing lifecycle guidance, protocol adapter and native-enforced read-only data allowlist.
4. Run default tests and build/release validation; exercise the actual complete portable executable outside the checkout without Node on PATH, including unchanged inspection annotations and updated native capability discovery without opening a database.
5. Push a linked Draft PR, mark Ready after validation to trigger Codex, resolve comments and retain owner approval/protected squash gates. Keep installed official 0.3.7 unchanged until approved 0.3.8 release.

## Evidence

Red: new bundled native baseline test rejects the existing 0.4.3 release with the expected minimum 0.5.0 error; remaining pin tests pass. Green: all 12 pin tests pass. Full default suite: 99 tests, 97 pass and two opt-in native tests skipped, zero failures. Build and standalone release checksum validation pass. Actual portable MCP0.3.8 was copied outside the checkout, with all official native hashes verified, and passed both supported stdio negotiation modes without Node on server PATH. Doctor reports CLI0.5.0 and sharedWorkingInspection:true; inspection tool annotations remain read-only and non-destructive. Native enforcement proof belongs to the reviewed upstream native release; this consumer check opens no database. Runtime adapter, tool allowlist and lifecycle skill files are byte-unchanged. Installed official0.3.7 remains unchanged.

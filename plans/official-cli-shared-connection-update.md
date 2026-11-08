# Official CLI shared-connection consumer update

Issue: https://github.com/darrenhull/Jade-Local-MCP/issues/21

1. Add a real bundled-release baseline regression and record failure against the0.4.3 pin.
2. Use this repository's existing official release updater for v0.5.0, preserving original manifest bytes and verifying the official ZIP, pin and native runtime hashes.
3. Use the normal consumer bump to0.3.8, with customer-facing notes. Preserve existing lifecycle guidance, protocol adapter and native-enforced read-only data allowlist.
4. Run default tests and build/release validation; exercise the actual complete portable executable outside the checkout without Node on PATH, including unchanged inspection annotations and updated native capability discovery without opening a database.
5. Push a linked Draft PR, mark Ready after validation to trigger Codex, resolve comments and retain owner approval/protected squash gates. Keep installed official0.3.7 unchanged until approved0.3.8 release.

## Evidence

Red: new bundled native baseline test rejects the existing0.4.3 release with the expected minimum0.5.0 error; remaining pin tests pass. Verification in progress.

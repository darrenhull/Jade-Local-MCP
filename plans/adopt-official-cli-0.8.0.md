# Adopt the official CLI 0.8.0 runtime in MCP

Issue: #30. Pull request: #29. Package: MCP 0.3.11.

## Change

Bundle the official native Jade CLI v0.8.0 distribution and preserve its manifest and release pin. Keep the MCP adapter, tool schemas, read-only data inspection and native ownership boundaries unchanged. Extraction remains a CLI feature; this dependency update does not expose an MCP extraction or publication tool.

The earlier CLI 0.7.0 update in PR #28 was compared against this branch and their common main base e8f610b. Both changed only package metadata and bundled native runtime files. The direct comparison contains no unique MCP implementation, tests or workflow changes. PR #28 is closed as superseded; no application fixes were discarded.

## Validation plan

1. Install the exact development lockfile in this isolated checkout. Verify the official CLI release pin and all manifest hashes before staging.
2. Run existing default unit/protocol, cancellation, paging, read-only and packaging tests. Do not open a developer database or enable connected native opt-ins.
3. Build the MCP portable ZIP and verify its package identity, CLI receipt and artifact checksums.
4. Extract the ZIP into owned disposable storage outside the checkout, run actual executable protocol checks with Node removed from its PATH, and remove the extraction after child processes close.
5. Keep customer release notes limited to the included runtime compatibility update. Verify the matching 0.3.11 notes file before readiness.
6. Push to the existing linked PR, verify current-head hosted checks, mark Ready to trigger automated review, resolve all findings, then request owner approval. Do not approve or merge on the owner's behalf.

No user-environment installation, Source publication, database reset/recovery or unreleased CLI version is part of this change. CLI 0.9.0 can be adopted only after its official release and a separate verified dependency update.

## Evidence

- Clean locked development install completed with Node 24.22.1.
- Official CLI 0.8.0 pin and every declared native runtime hash verified.
- Default suite: 97 passed, two guarded connected tests skipped, no failures. Build passed.
- Portable ZIP built; independently extracted executable passed the same 97 tests with the two real stdio protocol modes running without Node on the child PATH. Two guarded connected tests remained skipped.
- Release package version, manifest receipt and artifact checksums validated for v0.3.11. The owned temporary extraction was removed after all child processes closed.
- Current-head hosted CI, automated review and required owner approval remain separate delivery gates. No skipped connected check is counted as native database execution.
- Recurring updater prevention is tracked separately in issue #31; it is not silently included as completed here.

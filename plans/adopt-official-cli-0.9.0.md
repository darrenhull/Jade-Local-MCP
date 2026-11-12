# Adopt the official CLI 0.9.0 runtime in MCP

Issue: #30. Pull request: #32. Package: MCP 0.3.11.

## Change

Bundle the independently verified official native Jade CLI v0.9.0 release and preserve its exact manifest and release pin. Keep the MCP adapter, tool schemas, read-only data inspection and native ownership unchanged. Source comparison and extraction remain CLI features; this dependency update does not expose those operations as MCP tools.

The earlier CLI 0.8.0 update in PR #29 and CLI 0.7.0 update in PR #28 were compared against their common main base e8f610b. Neither contains unique MCP implementation, tests or workflow fixes. Preserve PR #29's required issue link, exact-version customer release notes and checked-in adoption/validation plan in this newer update. Replace the old runtime references with 0.9.0 rather than duplicating conflicting owner review requests.

## Validation requirements

1. Install the exact development lockfile in this isolated checkout. Verify the official CLI release pin, raw manifest bytes and every listed native runtime hash before staging.
2. Run existing default unit/protocol, cancellation, paging, read-only and packaging tests. Do not open a developer database or enable connected native opt-ins.
3. Build the portable ZIP and verify package identity, official native receipt and artifact checksums.
4. Extract the ZIP into owned disposable storage outside the checkout. Exercise its actual executable with Node removed from the child PATH, then remove the extraction after all owned child processes close.
5. Keep customer notes limited to the included runtime compatibility update; verify the matching 0.3.11 notes file before readiness. Do not attribute CLI-only features to MCP tools.
6. Verify current-head hosted checks, mark Ready to trigger automatic review, resolve all findings, then request owner approval. Preserve protected squash auto-merge and never approve or merge as the owner.

No installation, Source publication, database recovery/reset or persistent workflow-permission change is part of this update. Recurring issue-link and release-note automation prevention is tracked separately in #31; its issue-creation permission remains gated on explicit user authorization.

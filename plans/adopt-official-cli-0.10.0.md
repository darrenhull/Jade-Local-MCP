# Adopt the official CLI 0.10.0 runtime in MCP

Issue: #33. Pull request: #34. Package: MCP 0.3.11.

## Outcome and boundaries

Bundle only the published, independently verified official Jade CLI 0.10.0 distribution. Preserve the exact release manifest bytes, executable and complete native runtime, with a matching release pin. Keep MCP tools, schemas, read-only data inspection and native ownership unchanged. Complete source extraction and Git comparison are CLI capabilities; this package update does not expose new MCP extraction, publication or data-write tools.

Compare held PR #32 against its common main base before superseding it. Its runtime 0.9.0 update contains required version-specific customer notes and a checked-in verification plan, but no unique MCP adapter, test or workflow implementation. Carry that metadata forward for 0.10.0 rather than retaining conflicting review requests for two runtime pins. PR #32 was closed without merging once this concrete verified replacement existed; no unique adapter, test or workflow changes were discarded.

## Verification sequence

1. Confirm the official release tag resolves to reviewed protected main. Verify its ZIP, standalone executable, raw distribution manifest and every listed native runtime asset against the independent release receipt before staging.
2. Install the exact development lockfile in this isolated worktree. Run existing default protocol, lifecycle, cancellation, paging, read-only and packaging tests without connected opt-ins or opening a developer database.
3. Build the portable ZIP, validate release identity, exact native manifest/runtime bytes and artifact checksums.
4. Extract the complete ZIP into an owned disposable directory outside the checkout. Exercise its actual executable with Node removed from the child PATH. Remove the extraction and generated duplicate artifacts after all owned child processes exit.
5. Verify matching 0.3.11 customer notes describe only the included runtime compatibility change. Preserve the issue link and this plan in the PR.
6. Keep the implementation PR Draft through local/native-dependency/package gates and exact-head hosted checks. Mark Ready to trigger Codex, resolve findings, then request owner approval and protected squash auto-merge. Never approve or merge on the owner's behalf.

## Current evidence

Official CLI v0.10.0 is published from reviewed main 41b5816025a0dc23a5db7fdc3b6382b5f78cb2f0 (successful main run 43259988960). Its release ZIP SHA-256 is 173283d0ae189a640425010ff3b8caf485be8d108ac4a61fa4f9a4ab4759ba7e; exact raw manifest SHA-256 is fc1e359bdc25d0af7c9eefad41b0324b6af68dcee110fb2602e4737a52638b34. The trusted updater and independent pin check verified every native runtime entry. Default tests passed: 97 passed, 2 guarded connected skips; build, standalone ZIP and release artifact checks passed. The independently extracted portable ZIP verified all 1,027 runtime entries and exact official native manifest bytes. Its actual executable passed both MCP stdio protocol modes with Node removed from the child PATH; the owned extraction was removed after process exit. Current-head hosted CI and automated review remain required.

No installed user environment, Source database, recovery/reset operation or persistent workflow permission is changed. Recurring automatic issue/notes prevention remains separate in #31, whose automated issue-creation permission decision is still pending.
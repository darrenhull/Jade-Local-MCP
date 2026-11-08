# Jade MCP server engineering and review guidance

## Architecture and responsibilities

This repository owns the local MCP adapter, tool schemas, resources/prompts, client lifecycle and portable packaging. The official JavaScript MCP SDK owns the protocol; the pinned native C++ Jade CLI owns command preparation, native operations and database coordination. Keep the adapter thin; do not import the legacy JavaScript CLI SDK at runtime or implement a second native engine.

- Test real protocol negotiation and stdio execution as well as in-memory behavior. Reserve stdout for protocol traffic and stderr for diagnostics.
- Use explicit validated tool schemas, bounded structured results and truthful annotations. Expose no unrestricted shell/native escape hatch.
- Preserve schema/target/session identity when adapting broker responses. Do not leak internal owner-prefixed IDs as external IDs that can be echoed back incorrectly.
- Propagate cancellation/connection failure and settle pending promises. Clients cancel only owned jobs; closing a client must not accidentally terminate unrelated work.
- Redact secrets from configuration resources/errors and honor the selected workspace/target contract.
- Keep capabilities honest: publishing, extraction, authoring and debugging are not implemented merely because a future SDK plan mentions them.
- Preserve usable startup, repeated calls, paging and failures across compatible clients. Prompts must not hide source/database writes.
- Prove the complete portable ZIP works outside the checkout without Node on PATH. Parent node_modules, dev dependencies and extra runtime executables must not mask missing packaged files.

## Engineering approach

- Understand the change, its callers and its runtime/data boundaries before editing. Inspect implementation and tests; do not infer behavior from names alone.
- Use TDD: add a meaningful failing test, verify the intended failure, implement the smallest correct change, then run relevant regressions. Record red/green evidence in the PR.
- Keep one top-level class per source file, named for that class. Keep executable entry points thin. Cohesive stateless functions are appropriate; avoid artificial classes.
- Store new tests under tests/{Class}/{Class}_{method}_tests.test.js (or .test.ts). Use the module name for functional modules and share realistic fixture setup.
- Apply SOLID at actual boundaries: separate transport, configuration, orchestration, native execution and presentation; inject process/filesystem/network dependencies where tests need control.
- Apply DRY within this repository: the native CLI owns Jade semantics, shared sessions and dependency selection. This repository owns MCP protocol integration, its build-tools package and its own release/update automation. Reuse the published CLI interface; do not depend on another consumer's workflows, scripts or feature-branch commits, and do not put MCP-specific tooling in the CLI.
- Prefer maintained libraries and official SDKs for established protocols. Keep custom glue small and readable; avoid speculative abstractions and catch-and-ignore fallbacks.
- Run focused tests first, then relevant regression/build/package checks. Default tests must not open a developer's Jade database; connected tests require explicit opt-in, disposable validated fixtures and cleanup of owned resources only.
- Review the final diff for unintended files, secrets, stale comments and behavior changes. Document the final behavior, validation and practical limitations.

## UI evidence

- Every UI change must include a screenshot of the updated, running interface. Capture the actual implementation after the change, not a mockup or an earlier version.
- Visually inspect the screenshot and include it in the PR and the user-facing completion report, with enough context to identify the changed view or control. Cover materially different changed states where one screenshot is insufficient.
- If the UI cannot be run or captured, report the blocker explicitly and leave visual verification outstanding; do not claim it is complete.

## Correctness and compatibility

- Preserve public commands, SDK/event/result contracts, native error codes, cancellation, diagnostics, source locations and individual test outcomes. Incomplete or failed operations must not appear successful.
- Resolve configuration predictably and preserve schema-qualified identities. A same-named class in another schema is a different declaration.
- Preserve native source formats, encoding and meaningful ordering. Avoid broad transformations and invented Jade metadata.
- Build/test against saved local files and their dependencies, including unpublished classes. Establish reusable baselines only after successful native loads and invalidate stale claims after failures or structural changes.
- Handle Windows paths, quoting, case behavior, Unicode, locks and process-exit timing explicitly. Packages must not accidentally depend on a developer checkout, PATH or current directory.

## Security, data and lifecycle

- Keep Source and Working targets distinct. Build/test/debug writes belong in Working; Source publication requires a concrete reviewed plan and authorization.
- Route native work through shared ownership and allowlisted tools. Never expose arbitrary shell/native execution or secret-bearing configuration through an adapter.
- Validate source paths, archive members, arguments, OIDs, cursors and network payloads appropriately. Keep object/cursor identities bound to their database and session.
- Keep secrets out of Git, logs and public artifacts. Restrict private configuration access; preserve it while the native process owns it and clean it up after actual exit.
- Check startup races, cancellation, connection loss, crashes, shutdown and partially completed writes. Settle pending promises, cancel owned work and preserve safe recovery without killing unrelated processes.
- Default to minimal permissions. Verify trusted release origin, version, archive safety, checksums and lockfile integrity before installing or executing an update.

## Performance and operability

- Measure cold and warm paths separately; distinguish database preparation from compilation and execution before claiming improvements.
- Reuse valid native sessions and successful inventories. Avoid repeated full scans, duplicate parsing, per-item process/network calls and unbounded work on hot paths.
- Assume 30,000+ classes: bound concurrency, paginate results, limit retained output and avoid sending full source graphs through UI/transport responses.
- Provide actionable errors and progress, retain the original failure cause, clean up owned resources and make retries safe. Do not hide backend failures with an alternate implementation.

## Builds, releases and maintenance

- Target new pull requests at main. Preserve required code-owner approval; do not bypass it or push product changes directly to the protected default branch.
- Create and retain draft pull requests while implementation, dependency updates, validation or review fixes remain. Do not request human owner review or queue auto-merge while a PR is a draft.
- Mark ready and request owner review only after the work and required checks are complete. After readiness, protected squash auto-merge may be queued; never approve the PR on the owner's behalf.

- Independent checkouts must build from committed inputs and lockfiles. packages/jade-cli-win-x64 is the pinned native runtime; verify format, identity and every manifest hash before staging. The local build-tools package supplies only MCP development packaging utilities and must not enter runtime output. Do not restore the legacy CLI SDK dependency or a duplicate archive of local build-tools source.
- Exclude credentials, user configuration, databases, caches, logs and research notes from Git. Track requested diagrams and build-required source, tests and notices.
- Pin toolchains/dependencies and test the actual portable artifact outside the checkout without Node on PATH.
- Validate PRs without publishing. Tags must match package versions and reference reviewed-default-branch commits. Do not merge PRs or create release tags without authorization.
- Write customer release notes in `.github/release-notes/<package-version>.md`, describing only user-visible features actually included. Keep workflow changes, dependency receipts, review process and unfinished work in developer documentation. Verify the matching notes file before declaring a release PR ready; do not generate notes from PR history.
- Keep README, examples, capabilities and diagrams aligned with implemented behavior. Distinguish hosted CI from connected checks requiring the licensed Jade runtime.

## Code Review Rules

These rules are not exhaustive. Review the complete change and its affected callers for correctness, regressions, security, reliability, maintainability and performance. Do not restrict findings to listed conventions. Prefer concrete, consequential issues with a trigger, impact and location over speculative or style-only findings.

- Trace success, failure, cancellation and repeated operations across boundaries. Check partial failures, races, resource leaks, stale state and recovery.
- Ask whether the tests detect the actual failure, especially where native behavior differs from a mock. Flag misleading green checks and missing meaningful behavioral coverage.
- Check compatibility of the committed CLI archive, consumer lock, native helpers, runtime assumptions and deployed artifacts.
- Check that Source cannot be changed by build/test/read-only inspection and that native ownership and target identity cannot be bypassed or confused.
- Check performance evidence and ensure ordinary navigation, single-file operations and paged lookups do not unexpectedly trigger expensive project-wide work.
- Check release/update automation for unreviewed publication, unverified downloads, stale integrity and silently skipped failures.

## Automated PR comments

Post automated PR comments through GitHub Actions or an authorized GitHub App so they use the bot identity. Include attribution that Codex prepared the comment on behalf of @darrenhull. The user-authenticated GitHub connector posts as the user; do not use it for future automated comments or imply that it is a bot. If a bot-backed path is unavailable, report that limitation instead of impersonating a bot.

## Required issue link

Every pull request, including automated dependency updates, must link a real GitHub issue. Use the Development sidebar or a closing reference in the PR description. Verify the Linked issue check before requesting review. See `.github/PR_ISSUE_POLICY.md` for rerun instructions and the separate required-check administration step. Preserve current owner approval and all existing checks; do not merge or publish as part of configuring this policy.

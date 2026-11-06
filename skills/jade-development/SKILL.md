---
name: jade-development
description: Develop and investigate Jade New Zealand applications through the native Jade CLI, VS Code extension and local MCP server. Use for native source edits, compilation, tests, database inspection, collection definitions, Workspace scratch code and related diagnostics; not Pug/Jade HTML templates.
---

# Jade development

Use the installed Jade runtime as the authority for compilation, object semantics and execution. The Jade IDE is not required. Native DLLs and a compatible Jade installation remain required; they are not distributed with these tools.

## Discover the actual environment

- Read `jade://capabilities` and `jade://workspace` when connected through MCP. `jade_get_guidance` returns this skill if the host does not expose resources. Use the actual available tools, not a feature described in a newer plan or README.
- `jade_doctor` checks native installation/configuration without opening a database. Do not print credentials from configuration.
- The native CLI owns config discovery and dependency selection. Use the nearest `jade.json` or an explicit configuration; resolve source paths against that workspace/configuration rather than assuming a developer's installation or folder structure. Connection profiles can supply machine-specific settings.
- A class identity includes its schema. Same-named classes in unrelated schemas are different types; dependencies follow schema ancestry and imported visibility, not directory layout.

## Source, Working and local files

**Source** is the configured database used for extraction, inspection and reviewed publication. **Working** is a separate private database used for compilation, tests and debugging. Initial Working preparation takes a consistent native backup of Source and restores it separately; later runs reuse valid Working state. These are real native databases, not a permissive compiler cache.

Build/test never publish local source to Source. Application/test/scratch code can modify Working data; a successful persistent transaction can survive the next run. Do not imply an automatic rollback or that Working data always equals Source. Reset/recreate Working can discard its data and should follow the user's requested scope.

Working is a database target, not an operating-system or security sandbox. Executed Jade code can access files, networks and external components permitted by the runtime. Do not describe database isolation as preventing all external side effects, and preserve the user's execution scope.

Workspace native files are the application source of truth. System metadata/cache and private databases belong outside that source tree. Preserve native CLS/SCM/SEC/DDX/JCF syntax, encoding and meaningful metadata; do not manufacture class numbers, patch versions or broad conversion rules. Schema headers are siblings of their schema folders in the extracted layout. Class/session/global/application files do not replace every schema-level declaration.

MCP/CLI read saved files on disk. VS Code build/test commands save their inputs. A scratch command that explicitly accepts a buffer snapshot is different: keep the exact snapshot and selection offsets for diagnostics. Do not silently claim unsaved editor changes were built from disk.

## Compile and test

1. Save the intended source changes. Use `jade_build` with specific `files` for a focused build; omit files for the configured incremental project build. CLI equivalents are `jade-cli.exe build path/to/Class.cls` and `jade-cli.exe build` from the project.
2. Report native diagnostics with their original Jade code, file and source position when supplied. Inspect `passed`, `code`, diagnostics and runtime reports; process exit zero alone is insufficient evidence of successful compilation or execution.
3. Discover tests using `jade_list_tests`, then use `jade_test` with the relevant files and optional method names. Preserve schema/class/method identities, individual assertion failures, fixture failures and cancellation. Every requested test must actually execute again; warm source/session reuse is not caching test results.
4. Distinguish initial backup/restore, schema load/compile and test execution time when investigating performance. A cold run can be slower; avoid reconnecting or rebuilding all files for each method unnecessarily.

Prefer the official tools over arbitrary shell/native calls. MCP does not expose publication, extraction, DAP or unrestricted native execution; use only the capabilities actually advertised. A user request for a local compile is not authorization to publish it.

## Diagnostics and recovery

- Error Lens only displays diagnostics already published to VS Code. If an error appears in output but not inline, inspect the native report and Problems path; installing Error Lens cannot invent missing diagnostic locations. Structural/schema errors must also reach that path. Use an actual generated-source location if exact original mapping is unavailable; do not invent a method or line.
- Error **3094** during the initial backup means the database being backed up requires recovery. Check the logged path to distinguish Source from Working. It does not by itself establish corruption or identify the cause; an unclean shutdown is a common explanation, not a proven diagnosis.
- Preserve the relevant database files and journals before an authorized recovery. Native restart recovery can write to database files, even without publishing source. Obtain authorization for the actual target unless already provided; do not silently recover or reset Source as part of compilation. Use matching current Jade binaries and the correct original INI/journal paths. Do not delete journals, clear recovery flags, restore over Source or run repair commands merely to bypass the error.
- A native client can complete database recovery before a later script/launch error. Confirm the database log and a clean close, then retry the original operation; do not assume either exit status alone proves recovery success or failure.
- Use `jade_cancel` for an operation owned by this MCP client. `jade_disconnect` releases idle shared sessions. `jade_shutdown` affects other clients using the shared user broker and is appropriate only when requested. Do not terminate unrelated Jade/IDE processes.

## Inspect data

Choose the target explicitly; inspection defaults to Working. `target: "source"` is read-only inspection, not permission to execute or edit Source data.

Use `jade_inspect_catalog` to locate a schema-qualified class, `jade_inspect_instances` to page identities, `jade_inspect_object` to inspect stored properties and `jade_inspect_collection` to page members/keys. Keep each OID, cursor and session with its original database target. Identical OIDs in Source and Working are not the same object identity. Release cursors/close sessions when finished or before switching target identity.

Keep catalogue/results paged and filtered for large schemas; do not fetch 30,000 classes/instances just to find one. Refresh native catalogues after external schema changes. Inspection does not evaluate arbitrary expressions, execute mapped getters or edit objects.

## VS Code editing and authoring

- F5 compiles local class/method source in Working. The Testing view and Run Local Test run native tests; no second Test Explorer extension is needed. Publish controls are separate and require review of target and changed files.
- Format Document (`Shift+Alt+F` on Windows) and Format Selection indent complete method bodies in compatible extension versions. They preserve signatures, declarations, metadata, comments and literals; incomplete/unsupported structures remain unchanged. Formatting does not fix syntax errors. Error Lens is an install-alongside presentation companion that users can disable independently.
- Object Explorer supplies schema/class/member navigation and focused previews. Database Objects is a separate read-only data browser with explicit Source/Working selection. Use source definitions for application edits and native validation for correctness.
- The keyed collection designer currently covers member/external dictionary classes, ordered composite keys, direction, duplicate-key policy, reference paths, positive LCIDs and load factor. Do not assume full array/set/dynamic dictionary/ad hoc index support, complete inverse maintenance, inherited-key compatibility or aggregate key-size validation.
- Native key comparison IDs do not necessarily have the same textual CLS representation. Literal `0`/`-1` locale tokens were rejected by the verified loader; obtain native extraction/metadata evidence rather than guessing their syntax or equating an omitted locale with Binary/Latin1 semantics.
- Debugger support depends on the packaged native ABI and actual advertised capabilities. Do not imply arbitrary expressions, GUI hosting, process attach or variable editing exist unless that installed version supports them.

## Jade Workspace scratch code

A Jade **Workspace** is signature-free executable scratch code; a **JadeScript** contains named methods on the JadeScript class or its subclasses. Neither means a VS Code project/workspace.

The VS Code presentation is called **Scratch Pad** under Jade's tools. Its primary action is **Run**; optional code sections and notes are UI features, not a new Jade language or a promise of shared variables. Explain it as a place to try Jade code in Working without publishing a class. Check the installed extension/backend capability before claiming it is available.

Use an advertised native Workspace operation when available. Otherwise report it as unavailable; do not route a signature-free script through ordinary class compilation or claim that a plan is implemented. Native `Process.executeScript` with `isWorkspaceMethod=true` supports transient Workspace compilation/execution; direct `jadclient executeScript=<file>` expects a named transient launcher. Void scratch code uses a null return type rather than forcing an `Any` return and an invented return statement.

Keep execution in Working and distinguish compile failure, runtime failure, cancellation and success. Native error codes/positions must be checked even if the hosting process exits zero. Preserve selected-buffer offset mapping and output limits. Do not promise live output flushing, interactive input, shared variables across cells, rollback, GUI support or transient debugging without verifying those features. A notebook can mix Markdown and independently executable code cells while honestly stating variable and persistent-data lifetimes.

## Tool architecture and updates

The standalone **Jade CLI** is native C++. The **VS Code extension** uses VS Code's JavaScript host and the packaged CLI. The **local MCP server** uses the official MCP SDK with its own packaged runtime and delegates native operations to that same CLI. End users do not need a separate Node installation; development builds may require Node/npm. Keep business/runtime semantics in Jade/native CLI and clients thin.

Consumer releases bundle a verified CLI version. Automatic release polling opens reviewed dependency updates; it does not directly replace an installed VSIX. Install the extension's released VSIX and reload VS Code to update the local installation. Keep the complete MCP release ZIP sidecars together. Consult installed versions and current capabilities before diagnosing a difference.

When changing these tools, follow the owning repository's AGENTS.md: tests first, real failing behavior then minimal implementation, grouped tests, maintained native boundaries and actual packaged/host verification. Native connected tests use disposable fixtures; default tests must not open a developer's database. Keep user-specific paths, credentials, databases and investigation artifacts out of product commits.

## Native references

- [Jade development documentation](https://secure.jadeworld.com/developer-centre/JADE2025/OnlineDocumentation/content/resources/jade/devenvironment.htm)
- [Workspace execution](https://secure.jadeworld.com/developer-centre/JADE2025/OnlineDocumentation/content/resources/userguide/ch4methodfeaturedef/compileexecutewrkspacecode.htm)
- [Process.executeScript](https://secure.jadeworld.com/developer-centre/Jade2025/OnlineDocumentation/content/resources/encyclosys2/process_class/executescript.htm)
- [Dictionary key definitions](https://secure.jadeworld.com/developer-centre/JADE2025/OnlineDocumentation/content/resources/userguide/ch3definingclasses/definekeysfordictionaryclass.htm)
- [Database administration](https://secure.jadeworld.com/developer-centre/JADE2025/Docs/DbAdmin.pdf)

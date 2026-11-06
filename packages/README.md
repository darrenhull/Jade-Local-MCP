# Pinned Jade CLI candidate

`jade-tools-cli-0.1.1.tgz` is the exact reviewed CLI/SDK dependency used to build MCP 0.1.0. It is committed so this repository builds independently of the CLI checkout.

SHA-256: `AC20474CB885E19AC5752987CFA97616F8EB3AAB84A4D144A0CCB2271474409C`.

This initial candidate was built from the CLI feature branch before its pull request was merged. It is not claimed to be an already-published GitHub release. After the CLI changes are reviewed, merged and released, run the linked updater to pin the official release package before publishing MCP releases.

The archive contains the portable CLI, shared SDK, owned C++ helpers, native source and license notices. Jade vendor DLLs, private configuration and databases are excluded. The MCP runtime reuses the SDK and its broker, while keeping only one embedded Node runtime in the portable distribution.

`package-lock.json` pins this archive's SHA-512 integrity. Keep the archive and lockfile together; never edit installed/generated vendor files to upgrade the SDK.

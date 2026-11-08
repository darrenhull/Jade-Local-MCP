# Native object lifecycle and updating guidance

Issue: https://github.com/darrenhull/Jade-Local-MCP/issues/19

1. Add a real MCP tool/resource delivery test and verify it fails before guidance changes.
2. Add focused creation, constructor, ordinary initialiser, lifetime, updating/self, object-parameter and transaction rules to the existing shipped skill. Reuse the facts verified against native Jade 25.0.2.19 for extension issue42; include official references.
3. Preserve all existing read-only data tool restrictions and runtime/native dependencies. This is guidance only; do not mutate the installed MCP package manually.
4. Release as 0.3.7 with customer notes; validate real protocol delivery, default regression and portable packaging.
5. Push a separate linked Draft PR, then Ready after verification to trigger automated review. Do not request owner review before current CI/review is clear.

## Evidence

Red: existing three guidance tests pass; new protocol lifecycle test fails because no native create example is delivered. Green: all four guidance tests pass. Full default suite: 98 tests, 96 pass and two opt-in connected tests skipped, zero failures. Source build validator and standalone release checksum validation passed. The complete portable folder was copied outside the checkout and its real executable passed both supported stdio negotiation modes with Node absent from PATH; tool and resource returned the exact updated lifecycle/updating skill. Packaged skill SHA-256: d1d6a2b42b0c9a57dec428062a6287699aa89503d5a7148803d90c085df05f69. Native files, CLI pins and runtime source are unchanged. No globally installed MCP changes; temporary portable copy removed after owned processes exited.

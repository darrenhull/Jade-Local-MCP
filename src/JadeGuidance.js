import fs from 'node:fs';

export const guidanceUri='jade://skills/jade-development';
export const serverInstructions=[
  'Use jade_get_guidance or read '+guidanceUri+' for the bundled Jade development skill before native work; read jade://capabilities and jade://workspace for this installed server.',
  'Use saved workspace source, schema-qualified classes and database-specific OIDs/cursors. Native Jade owns compilation and execution; no Jade IDE is required.',
  'Jade identities require native CLI 0.3.2 or later advertising oidFormat jade-native. Return vendor object strings unchanged in every native identity field; do not decode raw handles or invent IDs. Lookup uses the fixed native String.asObject parser. Legacy 44-hex identity text is input-only compatibility; cursor, session and job tokens remain separate opaque values.',
  'Build/test run in private Working, which is initially backed up/restored from Source. They never publish. Tests/scripts can change Working data; no automatic rollback is promised.',
  'Working is not an operating-system sandbox: executed Jade code can perform file, network and external operations allowed by the runtime.',
  'Inspection is read-only for both Source and Working. Data tools accept typed catalogue/property/collection reads and session/cursor cleanup, never arbitrary evaluation, object mutation, publication or recovery. Native read-only database sessions enforce persistent-data protection; annotations alone do not. Fixed native access-policy and collection callbacks are not an operating-system sandbox. Error 3094 during backup requires checking the Source path and native recovery; do not silently recover, reset or repair Source without authorization.',
  'Report native codes, diagnostics and individual test outcomes; exit zero alone is not proof of success. Error Lens requires actual VS Code diagnostics.',
  'Use only advertised tools. Publication, extraction, authoring and DAP are not exposed by this server.'
].join(' ');

/** One versioned skill is shipped, served to MCP clients and installed locally. */
export function readJadeGuidance() {
  return fs.readFileSync(new URL('../skills/jade-development/SKILL.md',import.meta.url),'utf8');
}

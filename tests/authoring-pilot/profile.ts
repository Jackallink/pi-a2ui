// Pure admission inputs. Importing this module never loads SDK/config/archives.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const PAIR_ID='authoring-first-source-pilot-1';
const bytes=readFileSync(new URL('./profile.json',import.meta.url));
export const PAIR=JSON.parse(bytes.toString('utf8'));
export const PAIR_SHA=createHash('sha256').update(bytes).digest('hex');
export const ARCHIVES={C:'.local/v0110-release-evidence/download/pi-a2ui-0.1.10.tgz',G:'.local/authoring-first-use-implementation/pack/pi-a2ui-0.1.10.tgz'};
export const DIFFERENT=['extension.ts','src/assistant-guidance.ts','dist/assistant-cli.mjs','skills/pi-a2ui/SKILL.md','skills/pi-a2ui/references/helper.md','skills/pi-a2ui/references/summaries-and-feedback.md','skills/pi-a2ui/references/syntax-and-errors.md'];

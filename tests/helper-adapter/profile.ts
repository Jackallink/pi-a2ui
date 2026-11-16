// Pure offline-only identity. No SDK, configuration, archive or live admission.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const ADAPTER_ID='helper-invocation-offline-1';
const bytes=readFileSync(new URL('./profile.json',import.meta.url));
export const ADAPTER=JSON.parse(bytes.toString('utf8'));
export const ADAPTER_SHA=createHash('sha256').update(bytes).digest('hex');

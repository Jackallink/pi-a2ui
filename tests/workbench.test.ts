import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compile,validateSurface} from '../src/compiler.ts';
import {UiSession} from '../src/session.ts';
export const tableSource='root = List([DataTable(caption="Files",columns=[{id:"name",label:"Name"},{id:"size",label:"Size"}],rows=[{id:"a",cells:["<script>x</script>",10]},{id:"b",cells:["b",2]}])])';
test('W1 catalog admits static List and bounded primitive DataTable',()=>{const m=compile('work',tableSource);assert.equal(m.createSurface.components[0].component,'List');assert.deepEqual(validateSurface(m),m);});
test('W1 table invalid replacement is atomic and old catalogs stay closed',()=>{const s=new UiSession(()=>{});s.render('work',tableSource);const before=s.snapshot();for(const source of [tableSource.replace('id:"b"','id:"a"'),tableSource.replace('id:"size"','id:"name"'),tableSource.replace('["b",2]','["b"]'),tableSource.replace('["b",2]','[{x:1},2]')]){assert.throws(()=>s.render('work',source));assert.deepEqual(s.snapshot(),before);}const old=structuredClone(before.surfaces[0].message);old.createSurface.catalogId='https://jackallink.github.io/pi-a2ui/catalogs/live-v1.json';assert.throws(()=>validateSurface(old));s.close();});

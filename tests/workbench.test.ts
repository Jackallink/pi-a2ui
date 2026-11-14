import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compile,validateSurface} from '../src/compiler.ts';
import {UiSession} from '../src/session.ts';
export const tableSource='root = List([DataTable(caption="Files",columns=[{id:"name",label:"Name"},{id:"size",label:"Size"}],rows=[{id:"a",cells:["<script>x</script>",10]},{id:"b",cells:["b",2]}])])';
test('W1 catalog admits static List and bounded primitive DataTable',()=>{const m=compile('work',tableSource);assert.equal(m.createSurface.components[0].component,'List');assert.deepEqual(validateSurface(m),m);});
test('W1 table invalid replacement is atomic and old catalogs stay closed',()=>{const s=new UiSession(()=>{});s.render('work',tableSource);const before=s.snapshot();for(const source of [tableSource.replace('id:"b"','id:"a"'),tableSource.replace('id:"size"','id:"name"'),tableSource.replace('["b",2]','["b"]'),tableSource.replace('["b",2]','[{x:1},2]')]){assert.throws(()=>s.render('work',source));assert.deepEqual(s.snapshot(),before);}const old=structuredClone(before.surfaces[0].message);old.createSurface.catalogId='https://jackallink.github.io/pi-a2ui/catalogs/live-v1.json';assert.throws(()=>validateSurface(old));s.close();});


test('W1 table cannot nest inside an event Button',()=>{assert.throws(()=>compile('table',tableSource.replace('root = List([','root = Button(List([').replace('])])','])]),action=Event("send"))')),/must not be nested in a Button/);});

test('W1 table edges and List topology fail before atomic replacement',()=>{
 const s=new UiSession(()=>{});s.render('work',tableSource);const original=s.snapshot();
 const valid=compile('work',tableSource);const table=valid.createSurface.components.find(c=>c.component==='DataTable')!;
 for(const [key,value]of [['rows',Array.from({length:201},(_,i)=>({id:'r'+i,cells:['x',i]}))],['columns',Array.from({length:13},(_,i)=>({id:'c'+i,label:'C'}))],['rows',[{id:'a',cells:['a'.repeat(257),2]}]]]as const){const bad=structuredClone(original);Object.assign(bad.surfaces[0].message.createSurface.components.find(c=>c.component==='DataTable')!,{[key]:value});assert.throws(()=>s.reset(bad));assert.deepEqual(s.snapshot(),original);}
 table.rows=Array.from({length:200},(_,i)=>({id:'r'+i,cells:['x',i]}));assert.doesNotThrow(()=>validateSurface(valid));
 for(const children of [['missing'],['root'],['root_children_0','root_children_0']]){const bad=structuredClone(valid);bad.createSurface.components[0].children=children;assert.throws(()=>validateSurface(bad));}
 assert.throws(()=>compile('deep','root = '+ 'List(['.repeat(17)+'Text("x")'+'])'.repeat(17)));s.close();
});
test('W1 T01 example is executable with the frozen catalog',async()=>{const {readFile}=await import('node:fs/promises');assert.ok(compile('examples',await readFile('docs/examples/v0.1.4.express','utf8')));});

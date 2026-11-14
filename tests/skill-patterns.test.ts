import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {readFileSync,existsSync} from 'node:fs';
const helper=resolve('skills/pi-a2ui/scripts/a2ui.mjs');
function cli(args:string[],input?:string){return spawnSync(process.execPath,[helper,...args],{encoding:'utf8',input,timeout:10000});}
const names=['tree-navigation','searchable-picker','summary-metrics','validated-form','feedback-states','activity-timeline','evidence-location','command-actions'];
test('S15 patterns describe exactly eight usable templates and distinguish local shell capability',()=>{
 const result=cli(['patterns']);assert.equal(result.status,0,result.stderr);const value=JSON.parse(result.stdout);assert.deepEqual(Object.keys(value).sort(),['packageVersion','catalogId','scope','shellCapabilities','patterns'].sort());assert.equal(value.packageVersion,JSON.parse(readFileSync('package.json','utf8')).version);assert.equal(value.catalogId,'https://jackallink.github.io/pi-a2ui/catalogs/interactions-v1.json');assert.deepEqual(value.shellCapabilities,['command-palette']);assert.match(value.scope,/helper package/);assert.deepEqual(value.patterns.map((p:any)=>p.name),names);
 for(const pattern of value.patterns){assert.deepEqual(Object.keys(pattern).sort(),['name','template','reference','requires','templateAvailable','requiresShellCapabilities'].sort());assert.equal(pattern.templateAvailable,true);assert.ok(existsSync(resolve('skills/pi-a2ui',pattern.reference)));assert.deepEqual(pattern.requiresShellCapabilities,pattern.name==='command-actions'?['command-palette']:[]);}
});
test('S15 one pattern routes metadata to executable example and exact preflight arguments',()=>{
 const metadata=cli(['pattern','validated-form']);assert.equal(metadata.status,0,metadata.stderr);const value=JSON.parse(metadata.stdout);assert.equal(value.pattern.name,'validated-form');assert.equal(value.pattern.template,'validated-form');const source=cli(['example',value.pattern.template]);assert.equal(source.status,0,source.stderr);const checked=cli(['check','--surface-id','form','-'],source.stdout);assert.equal(checked.status,0,checked.stderr);assert.deepEqual(JSON.parse(checked.stdout),{surfaceId:'form',source:source.stdout});
});
test('S15 invalid pattern name paths and arity produce no tool payload',()=>{
 for(const [args,status]of [[['pattern','../SKILL.md'],1],[['pattern'],2],[['patterns','extra'],2],[['pattern','validated-form','extra'],2]]as const){const result=cli([...args]);assert.equal(result.status,status,result.stderr);assert.equal(result.stdout,'');assert.equal(typeof JSON.parse(result.stderr).error,'string');}
});

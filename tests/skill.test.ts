import {test} from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{resolve}from'node:path';
import{loadSkills}from'../node_modules/@earendil-works/pi-coding-agent/dist/core/skills.js';
test('S1 package exposes a discoverable Pi skill, not only an extension',()=>{const pkg=JSON.parse(readFileSync('package.json','utf8'));const result=loadSkills({cwd:process.cwd(),agentDir:'/unused',includeDefaults:false,skillPaths:(pkg.pi.skills??[]).map((p:string)=>resolve(p))});assert.deepEqual(result.skills.map(s=>s.name),['pi-a2ui']);assert.deepEqual(result.diagnostics,[]);});
import{spawnSync}from'node:child_process';import{mkdtempSync,writeFileSync,rmSync,readdirSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';
import{compile,promptSnippet}from'../src/compiler.ts';
const helper=resolve('skills/pi-a2ui/scripts/a2ui.mjs');
function cli(args:string[],input?:string|Buffer,cwd=process.cwd()){return spawnSync(process.execPath,[helper,...args],{input,encoding:'utf8',cwd,timeout:10000});}
test('S2/S5 actual parser supports named props and forward references; screenshot-shaped mistakes reject',()=>{
 assert.doesNotThrow(()=>compile('form','root = Card(child=body)\nbody = Column(children=[Text(text="Body")])'));
 assert.throws(()=>compile('form','root = Column(children=[Text(text="姓名") Button(child=Text(text="确认"),action=Event("submit"))])'),/mismatched input 'Button'/);
 assert.throws(()=>compile('form','root = Card("用户信息")'),/non-existent|Dangling/);
 assert.doesNotMatch(promptSnippet(),/Do not output property keys/);
});
test('S3 template availability comes from actual catalog and every supported example compiles/covers every type',()=>{
 const catalog=cli(['catalog']);assert.equal(catalog.status,0,catalog.stderr);const names=JSON.parse(catalog.stdout).components;const list=cli(['examples']);assert.equal(list.status,0,list.stderr);const entries=JSON.parse(list.stdout)as{name:string;requires:string[];available:boolean}[];const covered=new Set<string>();
 for(const entry of entries){assert.equal(entry.available,entry.requires.every(name=>names.includes(name)));const result=cli(['example',entry.name]);if(!entry.available){assert.equal(result.status,1);assert.equal(result.stdout,'');continue;}assert.equal(result.status,0,result.stderr);const components=compile('template',result.stdout).createSurface.components;assert.deepEqual(new Set(components.map(c=>c.component)),new Set(entry.requires));for(const c of components)covered.add(c.component);}
 assert.deepEqual(covered,new Set(names));if(!names.includes('DataTable'))assert.equal(entries.find(e=>e.name==='list-table')?.available,false);
});
test('S4 file and stdin emit exact tool arguments without writes from a different cwd or space-containing paths',()=>{
 const folder=mkdtempSync(join(tmpdir(),'pi a2ui skill '));try{const source='$/name = ""\nroot = Column(children=[Text(text="Quotes: \\"世界\\""),TextField(label="Name",value=$/name),Button(child=Text(text="OK"),action=Event("save",{name:$/name}))])';const file=join(folder,'form with spaces.express');writeFileSync(file,source);const before=readdirSync(folder);
 for(const [args,input]of [[['check','--surface-id','user-form',file],undefined],[['check','--surface-id','user-form','-'],source]]as const){const result=cli([...args],input,folder);assert.equal(result.status,0,result.stderr);assert.deepEqual(JSON.parse(result.stdout),{surfaceId:'user-form',source});}
 assert.deepEqual(readdirSync(folder),before);
 }finally{rmSync(folder,{recursive:true,force:true});}
});
test('S4 failure has no stdout payload: bad source, ID, UTF8, oversize, unknown command/example or non-file',()=>{
 for(const [args,input,status]of [[['check','--surface-id','a','-'],'root = Card("missing")',1],[['check','--surface-id','../bad','-'],'root = Text(text="x")',1],[['check','--surface-id','a','-'],Buffer.from([255]),1],[['check','--surface-id','a','-'],'新'.repeat(11000),1],[['nope'],'',2],[['check'],'',2],[['example','../SKILL.md'],'',1],[['check','--surface-id','a',tmpdir()],'',1]]as const){const result=cli([...args],input);assert.equal(result.status,status,result.stderr);assert.equal(result.stdout,'');assert.equal(typeof JSON.parse(result.stderr).error,'string');}
 const folder=mkdtempSync(join(tmpdir(),'pi-a2ui-large-'));try{const file=join(folder,'big.express');writeFileSync(file,'x'.repeat(32769));const result=cli(['check','--surface-id','a',file]);assert.equal(result.status,1);assert.match(result.stderr,/byte limit/);assert.equal(result.stdout,'');}finally{rmSync(folder,{recursive:true,force:true});}
});
test('S4 preserves CRLF and rejects BOM exactly as the compiler instead of silently stripping it',()=>{const source='root = Text(text="世界")\r\n';const valid=cli(['check','--surface-id','bom','-'],source);assert.equal(valid.status,0,valid.stderr);assert.equal(JSON.parse(valid.stdout).source,source);const bom='\ufeff'+source;assert.throws(()=>compile('bom',bom),/token recognition/);const invalid=cli(['check','--surface-id','bom','-'],bom);assert.equal(invalid.status,1);assert.equal(invalid.stdout,'');assert.match(invalid.stderr,/token recognition/);});

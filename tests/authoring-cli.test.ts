import{test}from'node:test';import assert from'node:assert/strict';import{spawnSync}from'node:child_process';import{readFileSync,existsSync}from'node:fs';import{resolve}from'node:path';
import{compile}from'../src/compiler.ts';
const helper=resolve('skills/pi-a2ui/scripts/a2ui.mjs');
const cli=(args:string[],input?:string)=>spawnSync(process.execPath,[helper,...args],{input,encoding:'utf8',timeout:10000});
const valueInputs=['TextField','CheckBox','ChoicePicker','Slider','DateTimeInput','SearchablePicker'];
test('A01 one actual component exposes named authoring parameters and project notes instead of unsupported SDK checks',()=>{
 const r=cli(['component','TextField']);assert.equal(r.status,0,r.stderr);const info=JSON.parse(r.stdout);
 assert.deepEqual(Object.keys(info).sort(),['packageVersion','catalogId','scope','component','restrictions'].sort());assert.equal(info.packageVersion,JSON.parse(readFileSync('package.json','utf8')).version);
 assert.equal(info.component.name,'TextField');assert.deepEqual(new Set(info.component.parameters.map((p:any)=>p.name)),new Set(['label','value','placeholder','variant','weight']));assert.equal(info.component.parameters.find((p:any)=>p.name==='value').required,true);assert.ok(info.component.notes.length);assert.ok(existsSync(resolve('skills/pi-a2ui',info.component.reference)));assert.ok(info.component.examples.includes('user-form'));assert.ok(!JSON.stringify(info.component).includes('TextField('),'query must not publish shifted positional signatures');
});
test('A01 every actual type has safe authoring metadata; native counters are not offered as model inputs',()=>{
 const catalog=JSON.parse(cli(['catalog']).stdout);assert.equal(catalog.components.length,32);
 for(const name of catalog.components){const r=cli(['component',name]);assert.equal(r.status,0,name+': '+r.stderr);const c=JSON.parse(r.stdout).component;assert.equal(c.name,name);assert.ok(c.notes.length,name);assert.ok(c.examples.length,name);assert.ok(existsSync(resolve('skills/pi-a2ui',c.reference)),name);assert.ok(c.parameters.every((p:any)=>!['checks','path','call','callFunction'].includes(p.name)),name);
 if(['LogView','TaskProgress','ActivityTimeline'].includes(name))assert.deepEqual(c.parameters.map((p:any)=>p.name),['stream']);
 if(valueInputs.includes(name))assert.equal(c.parameters.find((p:any)=>p.name==='value').required,true,name);
 }
 for(const [args,status]of [[['component','MetricCard'],1],[['component','../SKILL.md'],1],[['component'],2],[['component','Text','extra'],2]]as const){const r=cli([...args]);assert.equal(r.status,status);assert.equal(r.stdout,'');assert.equal(typeof JSON.parse(r.stderr).error,'string');}
});
test('A01 unknown-property recovery follows nested SDK cause and never recommends forbidden checks',()=>{
 const source='$/name=""\nroot=TextField(label="Name",value=$/name,extra=true)';const r=cli(['check','--surface-id','form','-'],source);assert.equal(r.status,1);assert.equal(r.stdout,'');const e=JSON.parse(r.stderr);assert.equal(e.code,'COMPILE');assert.equal(e.component,'TextField');assert.ok(e.allowedProperties.includes('value'));assert.ok(!e.allowedProperties.includes('checks'));assert.doesNotMatch(e.error,/accepts properties:.*checks/);assert.match(e.hint,/component|example/);assert.ok(e.examples.includes('user-form'));assert.ok(existsSync(resolve('skills/pi-a2ui',e.reference)));
 let caught:unknown;try{compile('form',source);}catch(error){caught=error;}assert.ok(caught instanceof Error&&caught.cause instanceof Error,'original wrapped SDK cause must survive for typed diagnostics');
});
test('A01 explicit checks stays forbidden and points to declarative validation without stdout or altered source',()=>{
 const source='$/name=""\nroot=TextField(label="Name",value=$/name,checks=[])';const r=cli(['check','--surface-id','form','-'],source);assert.equal(r.status,1);assert.equal(r.stdout,'');const e=JSON.parse(r.stderr);assert.equal(e.code,'COMPILE');assert.match(e.hint,/FormValidation/);assert.throws(()=>compile('form',source),/checks/);
});
test('A01 input parsing and lookup errors keep separate actionable codes while old successful source bytes remain exact',()=>{
 const file=cli(['check','--surface-id','form','/definitely-not-a-real-a2ui-file.express']);assert.equal(file.status,1);assert.equal(file.stdout,'');assert.equal(JSON.parse(file.stderr).code,'INPUT');
 const bad=cli(['component','MetricCard']);assert.equal(JSON.parse(bad.stderr).code,'LOOKUP');
 const source='$/name=""\r\nroot=TextField(label="姓名",value=$/name)\r\n';const valid=cli(['check','--surface-id','form','-'],source);assert.equal(valid.status,0,valid.stderr);assert.deepEqual(JSON.parse(valid.stdout),{surfaceId:'form',source});
});
test('A01 metadata changes do not add binding-only runtime policy or admit existing forbidden constructs',()=>{
 for(const source of ['root=TextField(label="Name",value="Ada")','root=CheckBox(label="Accept",value=false)','root=Slider(label="N",min=0,max=10,value=3)'])assert.doesNotThrow(()=>compile('compat',source));
 for(const source of ['root=ActivityTimeline(stream="tools",state="completed")','root=TaskProgress(stream="tools",started=1)','root=LogView(stream="tools",text="fake")','root=List(children=_template($/x,Text(text="fake")))','root=Image(url="https://example.test/x.png")'])assert.throws(()=>compile('policy',source));
});

test('A01 recovery does not infer a checks-policy failure from an arbitrary unknown component name',()=>{
 const r=cli(['check','--surface-id','form','-'],'root=checksWidget()');assert.equal(r.status,1);const e=JSON.parse(r.stderr);assert.equal(e.code,'COMPILE');assert.doesNotMatch(e.hint,/FormValidation/);assert.match(e.hint,/catalog|example|component/);
 const syntax=cli(['check','--surface-id','form','-'],'root=Column(children=[Text(text="A")\nButton(child=Text(text="B"),action=Event("next"))])');assert.equal(syntax.status,1);assert.match(JSON.parse(syntax.stderr).error,/line 2|Line 2/);
});

test('A01 DateTimeInput metadata marks both project-required flags before a model attempts the omitted-flag form',()=>{
 const r=cli(['component','DateTimeInput']);assert.equal(r.status,0,r.stderr);const c=JSON.parse(r.stdout).component;
 for(const name of ['enableDate','enableTime'])assert.equal(c.parameters.find((p:any)=>p.name===name).required,true,name+' is required by the active compiler');
 for(const source of ['root=DateTimeInput(value="")','root=DateTimeInput(value="",enableDate=true)'])assert.throws(()=>compile('date',source),/flags must be explicit/);
 assert.doesNotThrow(()=>compile('date','root=DateTimeInput(value="",enableDate=true,enableTime=false)'));
});

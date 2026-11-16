import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {compile} from '../src/compiler.ts';
import {validateSubmission} from '../src/interactions.ts';

const skill=resolve('skills/pi-a2ui'),helper=join(skill,'scripts/a2ui.mjs');
function block(file:string,heading:string,language:string){
 const section=readFileSync(join(skill,'references',file),'utf8').split('## '+heading+'\n')[1]?.split('\n## ')[0];
 const value=section?.match(new RegExp('```'+language+'\\n([\\s\\S]*?)\\n```'))?.[1];
 assert.ok(value,'missing executable '+language+' example: '+heading);return value;
}
const source=()=>block('summaries-and-feedback.md','Collect three required values','text');
const check=(value:string)=>spawnSync(process.execPath,[helper,'check','--surface-id','release-info','-'],{input:value,encoding:'utf8',timeout:10000});

test('AF03 documented three-field recipe preserves source and files while guarding the declared submitted values',()=>{
 const text=source(),recipe=block('summaries-and-feedback.md','Collect three required values','sh');
 const cwd=mkdtempSync(join(tmpdir(),'a2ui authoring recipe ')),file=join(cwd,'draft with spaces.express'),sentinel=join(cwd,'form.express');
 const template=readFileSync(join(skill,'examples/validated-form.express'),'utf8');
 try{
  writeFileSync(file,text);writeFileSync(sentinel,'USER-OWNED-SOURCE');
  const result=spawnSync('/bin/sh',['-eu','-c',recipe.replaceAll('<absolute-skill-path>',skill)],{cwd,env:{...process.env,source_file:file},encoding:'utf8',timeout:10000});
  assert.equal(result.status,0,result.stderr);const args=JSON.parse(result.stdout);assert.deepEqual(args,{surfaceId:'release-info',source:text});
  const surface=compile(args.surfaceId,args.source).createSurface,components=surface.components;
  assert.deepEqual(surface.dataModel,{form:{appName:'',targetEnvironment:'',version:''}});
  assert.deepEqual(components.filter(c=>c.component==='TextField').map(c=>({id:c.id,label:c.label,value:c.value})),[
   {id:'appInput',label:'应用名',value:{'@path':'/form/appName'}},
   {id:'envInput',label:'目标环境',value:{'@path':'/form/targetEnvironment'}},
   {id:'versionInput',label:'版本号',value:{'@path':'/form/version'}},
  ]);
  const validation=components.find(c=>c.component==='FormValidation')!;assert.deepEqual(validation.buttons,['submit']);
  assert.deepEqual((validation.rules as any[]).map(r=>({fieldId:r.fieldId,required:r.required})),[{fieldId:'appInput',required:true},{fieldId:'envInput',required:true},{fieldId:'versionInput',required:true}]);
  const submit=components.find(c=>c.id==='submit')!;assert.deepEqual(submit.action,{event:{name:'collect_release_info',context:{appName:{'@path':'/form/appName'},targetEnvironment:{'@path':'/form/targetEnvironment'},version:{'@path':'/form/version'}}}});
  assert.deepEqual(validateSubmission(components,'submit',{appName:'',targetEnvironment:'',version:''}).map(e=>e.fieldId),['appInput','envInput','versionInput']);
  assert.deepEqual(validateSubmission(components,'submit',{appName:'sample-app',targetEnvironment:'test',version:'0.1.10'}),[]);
  assert.equal(readFileSync(file,'utf8'),text);assert.equal(readFileSync(sentinel,'utf8'),'USER-OWNED-SOURCE');assert.equal(readFileSync(join(skill,'examples/validated-form.express'),'utf8'),template);
 }finally{rmSync(cwd,{recursive:true,force:true});}
});

test('AF04 documented nested Button and broken ID or Event coverage produce no publishable arguments',()=>{
 const valid=source();const invalid=block('syntax-and-errors.md','Repair guarded form references','invalid-express');
 const cases=[invalid,valid.replace('fieldId:"appInput"','fieldId:"/form/appName"'),valid.replace('validation,submit])','validation])'),valid.replace(',version:$/form/version','')];
 for(const bad of cases){assert.notEqual(bad,valid);const r=check(bad);assert.equal(r.status,1,r.stderr);assert.equal(r.stdout,'');assert.equal(JSON.parse(r.stderr).code,'COMPILE');}
});

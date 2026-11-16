import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync,appendFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {PilotBudget,PROFILE,NEW} from './trigger-pilot/contracts.ts';
import {formCandidates} from './trigger-smoke/observations.ts';
import {compile} from '../src/compiler.ts';
import {validateSubmission} from '../src/interactions.ts';
import {PAIR} from './authoring-pilot/profile.ts';
import {judgeSource,sourceMatch,pairSummary} from './authoring-pilot/oracle.ts';
import {contextBody,canonical} from './trigger-pilot/contracts.ts';

const EXP='authoring-first-source-pilot-1';
const body=()=>({model:'glm-5.3-flash',max_completion_tokens:1536,thinking:{type:'enabled'},reasoning_effort:'low',stream_options:{include_usage:true},parallel_tool_calls:false,tool_choice:'auto',tools:[{type:'function',function:{name:'a2ui_render',description:NEW+'contract'}}]});
test('APB01 legitimate paired sessions admit six each, twenty four total, without borrowing',()=>{
 const dir=mkdtempSync(resolve('.local/paired-budget-'));
 try{
  const budget=new PilotBudget(join(dir,'j'),'offline',EXP);
  for(const id of ['FP01-C','FP01-G','FP02-G','FP02-C']){
   for(let n=0;n<6;n++)budget.admit(id,PROFILE.model.baseUrl+'/chat/completions',PROFILE.model,body());
   assert.throws(()=>budget.admit(id,PROFILE.model.baseUrl+'/chat/completions',PROFILE.model,body()),/budget/);
  }
  assert.equal(budget.rows().length,24);
  assert.ok(budget.rows().every(r=>r.experiment===EXP&&/^[a-f0-9]{64}$/.test(r.profileSHA256)));
  appendFileSync(join(dir,'j'),'{');assert.equal(budget.evidence().complete,false);
  assert.throws(()=>budget.admit('FP02-C',PROFILE.model.baseUrl+'/chat/completions',PROFILE.model,body()));
 }finally{rmSync(dir,{recursive:true});}
});
const fixtures=JSON.parse(readFileSync(new URL('./authoring-pilot/fixtures.json',import.meta.url),'utf8'));
test('APO02 compiler plus exact case contract rejects wrong keys labels variants guards and extra inputs',()=>{
 for(const scenario of PAIR.scenarios){
  const source=fixtures[scenario.id],judge=(s:string)=>judgeSource('pilot',s,scenario,compile,validateSubmission);
  assert.equal(judge(source).correct,true);
  for(const bad of [source.replace('value=$/a','value=$/a,variant="number"'),source.replace('value=$/a','value=$/a,variant="obscured"'),source.replace(scenario.fields[0].label,'Wrong label'),source.replace(scenario.fields[0].contextKey+':','wrongKey:'),source.replace('required:true','required:false'),source.replace('Event("submit"','Event("cancel"'),source.replace('root = Column(children=[','$/extra = ""\nroot = Column(children=[TextField(label="Extra",value=$/extra),')])assert.equal(judge(bad).correct,false,bad);
  assert.equal(judge(source.replace('value=$/a','value=$/a,variant="longText"')).correct,true);
  const invalid=judge('root = Missing()');assert.equal(invalid.compile,false);assert.equal(invalid.semantic,null);assert.equal(invalid.correct,false);
 }
});
test('APR01 source comparison tolerates only one terminal LF and absent candidates never imply uplift',()=>{
 assert.deepEqual([sourceMatch('a','a'),sourceMatch('a\n','a'),sourceMatch('a\n\n','a'),sourceMatch('a\r\n','a'),sourceMatch(undefined,'a'),sourceMatch('a',undefined)],['exact','single-terminal-lf','mismatch','mismatch','unchecked','no-render']);
 const rows=['FP01-C','FP01-G','FP02-G','FP02-C'].map(id=>({id,requests:0,requestAccounting:'known',outcome:'preparation_limited',firstCandidate:{submitted:false}}));
 const summary=pairSummary(rows,{complete:true,rows:[]},false);assert.equal(summary.arms.C.correctOverSubmitted,null);assert.equal(summary.arms.G.submittedRateLabel,'N/A');assert.equal(summary.conclusion,'incomplete-candidates');assert.equal(summary.completeKnownPairs,0);
 for(const r of rows)r.firstCandidate={submitted:true,grade:{correct:r.id.endsWith('-G')}} as any;
 Object.assign(rows[1],{renderCommitted:true,contentValid:true,workflow:{skillRead:true,exampleRead:true,checkBeforeCandidate:true}});
 assert.equal(pairSummary(rows,{complete:true,rows:[]},false).conclusion,'small-direction-signal');
 Object.assign(rows[3],{firstCandidate:{submitted:false}});assert.equal(pairSummary(rows,{complete:true,rows:[]},false).conclusion,'incomplete-candidates');
});
test('APC01 paired body identity preserves real C/G guidance instead of old A/B rewriting',()=>{
 const c=body(),g=body();g.tools[0].function.description+=' candidate guidance';
 assert.notEqual(canonical(contextBody(c,EXP)),canonical(contextBody(g,EXP)));
 assert.deepEqual(contextBody(g,EXP),g);
});
test('APO01 fixed task form is recognised by case keys and labels rather than legacy app heuristics',()=>{
 const scenario={id:'FP01',fields:[{contextKey:'taskName',label:'任务名称',required:true},{contextKey:'environment',label:'运行环境',required:true},{contextKey:'buildVersion',label:'构建版本',required:true}]};
 const source='$/a = ""\n$/b = ""\n$/c = ""\na = TextField(label="任务名称",value=$/a)\nb = TextField(label="运行环境",value=$/b)\nc = TextField(label="构建版本",value=$/c)\nsubmit = Button(child=Text(text="提交信息"),action=Event("submit",{taskName:$/a,environment:$/b,buildVersion:$/c}))\nv = FormValidation(buttons=["submit"],rules=[{fieldId:"a",message:"Required",required:true},{fieldId:"b",message:"Required",required:true},{fieldId:"c",message:"Required",required:true}])\nroot = Column(children=[a,b,c,v,submit])';
 const message=compile('pilot',source);
 const candidates=(formCandidates as any)({surfaces:[{surfaceId:'pilot',message}]},'pilot',scenario);
 assert.equal(candidates.length,1);assert.deepEqual(candidates[0].fields.map((f:any)=>f.id),['a','b','c']);
});

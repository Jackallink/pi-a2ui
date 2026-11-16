// Private task oracle. Compile and submission functions always come from the active arm.
import type {FormCandidate} from '../trigger-smoke/observations.ts';
export function pairCandidates(surface:any,scenario:any):FormCandidate[]{
 if(!surface||!scenario)return[];
 const nodes:any[]=surface.components,inputs=nodes.filter(n=>['TextField','CheckBox','ChoicePicker','SearchablePicker','Slider','DateTimeInput'].includes(n.component));
 if(inputs.length!==3||inputs.some(n=>n.component!=='TextField'||![undefined,'shortText','longText'].includes(n.variant)))return[];
 const at=(p:string)=>p.slice(1).split('/').map(k=>k.replaceAll('~1','/').replaceAll('~0','~')).reduce((v,k)=>v?.[k],surface.dataModel);
 const string=(v:any)=>typeof v==='string'?v:typeof v?.['@path']==='string'?at(v['@path']):undefined;
 const candidates:FormCandidate[]=[];
 for(const button of nodes.filter(n=>n.component==='Button')){
  if(/cancel|取消|dismiss|close|返回|关闭/i.test(button.action?.event?.name??''))continue;
  const child=nodes.find(n=>n.id===button.child),ctx=button.action?.event?.context;
  if(child?.component!=='Text'||string(child.text)!=='提交信息'||!ctx||Object.keys(ctx).sort().join('|')!==scenario.fields.map((f:any)=>f.contextKey).sort().join('|'))continue;
  const selected=scenario.fields.map((f:any)=>{
   const p=ctx[f.contextKey]?.['@path'];if(typeof p!=='string'||!p.startsWith('/')||Object.keys(ctx[f.contextKey]).length!==1||at(p)!=='')return;
   const matches=inputs.filter(n=>n.value?.['@path']===p&&string(n.label)===f.label);return matches.length===1?matches[0]:undefined;
  });
  if(selected.some((n:any)=>!n)||new Set(selected.map((n:any)=>n.value['@path'])).size!==3)continue;
  const validation=nodes.find(n=>n.component==='FormValidation'&&n.buttons?.includes(button.id));
  if(!validation||validation.rules.length!==3||!scenario.fields.every((f:any,i:number)=>{
   const rule=validation.rules.find((r:any)=>r.fieldId===selected[i].id);
   return rule?.required===true&&rule.minLength===f.minLength&&rule.maxLength===f.maxLength;
  }))continue;
  candidates.push({fields:selected.map((n:any)=>({id:n.id,path:n.value['@path'],kind:n.component})),buttonId:button.id,caption:'提交信息',plainTextOnly:true});
 }
 return candidates;
}
export function judgeSource(surfaceId:string,source:string,scenario:any,compile:(id:string,s:string)=>any,validate:(nodes:any[],id:string,ctx:any)=>any[]):any{
 let surface:any;
 try{surface=compile(surfaceId,source).createSurface;}catch{return{compile:false,semantic:null,correct:false,candidates:[]};}
 const candidates=pairCandidates(surface,scenario);
 const semantic=candidates.length===1&&candidates.every(c=>{
  const blank=Object.fromEntries(scenario.fields.map((f:any)=>[f.contextKey,''])),valid=Object.fromEntries(scenario.fields.map((f:any)=>[f.contextKey,'valid']));
  if(validate(surface.components,c.buttonId,blank).length!==3||validate(surface.components,c.buttonId,valid).length!==0)return false;
  const bounded=scenario.fields.find((f:any)=>f.minLength===2&&f.maxLength===40);
  return !bounded||[1,2,40,41].every(n=>validate(surface.components,c.buttonId,{...valid,[bounded.contextKey]:'😀'.repeat(n)}).length===(n===1||n===41?1:0));
 });
 return{compile:true,semantic,correct:semantic,candidates};
}
export function sourceMatch(checked?:string,rendered?:string):string{
 if(rendered===undefined)return'no-render';if(checked===undefined)return'unchecked';if(checked===rendered)return'exact';
 return checked+'\n'===rendered||rendered+'\n'===checked?'single-terminal-lf':'mismatch';
}
export function pairSummary(results:any[],journal:any,live:boolean):any{
 const arms:any={};
 for(const arm of ['C','G']){
  const rows=results.filter(r=>r.id.endsWith('-'+arm)),submitted=rows.filter(r=>r.firstCandidate?.submitted===true),correct=submitted.filter(r=>r.firstCandidate.grade?.correct===true).length;
  arms[arm]={planned:2,actuallySubmitted:submitted.length,correct,correctOverPlanned:correct/2,correctOverSubmitted:submitted.length?correct/submitted.length:null,submittedRateLabel:submitted.length?`${correct}/${submitted.length}`:'N/A',usableUi:rows.filter(r=>r.renderCommitted&&r.contentValid===true).length};
 }
 const allKnown=results.length===4&&results.every(r=>r.firstCandidate?.submitted===true&&typeof r.firstCandidate.grade?.correct==='boolean');
 let wins=0,reverses=0;if(allKnown)for(const id of ['FP01','FP02']){const c=results.find(r=>r.id===id+'-C').firstCandidate.grade.correct,g=results.find(r=>r.id===id+'-G').firstCandidate.grade.correct;if(!c&&g)wins++;if(c&&!g)reverses++;}
 const accountingKnown=journal.complete&&results.every(r=>r.notRun||r.requestAccounting==='known'&&Number.isSafeInteger(r.requests));
 const outcomesKnown=results.every(r=>r.notRun||!['provider_unknown','output_truncated'].includes(r.outcome));
 const known=Math.max(journal.rows.length,results.reduce((n,r)=>n+(r.requests??r.knownAdmittedRequests??0),0));
 const workflowUi=results.some(r=>r.id.endsWith('-G')&&r.contentValid===true&&r.workflow?.skillRead&&r.workflow?.exampleRead&&r.workflow?.checkBeforeCandidate);
 return{plannedSessions:4,arms,completeKnownPairs:allKnown?2:0,wins:allKnown?wins:null,reverses:allKnown?reverses:null,conclusion:!allKnown?'incomplete-candidates':wins>=1&&reverses===0&&arms.G.usableUi>=arms.C.usableUi&&workflowUi?'small-direction-signal':'no-clear-gain',knownAdmittedRequests:known,requestAccountingKnown:accountingKnown,requestOutcomesKnown:outcomesKnown,actualModelRequests:live?(accountingKnown&&outcomesKnown?known:null):0,currencyFee:null};
}

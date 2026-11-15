import assert from 'node:assert/strict';
import {expect,type Page} from '@playwright/test';
import type {Component,Snapshot} from '../../src/protocol.ts';
export interface Scenario{id:string;request:string;action?:{button:string;event:string;context:Record<string,unknown>}}
export function intent(row:Scenario,snapshot:Snapshot,artifactSrc?:string):{buttonId?:string}{
 assert.equal(snapshot.surfaces.length,1);const surface=snapshot.surfaces[0];assert.equal(surface.surfaceId,'bm4');
 const components=surface.message.createSurface.components;const one=(name:string,where:(c:Component)=>boolean=()=>true)=>{const candidates=components.filter(c=>c.component===name&&where(c));assert.equal(candidates.length,1,`intent requires one ${name}`);return candidates[0];};
 const resolved=(value:unknown):any=>{if(!value||typeof value!=='object'||!('@path'in value))return value;const path=(value as {'@path':string})['@path'];assert.ok(path.startsWith('/'),'absolute binding');return path.slice(1).split('/').map(segment=>segment.replaceAll('~1','/').replaceAll('~0','~')).reduce<any>((data,key)=>data?.[key],surface.message.createSurface.dataModel);};
 const value=(input:Component)=>resolved(input.value);
 const buttonText=(id:unknown):string=>{const c=components.find(c=>c.id===id);if(!c)return '';if(c.component==='Text')return String(resolved(c.text));const ids=[...(typeof c.child==='string'?[c.child]:[]),...(Array.isArray(c.children)?c.children:[])];return ids.map(buttonText).join(' ').trim();};
 const field=(name:string,label:string,initial:unknown)=>{const c=one(name,c=>resolved(c.label)===label);assert.deepEqual(value(c),initial,`initial ${label}`);return c;};
 const containsText=(id:unknown,literal:string):boolean=>{const stack=[id],seen=new Set<unknown>();while(stack.length){const current=stack.pop();if(seen.has(current))continue;seen.add(current);const c=components.find(c=>c.id===current);if(!c)continue;if(c.component==='Text'&&resolved(c.text)===literal)return true;stack.push(c.child,...(Array.isArray(c.children)?c.children:[]));}return false;};
 const text=(literal:string)=>assert.ok(components.some(c=>c.component==='Text'&&resolved(c.text)===literal),'missing literal '+literal);
 let button:Component|undefined;
 if(row.action){button=one('Button',c=>components.some(label=>label.id===c.child&&buttonText(label.id)===row.action!.button));
  const event=(button.action as any)?.event;assert.equal(event?.name,row.action.event);assert.deepEqual(Object.keys(event.context??{}).sort(),Object.keys(row.action.context).sort(),'exact requested context keys');
  for(const [key,expected]of Object.entries(row.action.context))if(!['M02','M03','M08'].includes(row.id))assert.deepEqual(event.context[key],expected,'literal context '+key);
 }
 const binding=(key:string,c:Component)=>assert.deepEqual((button!.action as any).event.context[key],c.value,'context must bind requested field '+key);
 switch(row.id){
 case'M01':text('src/app.ts:42');break;
 case'M02':{const name=field('TextField','Name',''),accept=field('CheckBox','Accept',false);binding('name',name);binding('accept',accept);const guard=one('FormValidation');assert.ok((guard.buttons as string[]).includes(button!.id));const rules=guard.rules as any[];assert.ok(rules.some(r=>r.fieldId===name.id&&r.required===true&&r.minLength===2&&r.maxLength===5));assert.ok(rules.some(r=>r.fieldId===accept.id&&r.required===true));break;}
 case'M03':{binding('notify',field('CheckBox','Notify',false));const slider=field('Slider','Priority',2);binding('priority',slider);assert.equal(slider.min,1);assert.equal(slider.max,5);assert.equal(slider.steps,4);
 const mode=field('ChoicePicker','Mode',['safe']);binding('mode',mode);assert.equal(mode.variant,'mutuallyExclusive');assert.deepEqual(mode.options,[{label:'Fast',value:'fast'},{label:'Safe',value:'safe'}]);
 const date=field('DateTimeInput','Date','2026-11-15');binding('date',date);assert.equal(date.enableDate,true);assert.equal(date.enableTime,false);break;}
 case'M04':{const table=one('DataTable');assert.equal(table.caption,'Scores');assert.deepEqual((table.columns as any[]).map(c=>c.label),['Row','Score']);assert.deepEqual((table.rows as any[]).map(r=>r.cells),[['A',10],['B',2],['C',2]]);break;}
 case'M05':{const c=one('CodeBlock');assert.equal(c.code,'const answer = 42;');assert.equal(c.language,'typescript');break;}
 case'M06':assert.equal(one('MarkdownView').text,'# Notes\n\n**Ready** to review.');break;
 case'M07':{const details=one('Details',c=>c.title==='More info');assert.equal(details.open,false);assert.ok(containsText(details.child,'Build 42'));const modal=one('Modal');assert.ok(components.some(c=>c.id===modal.trigger&&c.component==='Text'&&resolved(c.text)==='Open details'));assert.ok(containsText(modal.content,'Review carefully'));break;}
 case'M08':{const picker=field('SearchablePicker','Target',['alpha']);binding('target',picker);assert.equal(picker.variant,'mutuallyExclusive');assert.deepEqual(picker.options,[{label:'Alpha',value:'alpha'},{label:'Beta',value:'beta'}]);break;}
 case'M09':assert.deepEqual(one('Chart').series,[{name:'Requests',points:[{label:'Mon',value:-2},{label:'Tue',value:3}]}]);break;
 case'M10':{const diff=one('CodeDiff');for(const[k,v]of Object.entries({proposalId:'p-bm4',filename:'example.ts',baseRevision:'base-bm4',before:'old',after:'new'}))assert.equal(diff[k],v);const result=one('TestResults');assert.equal(result.resultId,'r-bm4');assert.equal(result.command,'fixture');assert.equal(result.evidence,'Illustrative only');assert.deepEqual((result.cases as any[]).map(({id,name,status})=>({id,name,status})),[{id:'unit',name:'Unit',status:'pass'},{id:'lint',name:'Lint',status:'fail'}]);assert.deepEqual(result.summary,{pass:1,fail:1,skip:0,error:0});break;}
 case'M11':for(const type of ['TaskProgress','ActivityTimeline'])assert.equal(one(type).stream,'tools');break;
 case'M12':{assert.ok(artifactSrc,'actual artifact required');const c=one('ArtifactPreview');assert.equal(c.src,artifactSrc);assert.equal(c.kind,'image');assert.equal(c.label,'Sample image');const image=one('Image');assert.equal(image.url,artifactSrc);assert.equal(image.description,'Sample image');break;}
 default:assert.fail('unknown fixed scenario');
 }
 return{buttonId:button?.id};
}
export async function interact(row:Scenario,page:Page):Promise<void>{
 const canvas=page.getByRole('region',{name:'Canvas bm4',exact:true});await canvas.waitFor({state:'visible',timeout:5000});
 switch(row.id){
 case'M01':await canvas.getByText('src/app.ts:42',{exact:true}).waitFor();break;
 case'M02':await canvas.getByRole('textbox').fill('Ada');await canvas.getByRole('checkbox',{name:'Accept',exact:true}).check();break;
 case'M03':await canvas.getByRole('checkbox',{name:'Notify',exact:true}).check();await canvas.getByRole('slider').fill('4');await canvas.getByRole('radio',{name:'Fast',exact:true}).check();await canvas.locator('input[type=date]').fill('2026-11-16');break;
 case'M04':{const labels=()=>canvas.locator('pi-a2ui-data-table tbody tr').evaluateAll(rows=>rows.map(row=>row.querySelector('td')?.textContent));
 await canvas.getByRole('button',{name:'Score',exact:true}).click();assert.deepEqual(await labels(),['B','C','A']);await canvas.getByRole('button',{name:'Score',exact:true}).click();assert.deepEqual(await labels(),['A','B','C']);await canvas.getByRole('searchbox').fill('B');assert.deepEqual(await labels(),['B']);break;}
 case'M05':assert.equal(await canvas.locator('pi-a2ui-code-block code').textContent(),'const answer = 42;');break;
 case'M06':await canvas.getByRole('heading',{name:'Notes',exact:true}).waitFor();assert.equal(await canvas.locator('strong').textContent(),'Ready');break;
 case'M07':{await canvas.locator('summary').filter({hasText:'More info'}).click();await canvas.getByText('Build 42',{exact:true}).waitFor();const trigger=canvas.getByRole('button',{name:'Open details',exact:true});await trigger.click();const dialog=canvas.getByRole('dialog');await dialog.waitFor({state:'visible'});await dialog.getByText('Review carefully',{exact:true}).waitFor();await dialog.getByRole('button',{name:'Close details',exact:true}).click();assert.equal(await trigger.evaluate(el=>el===el.ownerDocument.activeElement||el.getRootNode()instanceof ShadowRoot&&(el.getRootNode()as ShadowRoot).activeElement===el),true);break;}
 case'M08':await canvas.getByRole('searchbox').fill('Beta');await canvas.getByRole('button',{name:'Beta · beta',exact:true}).click();break;
 case'M09':await canvas.locator('pi-a2ui-chart svg').waitFor();break;
 case'M10':await canvas.getByRole('region',{name:'Code difference'}).waitFor();await canvas.locator('pi-a2ui-test-results tbody tr').last().waitFor();break;
 case'M11':await canvas.getByRole('region',{name:'Native tool progress'}).waitFor();await canvas.getByRole('region',{name:'Native tool timeline'}).waitFor();break;
 case'M12':{const img=canvas.locator('pi-a2ui-image img');await img.waitFor();await expect.poll(()=>img.evaluate(node=>(node as HTMLImageElement).complete&&(node as HTMLImageElement).naturalWidth>0),{timeout:5000}).toBe(true);await expect(canvas.getByText('Registered in this Pi session',{exact:true})).toBeVisible();assert.equal(await img.evaluate(node=>(node as HTMLImageElement).naturalWidth>0),true);break;}
 }
 if(row.action)await canvas.getByRole('button',{name:row.action.button,exact:true}).click();
}

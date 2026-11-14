import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {compile,validateSurface} from '../src/compiler.ts';
import * as protocol from '../src/protocol.ts';
import {ArtifactStore} from '../src/artifact-store.ts';
const {UiError}=protocol;
function rejected(source:string,reason:RegExp){
 try{compile('diagnostic',source);assert.fail('expected actual compiler rejection');}catch(error){assert.ok(error instanceof UiError);assert.equal(error.status,400);assert.match(error.message,reason);return error as InstanceType<typeof UiError>&{diagnostic?:Record<string,unknown>;reason?:string};}
}
const pathSource='submit = Button(child=Text(text="Inspect"),action=Event("inspect_file",{path:"src/private-value-not-for-logs.ts"}))\nroot = Column(children=[submit])';
test('D1 forbidden literal key reports its real owning component and property without printing values',()=>{
 const error=rejected(pathSource,/Executable expressions|Forbidden map key/);
 assert.match(error.message,/Forbidden map key.*path/);assert.equal(error.diagnostic?.forbiddenKey,'path');assert.equal(error.diagnostic?.surfaceId,'diagnostic');assert.equal(error.diagnostic?.componentId,'submit');assert.equal(error.diagnostic?.componentType,'Button');assert.equal(error.diagnostic?.propertyPath,'/action/event/context/path');assert.doesNotMatch(error.message,/private-value-not-for-logs/);
 assert.doesNotThrow(()=>compile('diagnostic',pathSource.replace('{path:', '{file:')));
});
test('D1 nested literal data cannot forge the owning component locator',()=>{
 const error=rejected('submit = Button(child=Text(text="Inspect"),action=Event("inspect",{payload:{id:"fake",component:"FormValidation",path:"x"}}))\nroot = Column(children=[submit])',/Executable expressions|Forbidden map key/);
 assert.equal(error.diagnostic?.componentId,'submit');assert.equal(error.diagnostic?.componentType,'Button');assert.equal(error.diagnostic?.propertyPath,'/action/event/context/payload/path');
});
test('D1 every reserved key is still rejected and valid absolute bindings still compile',()=>{
 for(const key of ['path','checks','call','callFunction','@bad']){
  const message=compile('diagnostic','root = Button(child=Text(text="Go"),action=Event("go",{file:"x"}))');
  const button=message.createSurface.components.find(c=>c.component==='Button')!;((button.action as any).event.context)[key]='blocked';
  let failure:any;try{validateSurface(message);}catch(error){failure=error;}assert.ok(failure instanceof UiError);assert.equal(failure.status,400);assert.equal(failure.diagnostic?.forbiddenKey,key);assert.equal(failure.diagnostic?.componentId,'root');
 }
 assert.doesNotThrow(()=>compile('diagnostic','$/name = ""\nroot = TextField(label="Name",value=$/name)'));
});
test('D1 unrelated coding Button is identified without dumping submitted data',()=>{
 const review=readFileSync('skills/pi-a2ui/examples/review.express','utf8');
 const source=review.replace('root = Column(children=[','other = Button(child=Text(text="Other"),action=Event("other",{note:"private-note-not-for-logs"}))\nroot = Column(children=[other,');
 const error=rejected(source,/Coding actions must reference current literal record IDs/);assert.equal(error.diagnostic?.componentId,'other');assert.equal(error.diagnostic?.surfaceId,'diagnostic');assert.match(error.message,/proposalId/);assert.match(error.message,/resultId/);assert.doesNotMatch(error.message,/private-note-not-for-logs/);
});
const ownerCases:[string,string,RegExp][]=[
 ['range','range = Slider(label="Range",min=0,max=10,steps=3,value=2)\nroot = Column(children=[range])',/grid/],
 ['chart','chart = Chart(kind="bar",series=[{name:"same",points:[]},{name:"same",points:[]}])\nroot = Column(children=[chart])',/unique/],
 ['table','table = DataTable(caption="T",columns=[{id:"x",label:"A"},{id:"x",label:"B"}],rows=[])\nroot = Column(children=[table])',/unique/],
 ['guard','guard = FormValidation(buttons=["submit"],rules=[{fieldId:"missing",required:true,message:"Required"}])\nsubmit = Button(child=Text(text="Go"),action=Event("go"))\nroot = Column(children=[guard,submit])',/reachable bound input/],
 ];
for(const [id,source,reason]of ownerCases)test('D1 validator location: '+id,()=>{const error=rejected(source,reason);assert.equal(error.diagnostic?.componentId,id);assert.equal(error.diagnostic?.surfaceId,'diagnostic');});
test('D1 parser errors have surface scope without invented component IDs',()=>{
 const error=rejected('root = Column([',/Invalid Express|Failed|parse|Syntax/);assert.equal(error.diagnostic?.surfaceId,'diagnostic');assert.equal(error.diagnostic?.componentId,undefined);
});
test('D1 artifact invalid-path error names the supplied workspace root before any root IO',async()=>{
 const parent=mkdtempSync(join(tmpdir(),'dx-root-'));const root=join(parent,'does-not-exist');const store=new ArtifactStore('/irrelevant-constructor-root');
 try{await assert.rejects(store.register('/absolute.png','image',undefined,root),(error:any)=>{assert.ok(error instanceof UiError);assert.equal(error.status,400);assert.match(error.message,/relative workspace artifact path/);assert.ok(error.message.includes(root));assert.equal(error.diagnostic?.workspaceRoot,root);return true;});}finally{store.close();rmSync(parent,{recursive:true,force:true});}
});
test('D1 actual helper diagnoses literal path data rather than prescribing form validation',()=>{
 const result=spawnSync(process.execPath,[resolve('skills/pi-a2ui/scripts/a2ui.mjs'),'check','--surface-id','diagnostic','-'],{input:pathSource,encoding:'utf8'});
 assert.equal(result.status,1);assert.equal(result.stdout,'');const error=JSON.parse(result.stderr);assert.equal(error.code,'COMPILE');assert.equal(error.diagnostic?.forbiddenKey,'path');assert.match(error.hint,/file/);assert.doesNotMatch(error.hint,/Use FormValidation for/);
 const source='root = Text(text="unchanged")\r\n';const success=spawnSync(process.execPath,[resolve('skills/pi-a2ui/scripts/a2ui.mjs'),'check','--surface-id','diagnostic','-'],{input:source,encoding:'utf8'});assert.equal(success.status,0,success.stderr);assert.deepEqual(JSON.parse(success.stdout),{surfaceId:'diagnostic',source});
});
test('D1 UiError context preserves status and cause, merges specific owner once and is idempotent',()=>{
 const origin=new Error('original');const inner=new UiError(413,'quota',{cause:origin,diagnostic:{componentId:'actual',componentType:'Text'}} as any) as any;
 assert.deepEqual(inner.diagnostic,{componentId:'actual',componentType:'Text'});assert.equal(inner.status,413);assert.equal(inner.cause,origin);
 const locate=(protocol as any).locateUiError;const annotated=locate(inner,{surfaceId:'surface',componentId:'wrong'});assert.equal(annotated.status,413);assert.equal(annotated.reason,'quota');assert.equal(annotated.diagnostic.componentId,'actual');assert.equal(annotated.diagnostic.surfaceId,'surface');assert.equal(annotated.cause,inner);assert.equal(locate(annotated,{surfaceId:'surface'}),annotated);
});

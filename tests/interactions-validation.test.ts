import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compile,validateSurface} from '../src/compiler.ts';
import {UiSession} from '../src/session.ts';
export const validationSource=`$/name = ""
$/ok = false
name = TextField(label="Name",value=$/name)
ok = CheckBox(label="Accept",value=$/ok)
submit = Button(child=Text(text="Save form"),action=Event("save",{name:$/name,ok:$/ok}))
cancel = Button(child=Text(text="Cancel"),action=Event("cancel"))
validation = FormValidation(buttons=["submit"],rules=[{fieldId:"name",message:"Enter 2 to 5 characters",required:true,minLength:2,maxLength:5},{fieldId:"ok",message:"Accept to continue",required:true}])
root = Column(children=[name,ok,validation,submit,cancel])`;
function action(s:UiSession,context:Record<string,unknown>,source='submit',eventId='form'){const snap=s.snapshot();return {epoch:snap.epoch,revision:snap.surfaces[0].revision,eventId,message:{version:'1.0',action:{surfaceId:'form',sourceComponentId:source,name:source==='cancel'?'cancel':'save',timestamp:'2026-11-14T00:00:00Z',context}}};}
test('R04 invalid business drafts render; guarded typed constraints fail before dispatch and ID reservation',()=>{
 const sent:string[]=[];const s=new UiSession(t=>sent.push(t));s.render('form',validationSource);const before=s.snapshot();
 for(const context of [{name:'',ok:true},{name:'  ',ok:true},{name:'A',ok:true},{name:'123456',ok:true},{name:'Ada',ok:false}])assert.throws(()=>s.acceptAction(action(s,context)),{status:403,message:/Enter 2|Accept/});
 assert.deepEqual(s.snapshot(),before);assert.equal(sent.length,0);
 s.acceptAction(action(s,{name:'😀😀😀',ok:true}));assert.equal(sent.length,1);assert.equal(JSON.parse(sent[0].split('\n')[1]).context.name,'😀😀😀');
 s.acceptAction(action(s,{},'cancel','cancel'));assert.equal(sent.length,2);s.close();
});
test('R04 invalid targets, guard coverage, duplicates and incompatible rules reject atomically',()=>{
 const s=new UiSession(()=>{});s.render('form',validationSource);const before=s.snapshot();
 for(const source of [validationSource.replace('fieldId:"name"','fieldId:"missing"'),validationSource.replace('buttons=["submit"]','buttons=["name"]'),validationSource.replace('name:$/name,ok:$/ok','name:$/name'),validationSource.replace('fieldId:"ok",message:"Accept to continue",required:true','fieldId:"ok",message:"Invalid",minLength:1'),validationSource.replace('maxLength:5','maxLength:1'),validationSource.replace('buttons=["submit"]','buttons=["submit","submit"]'),validationSource.replace('fieldId:"ok",message:"Accept to continue"','fieldId:"name",message:"Duplicate"')])assert.throws(()=>s.render('form',source));
 assert.deepEqual(s.snapshot(),before);const bad=structuredClone(before.surfaces[0].message);(bad.createSurface.components.find(c=>c.id==='validation')!.buttons as string[])=["missing"];assert.throws(()=>validateSurface(bad));s.close();
});
test('R04 all aliases of a guarded path must agree even when both satisfy length rules',()=>{
 const s=new UiSession(()=>assert.fail('alias conflict dispatched'));s.render('form',validationSource.replace('name:$/name,ok:$/ok','name:$/name,alias:$/name,ok:$/ok'));
 assert.throws(()=>s.acceptAction(action(s,{name:'Ada',alias:'Bob',ok:true})));s.close();
});
test('R04 choice cardinality and required date use typed input data, not executable checks',()=>{
 const s=new UiSession(()=>{});s.render('form',`$/choices=[]
$/date=""
choices = ChoicePicker(label="Features",variant="multipleSelection",options=[{label:"A",value:"a"},{label:"B",value:"b"}],value=$/choices)
date = DateTimeInput(label="Date",value=$/date,enableDate=true,enableTime=false)
submit = Button(child=Text(text="Save"),action=Event("save",{choices:$/choices,date:$/date}))
root = Column(children=[choices,date,FormValidation(buttons=["submit"],rules=[{fieldId:"choices",message:"Choose two",minLength:2,maxLength:2},{fieldId:"date",message:"Choose date",required:true}]),submit])`);
 assert.throws(()=>s.acceptAction(action(s,{choices:['a'],date:'2026-11-14'})));assert.throws(()=>s.acceptAction(action(s,{choices:['a','b'],date:''})));
 assert.doesNotThrow(()=>s.acceptAction(action(s,{choices:['a','b'],date:'2026-11-14'})));s.close();
});

test('R04 Unicode lengths use code points and new SearchablePicker cardinality is guarded',()=>{
 let sent=0;const s=new UiSession(()=>sent++);s.render('form',validationSource.replace('maxLength:5','maxLength:2'));
 s.acceptAction(action(s,{name:'😀a',ok:true}));assert.equal(sent,1);s.reset();
 s.render('form',`$/chosen=[]
picker=SearchablePicker(label="Features",variant="multipleSelection",options=[{label:"A",value:"a"},{label:"B",value:"b"}],value=$/chosen)
submit=Button(child=Text(text="Save"),action=Event("save",{chosen:$/chosen}))
root=Column(children=[picker,FormValidation(buttons=["submit"],rules=[{fieldId:"picker",message:"Choose both",required:true,minLength:2,maxLength:2}]),submit])`);
 assert.throws(()=>s.acceptAction(action(s,{chosen:[]})),{status:403});assert.throws(()=>s.acceptAction(action(s,{chosen:['a']})),{status:403});
 s.acceptAction(action(s,{chosen:['a','b']}));assert.equal(sent,2);s.close();
});
test('R04 one validation per surface, meaningful rules and direct guard bindings remain structural requirements',()=>{
 const invalid=[
 validationSource.replace('name:$/name','name:"Ada"'),
 validationSource.replace('name:$/name','name:{nested:$/name}'),
 validationSource.replace('rules=[{fieldId:"name",message:"Enter 2 to 5 characters",required:true,minLength:2,maxLength:5},{fieldId:"ok",message:"Accept to continue",required:true}]','rules=[]'),
 validationSource.replace('rules=[{fieldId:"name",message:"Enter 2 to 5 characters",required:true,minLength:2,maxLength:5},{fieldId:"ok",message:"Accept to continue",required:true}]','rules=[{fieldId:"name",message:"No-op",required:false}]'),
 validationSource.replace('root = Column(children=[name,ok,validation,submit,cancel])','root = Button(child=Column(children=[name,ok,validation,submit,cancel]),action=Event("outer"))'),
 validationSource.replace('root = Column(children=[name,ok,validation,submit,cancel])','extra=FormValidation(buttons=["submit"],rules=[{fieldId:"name",message:"Required",required:true}])\nroot=Column(children=[name,ok,validation,extra,submit,cancel])'),
 validationSource.replace('fieldId:"ok",message:"Accept to continue",required:true','fieldId:"other",message:"Duplicate path",required:true').replace('root = Column(children=[name,ok,validation,submit,cancel])','other=TextField(label="Alias",value=$/name)\nroot=Column(children=[name,ok,other,validation,submit,cancel])')
 ];
 for(const source of invalid)assert.throws(()=>compile('form',source));
});

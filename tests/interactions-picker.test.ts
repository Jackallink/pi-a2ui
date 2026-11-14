import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compile,validateSurface} from '../src/compiler.ts';
import {UiSession} from '../src/session.ts';
export const pickerSource=`$/chosen = []
picker = SearchablePicker(label="Branch",options=[{label:"Main",value:"main"},{label:"Feature",value:"feat"}],value=$/chosen)
submit = Button(child=Text(text="Choose branch"),action=Event("choose",{chosen:$/chosen}))
root = Column(children=[picker,submit])`;
function action(s:UiSession,value:unknown){const snap=s.snapshot();return {epoch:snap.epoch,revision:snap.surfaces[0].revision,eventId:'choice',message:{version:'1.0',action:{surfaceId:'pick',sourceComponentId:'submit',name:'choose',timestamp:'2026-11-14T00:00:00Z',context:{chosen:value}}}};}
test('R02 actual authoring compiles a searchable typed selection and dispatches only authorized values',()=>{
 const out:string[]=[];const s=new UiSession(t=>out.push(t));s.render('pick',pickerSource);
 assert.equal(s.snapshot().surfaces[0].message.createSurface.catalogId,'https://jackallink.github.io/pi-a2ui/catalogs/interactions-v1.json');
 s.acceptAction(action(s,['feat']));assert.equal(JSON.parse(out[0].split('\n')[1]).context.chosen[0],'feat');s.close();
});
test('R02 forged values, duplicate options, literal/uninitialized values and nesting fail atomically',()=>{
 const s=new UiSession(()=>assert.fail('forged context dispatched'));s.render('pick',pickerSource);const before=s.snapshot();
 for(const value of ['main',['other'],['main','main'],['main','feat'],[1],true])assert.throws(()=>s.acceptAction(action(s,value)));
 for(const source of [pickerSource.replace('value:"feat"','value:"main"'),pickerSource.replace('value=$/chosen','value=[]'),pickerSource.replace('$/chosen = []','$/chosen = "main"'),pickerSource.replace('root = Column(children=[picker,submit])','root = Button(child=Column(children=[picker,submit]),action=Event("outer"))')])assert.throws(()=>s.render('pick',source));
 assert.deepEqual(s.snapshot(),before);
 const bad=structuredClone(before.surfaces[0].message);bad.createSurface.components.find(c=>c.id==='picker')!.value=[];assert.throws(()=>validateSurface(bad));s.close();
});
test('R02 empty, multiple and200 options are allowed while overflow and dynamic labels reject',()=>{
 for(const n of [0,200,201]){const options=JSON.stringify(Array.from({length:n},(_,i)=>({label:'Option '+i,value:'v'+i}))).replace(/"(label|value)":/g,'$1:');const run=()=>compile('pick',`$/chosen = []\nroot = SearchablePicker(label="Branch",options=${options},value=$/chosen)`);if(n<=200)assert.doesNotThrow(run);else assert.throws(run);}
 assert.throws(()=>compile('pick',pickerSource.replace('label="Branch"','label=$/chosen')));
 const out:string[]=[];const s=new UiSession(t=>out.push(t));s.render('pick',pickerSource.replace('label="Branch"','label="Branch",variant="multipleSelection"'));s.acceptAction(action(s,['main','feat']));assert.ok(out[0].includes('"chosen":["main","feat"]'));s.close();
});

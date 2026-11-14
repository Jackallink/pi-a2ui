import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compile} from '../src/compiler.ts';
import {UiSession} from '../src/session.ts';
import {UiError} from '../src/protocol.ts';
import install from '../extension.ts';
import type {ExtensionAPI} from '@earendil-works/pi-coding-agent';

const layout=(count:number)=>count===1?'root = Text("Only")':`root = Column([${Array.from({length:count-1},(_,i)=>`Text("Row ${i}")`).join(',')}])`;
const codingLayout=(after:string)=>`root = Column([CodeDiff(proposalId="capacity-rejected",filename="file.ts",baseRevision="base",before="old",after=${JSON.stringify(after)}),${Array.from({length:28},(_,i)=>`Text("Row ${i}")`).join(',')}])`;
function capacityError(action:()=>unknown,expected:RegExp){
  assert.throws(action,(error:unknown)=>error instanceof UiError&&error.status===413&&expected.test(error.message));
}

test('DX35 aggregate rejection reports attempted/current counts without changing committed state',()=>{
  const session=new UiSession(()=>{});
  try{
    session.render('first',layout(37));const before=session.snapshot();
    assert.equal(before.surfaces[0].message.createSurface.components.length,37);
    capacityError(()=>session.render('second',layout(30)),/attempted components 67\/64, surfaces 2\/4; current components 37\/64, surfaces 1\/4/);
    assert.deepEqual(session.snapshot(),before);
  }finally{session.close();}
});

test('DX35 same-ID replacement subtracts the old tree; rejection retains exact revision and payload',()=>{
  const session=new UiSession(()=>{});
  try{
    session.render('first',layout(37));session.render('first',layout(30));
    session.render('second',layout(34));const full=session.snapshot();
    assert.deepEqual(full.surfaces.map(s=>[s.surfaceId,s.revision,s.message.createSurface.components.length]),[['first',2,30],['second',1,34]]);
    capacityError(()=>session.render('second',layout(35)),/attempted components 65\/64, surfaces 2\/4; current components 64\/64, surfaces 2\/4/);
    assert.deepEqual(session.snapshot(),full);
  }finally{session.close();}
});

test('DX35 smaller replacement frees components but still consumes a surface slot',()=>{
  const session=new UiSession(()=>{});
  try{
    session.render('first',layout(37));session.render('first',layout(1));
    for(const id of ['second','third','fourth'])session.render(id,layout(1));
    const full=session.snapshot();
    capacityError(()=>session.render('fifth',layout(1)),/attempted components 5\/64, surfaces 5\/4; current components 4\/64, surfaces 4\/4/);
    assert.deepEqual(session.snapshot(),full);
  }finally{session.close();}
});

test('DX35 compiler-only overflow reports local compiled count without inventing session usage',()=>{
  assert.equal(compile('local',layout(64)).createSurface.components.length,64);
  assert.throws(()=>compile('local',layout(65)),(error:unknown)=>{
    assert.ok(error instanceof UiError);assert.equal(error.status,413);
    assert.match(error.message,/Component limit exceeded: 65\/64/);
    assert.equal(error.diagnostic?.surfaceId,'local');assert.equal(error.diagnostic?.componentId,undefined);
    assert.doesNotMatch(error.message,/current components|surfaces \d+\//);return true;
  });
});

test('DX35 failed aggregate admission does not reserve an immutable coding identity',()=>{
  const session=new UiSession(()=>{});
  try{
    session.render('first',layout(37));const before=session.snapshot();
    assert.equal(compile('coding',codingLayout('rejected')).createSurface.components.length,30);
    capacityError(()=>session.render('coding',codingLayout('rejected')),/attempted components 67\/64.*current components 37\/64/);
    assert.deepEqual(session.snapshot(),before);
    session.render('first',layout(1));
    const admitted=session.render('coding',codingLayout('different content'));
    assert.equal(admitted.surfaces[1].message.createSurface.components.find(c=>c.component==='CodeDiff')?.after,'different content');
  }finally{session.close();}
});

test('DX35 registered render exposes committed usage, generated children and replacement totals',async()=>{
  const tools=new Map<string,any>(),handlers=new Map<string,any>();let opened=0;
  const host={registerTool(t:any){tools.set(t.name,t);},registerCommand(){},on(n:string,h:any){handlers.set(n,h);},sendUserMessage(){},exec:async()=>{opened++;return{code:0,stdout:'',stderr:''};},getActiveTools:()=>['read'],setActiveTools(){}} as unknown as ExtensionAPI;
  install(host);const context={sessionManager:{getBranch:()=>[]},ui:{notify(){}}};
  await handlers.get('session_start')({},context);
  try{
    const render=(surfaceId:string,source:string)=>tools.get('a2ui_render').execute('budget',{surfaceId,source},undefined,undefined,context);
    const first=await render('choice','root = Button(Text("Choose"), action=Event("choose", {}))');
    // The literal Text child becomes a second compiled component.
    assert.equal(first.details.a2uiSnapshot.surfaces[0].message.createSurface.components.length,2);
    assert.deepEqual(first.details.a2uiUsage,{components:{used:2,limit:64},surfaces:{used:1,limit:4},surface:{surfaceId:'choice',components:2}});
    assert.match(first.content[0].text,/components 2\/64, surfaces 1\/4; this surface 2/);
    assert.match(first.content[0].text,/automatically/);
    const second=await render('other',layout(3));
    assert.deepEqual(second.details.a2uiUsage,{components:{used:5,limit:64},surfaces:{used:2,limit:4},surface:{surfaceId:'other',components:3}});
    const replacement=await render('choice',layout(1));
    assert.deepEqual(replacement.details.a2uiUsage,{components:{used:4,limit:64},surfaces:{used:2,limit:4},surface:{surfaceId:'choice',components:1}});
    assert.equal(replacement.details.a2uiSnapshot.surfaces[0].revision,2);
    assert.match(replacement.content[0].text,/components 4\/64, surfaces 2\/4; this surface 1/);
    assert.match(replacement.content[0].text,/Use \/a2ui to open/);assert.equal(opened,1);
    assert.doesNotMatch(JSON.stringify(replacement),/token=|pi_a2ui_/);
  }finally{await handlers.get('session_shutdown')({});}
});

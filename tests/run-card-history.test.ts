import {test} from 'node:test';
import assert from 'node:assert/strict';
import {UiSession} from '../src/session.ts';
import {restoreBranch} from '../src/controller.ts';

test('RSC history restores a valid official custom snapshot after the valid tool receipt control',()=>{
 const original=new UiSession(()=>{});
 original.render('run-summary','root = Card(Column([Text("Run summary"),StatusBadge(label="Run completed",status="success"),TaskProgress(stream="tools"),ActivityTimeline(stream="tools")]))');
 const saved=original.snapshot();
 assert.equal(saved.surfaces[0].message.createSurface.components.length,6);
 const control=new UiSession(()=>{});
 restoreBranch(control,[{type:'message',message:{role:'toolResult',toolName:'a2ui_render',isError:false,details:{a2uiSnapshot:saved}}}]);
 assert.equal(control.snapshot().surfaces.length,1,'existing valid snapshot control');
 const restored=new UiSession(()=>{});
 const owner=restoreBranch(restored,[{type:'custom',customType:'pi-a2ui.run-summary.v1',data:{a2uiSnapshot:saved,a2uiRunSummaryRevision:1}}]);
 assert.equal(restored.snapshot().surfaces.length,1,'valid custom snapshot must restore');
 assert.equal(owner,1,'restored card keeps explicit ownership');
 assert.notEqual(restored.snapshot().epoch,saved.epoch);
 original.close();control.close();restored.close();
});

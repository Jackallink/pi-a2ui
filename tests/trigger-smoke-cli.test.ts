import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {ROOT} from './trigger-pilot/control.ts';
for(const canary of ['negative-text','preparation','torn-journal'])test('SMI01 public zero-inference CLI '+canary,()=>{
 const r=spawnSync(process.execPath,[join(ROOT,'scripts/trigger-smoke.mjs'),'--offline','--canary',canary],{cwd:ROOT,encoding:'utf8',timeout:45000,maxBuffer:1024*1024});assert.equal(r.status,canary==='torn-journal'?1:0);const lines=r.stdout.trim().split('\n').map(s=>JSON.parse(s)),report=JSON.parse(readFileSync(lines.at(-1).report,'utf8'));assert.equal(report.results.length,2);assert.equal(report.actualModelRequests,0);assert.equal(report.experiment,'v0.1.10-trigger-smoke-1');
 if(canary==='negative-text'){assert.equal(report.results[0].outcome,'negative_text');assert.equal(report.results[1].outcome,'not_run');assert.equal(report.knownAdmittedRequests,1);}
 if(canary==='preparation'){assert.equal(report.results[0].outcome,'negative_pass');assert.equal(report.results[1].outcome,'preparation_limited');assert.equal(report.results[1].requests,3);assert.equal(report.knownAdmittedRequests,4);assert.equal(report.uiVerdict,'ui_not_observed');}
 if(canary==='torn-journal'){assert.equal(report.results[0].requests,null);assert.equal(report.results[1].outcome,'not_run');assert.equal(report.requestAccountingKnown,false);assert.equal(report.knownAdmittedRequests,1);}
});

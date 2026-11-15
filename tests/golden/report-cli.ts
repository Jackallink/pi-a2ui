import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { combineReports, identity, validateReport, type Report } from './reports.ts';

const [command,role]=process.argv.slice(2);
if(command==='export'&&(role==='node'||role==='browser')){
  const report=JSON.parse(readFileSync(`.local/golden-reports/${role}.json`,'utf8')) as Report;
  validateReport(report,true);assert.deepEqual(report.identity,await identity(),'report must match the current checked-out source');
  // No source messages or action context in GitHub job outputs; only bounded identities/results.
  console.log('report='+JSON.stringify({...report,results:report.results.map(({observation,...result})=>result)}));
}else if(command==='combine-local'||command==='combine-env'){
  const read=(role:'node'|'browser')=>JSON.parse(command==='combine-env'?process.env[`GOLDEN_${role.toUpperCase()}`]!:readFileSync(`.local/golden-reports/${role}.json`,'utf8')) as Report;
  const node=read('node'),browser=read('browser');
  assert.deepEqual(node.identity,await identity(),'union must match the current checked-out source');
  console.log(JSON.stringify({source:node.identity.source,...combineReports(node,browser),node:node.environment.node,browser:browser.environment.browserVersion}));
}else throw new Error('Usage: report-cli.ts export node|browser | combine-local | combine-env');

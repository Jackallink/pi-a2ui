import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync, readdirSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { interactionsCatalog } from '../../src/catalog.ts';
import { canonical, datasetHash, fixtureBytes, loadCases, PROFILE, sha256, type CaseResult } from './registry.ts';
const exec=promisify(execFile);
export interface Identity {profile:string;source:string;dirty:boolean;lockHash:string;datasetHash:string;oracleSetHash:string;catalogHash:string;assetHash:string;nodeMajor:24}
export interface Report {identity:Identity;role:'node'|'browser';environment:Record<string,unknown>;results:CaseResult[]}
export async function identity():Promise<Identity> {
  assert.equal(process.versions.node.split('.')[0],'24','Node24 required');
  const source=(await exec('git',['rev-parse','HEAD'],{timeout:5000})).stdout.trim();
  const dirty=!!(await exec('git',['status','--porcelain','--untracked-files=normal'],{timeout:5000})).stdout.trim();
  const paths=['tests/golden.test.ts',...readdirSync('tests/golden').filter(name=>/\.(ts|mjs|json)$/.test(name)).map(name=>'tests/golden/'+name)].sort();
  const oracleSetHash=sha256(canonical(Object.fromEntries(paths.map(path=>[path,sha256(readFileSync(path))]))));
  const assets=['client.js','client.css','index.html'].map(name=>['dist/'+name,sha256(readFileSync('dist/'+name))]);
  const catalogHash=sha256(canonical({id:interactionsCatalog.id,components:[...interactionsCatalog.components.keys()].sort(),sdk:['@a2ui/agent','@a2ui/web_core','@a2ui/lit'].map(name=>[name,JSON.parse(readFileSync('node_modules/'+name+'/package.json','utf8')).version])}));
  return {profile:PROFILE,source,dirty,lockHash:sha256(readFileSync('package-lock.json')),datasetHash:datasetHash(),oracleSetHash,catalogHash,assetHash:sha256(canonical(assets)),nodeMajor:24};
}
export function validateReport(report:Report,requireClean=false):void {
  assert.equal(report.identity.profile,PROFILE);assert.equal(report.identity.nodeMajor,24);
  assert.ok(['node','browser'].includes(report.role));assert.match(String(report.environment.node),/^v24\./);
  assert.match(report.identity.source,/^[a-f0-9]{40}$/);
  for(const key of ['lockHash','datasetHash','oracleSetHash','catalogHash','assetHash'] as const)assert.match(report.identity[key],/^[a-f0-9]{64}$/);
  if(report.role==='browser'){
    const expected=JSON.parse(readFileSync('node_modules/playwright-core/browsers.json','utf8')).browsers.find((item:{name:string})=>item.name==='chromium-headless-shell');
    assert.equal(report.environment.browserVersion,expected.browserVersion,'actual locked Chromium required');
    assert.equal(report.environment.browserRevision,expected.revision);
    assert.deepEqual(report.environment.viewport,{width:1280,height:900});assert.equal(report.environment.deviceScaleFactor,1);
    assert.equal(report.environment.theme,'light');assert.equal(report.environment.locale,'en-US');assert.equal(report.environment.timezone,'UTC');assert.equal(report.environment.reducedMotion,'reduce');
  }
  if(requireClean)assert.equal(report.identity.dirty,false,'dirty source cannot produce a complete delivery receipt');
  const expected=loadCases().filter(row=>report.role==='node'?row.layer!=='browser':row.layer==='browser');
  assert.deepEqual(report.results.map(result=>result.id).sort(),expected.map(row=>row.id).sort(),'exact layer IDs; no missing/extra/duplicate rows');
  for(const result of report.results){
    const row=expected.find(row=>row.id===result.id)!;
    assert.equal(result.layer,row.layer);assert.equal(result.polarity,row.polarity);
    assert.equal(result.pass,true,`${result.id} failed ${result.failedStage}: ${result.detail}`);assert.equal(result.failedStage,null);
    assert.equal(result.canary,false,'canaries excluded from dataset');
    assert.equal(result.fixtureHash,sha256(fixtureBytes(row.fixture)));assert.equal(result.actualInputHash,result.fixtureHash,'actual input belongs to its own manifest');
  }
}
export function combineReports(node:Report,browser:Report,requireClean=true):{cases:number;positive:number;negative:number} {
  assert.equal(node.role,'node');assert.equal(browser.role,'browser');
  validateReport(node,requireClean);validateReport(browser,requireClean);
  assert.deepEqual(node.identity,browser.identity,'incompatible source/profile/dataset/oracle/lock/catalog/asset identities');
  const results=[...node.results,...browser.results];assert.equal(results.length,68);
  assert.equal(new Set(results.map(result=>result.id)).size,68);
  return {cases:68,positive:results.filter(result=>result.polarity==='positive').length,negative:results.filter(result=>result.polarity==='negative').length};
}
export async function writeReport(role:Report['role'],results:CaseResult[],environment:Record<string,unknown>={}):Promise<Report> {
  const report:Report={identity:await identity(),role,environment:{node:process.version,platform:process.platform,arch:process.arch,...environment},results};
  await mkdir('.local/golden-reports',{recursive:true,mode:0o700});
  await writeFile(`.local/golden-reports/${role}.json`,JSON.stringify(report,null,2)+'\n',{mode:0o600});return report;
}

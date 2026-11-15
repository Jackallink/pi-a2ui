import {spawn} from 'node:child_process';
if(process.versions.node.split('.')[0]!=='24')throw new Error('Node24 required');
if(process.env.BM3_CAPTURE_ONLY==='1')throw new Error('Regression runner requires normal BM3 acceptance; capture-only is not acceptance');
const child=spawn(process.execPath,['node_modules/playwright/cli.js','test','tests/browser.spec.ts','tests/golden/browser.spec.ts','tests/visual/browser.spec.ts','--workers=1'],{stdio:'inherit'});
let exceeded=false,force;
const deadline=setTimeout(()=>{exceeded=true;child.kill('SIGTERM');force=setTimeout(()=>child.kill('SIGKILL'),5000);},300000);
child.once('error',error=>{console.error(error.message);});
child.once('close',code=>{clearTimeout(deadline);clearTimeout(force);if(exceeded)console.error('Owned browser runner exceeded5min; failed, no completeness claim');process.exitCode=exceeded?1:(code??1);});

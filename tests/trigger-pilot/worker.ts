// Pure public worker/API entry: authenticate live use before loading the Pi SDK.
import './offline-read-guard.ts';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {OLD_ID,verifyLiveWorker} from '../trigger-smoke/policy.ts';
import {PAIR_ID} from '../authoring-pilot/profile.ts';
import {verifyPairWorker} from '../authoring-pilot/authority.ts';
export async function episode(id:string,run:string,kind:string,simulation='',experiment=OLD_ID){
 if(kind==='live'){if(experiment===PAIR_ID)verifyPairWorker(run,id);else verifyLiveWorker(run,id,experiment);}
 const implementation=await import('./episode.ts');return implementation.episode(id,run,kind,simulation,experiment);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [id,run,kind,simulation,experiment]=process.argv.slice(2);
 episode(id,resolve(run),kind,simulation,experiment).catch(()=>{console.error('pilot worker setup/receipt failure; no automatic retry');process.exitCode=1;});
}

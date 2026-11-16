// Evaluate before Pi SDK modules. Synthetic workers cannot read the operator's config.
import fs from 'node:fs';
import promises from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {homedir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const state={active:process.argv[4]!=='live',denied:0};
(globalThis as any).pilotReadGuard=state;
if(state.active){
 const root=join(homedir(),'.pi/agent');
 const check=(path:any)=>{if(typeof path==='number')return;const p=resolve(path instanceof URL?fileURLToPath(path):String(path));if(p===root||p.startsWith(root+'/')){state.denied++;throw new Error('synthetic worker operator configuration access denied');}};
 for(const name of ['readFileSync','openSync','readFile','open']as const){const original=fs[name]as any;(fs as any)[name]=function(path:any,...args:any[]){check(path);return original.call(fs,path,...args);};}
 for(const name of ['readFile','open']as const){const original=promises[name]as any;(promises as any)[name]=function(path:any,...args:any[]){check(path);return original.call(promises,path,...args);};}
 syncBuiltinESMExports();
}

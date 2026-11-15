import type { CanvasServer } from '../../src/server.ts';
import type { UiSession } from '../../src/session.ts';
import { GoldenFailure } from './registry.ts';

// Each owned resource gets a bounded attempt even if the previous close fails.
export async function cleanupCanvas(page:{close():Promise<void>},server:CanvasServer|undefined,session:UiSession,primary:unknown):Promise<void> {
  const failures:string[]=[];
  async function close(label:string,run:()=>Promise<void>):Promise<void>{
    let timer:ReturnType<typeof setTimeout>|undefined;
    try{await Promise.race([run(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error(label+' close exceeded2s')),2000);})]);}
    catch(error){failures.push(label+': '+String(error));}
    finally{clearTimeout(timer);}
  }
  await close('page',()=>page.close());
  if(server)await close('server',()=>server.close());
  try{session.close();}catch(error){failures.push('session: '+String(error));}
  if(failures.length)throw new GoldenFailure('cleanup',JSON.stringify({primary:primary instanceof Error?String(primary):primary,cleanup:failures}));
}

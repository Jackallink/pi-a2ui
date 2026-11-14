import {COMMAND_PALETTE_CAPABILITY} from './command-palette.ts';
import {constants} from 'node:fs';
import {open,readFile} from 'node:fs/promises';
import {compile} from './compiler.ts';
import {catalogs} from './catalog.ts';
import {LIMITS} from './protocol.ts';

interface Example{name:string;requires:string[];pattern?:string;reference?:string}
const help='Usage: node SKILL/scripts/a2ui.mjs catalog | patterns | pattern NAME | examples | example NAME | check --surface-id ID FILE_OR_-\nRead-only preflight; rendering still requires a2ui_render. Requires Node24.x.\n';
async function sourceFile(path:string):Promise<string>{
 const chunks:Buffer[]=[];let size=0;
 if(path==='-'){
  if(process.stdin.isTTY)throw new Error('Pipe Express source to stdin or provide a source file');
  for await(const value of process.stdin){const chunk=Buffer.isBuffer(value)?value:Buffer.from(value);size+=chunk.length;if(size>LIMITS.sourceBytes)throw new Error('Source byte limit exceeded');chunks.push(chunk);}
 }else{
  const handle=await open(path,constants.O_RDONLY|constants.O_NONBLOCK);
  try{const stat=await handle.stat();if(!stat.isFile())throw new Error('Expected a regular source file');if(stat.size>LIMITS.sourceBytes)throw new Error('Source byte limit exceeded');
   const buffer=Buffer.alloc(LIMITS.sourceBytes+1);while(size<buffer.length){const read=await handle.read(buffer,size,buffer.length-size,size);if(!read.bytesRead)break;size+=read.bytesRead;}if(size>LIMITS.sourceBytes)throw new Error('Source byte limit exceeded');chunks.push(buffer.subarray(0,size));
  }finally{await handle.close();}
 }
 return new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(Buffer.concat(chunks));
}
export async function runCli(args:string[]):Promise<number>{
 const usage=()=>{process.stderr.write(JSON.stringify({error:'Invalid command or arguments',usage:help})+'\n');return 2;};
 if(Number(process.versions.node.split('.')[0])!==24){process.stderr.write(JSON.stringify({error:'Node24.x is required; run nvm use 24'})+'\n');return 2;}
 if(args.length===1&&args[0]==='--help'){process.stdout.write(help);return 0;}
 const [command,...rest]=args;
 if(!['catalog','patterns','pattern','examples','example','check'].includes(command)||(['catalog','patterns','examples'].includes(command)&&rest.length)||(['example','pattern'].includes(command)&&rest.length!==1)||(command==='check'&&(rest.length!==3||rest[0]!=='--surface-id')))return usage();
 try{
  // Select through the same compilation path, not a duplicate/hardcoded catalog.
  const probe=compile('preflight','root = Text(text="preflight")');
  const catalog=catalogs.find(c=>c.id===probe.createSurface.catalogId)!;
  if(command==='catalog'){
   const metadata=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
   process.stdout.write(JSON.stringify({packageVersion:metadata.version,nodeMajor:24,catalogId:catalog.id,components:[...catalog.components.keys()].sort(),scope:'This helper package, not an arbitrary running Pi instance'})+'\n');return 0;
  }
  if(command==='patterns'||command==='pattern'){
   const examples=JSON.parse(await readFile(new URL('../skills/pi-a2ui/examples/manifest.json',import.meta.url),'utf8')) as Example[];
   const metadata=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
   const identity={packageVersion:metadata.version,catalogId:catalog.id,scope:'This helper package, not an arbitrary running Pi instance',shellCapabilities:[COMMAND_PALETTE_CAPABILITY]};
   const patterns=examples.filter(example=>example.pattern).map(example=>{if(!example.reference)throw new Error('Pattern reference missing');return {name:example.pattern!,template:example.name,reference:example.reference,requires:example.requires,templateAvailable:example.requires.every(name=>catalog.components.has(name)),requiresShellCapabilities:example.pattern==='command-actions'?[COMMAND_PALETTE_CAPABILITY]:[]};});
   if(command==='patterns'){process.stdout.write(JSON.stringify({...identity,patterns})+'\n');return 0;}
   const selected=patterns.find(pattern=>pattern.name===rest[0]);if(!selected)throw new Error('Unknown pattern; use patterns to list allowed names');process.stdout.write(JSON.stringify({...identity,pattern:selected})+'\n');return 0;
  }
  if(command==='examples'||command==='example'){
   const examples=JSON.parse(await readFile(new URL('../skills/pi-a2ui/examples/manifest.json',import.meta.url),'utf8')) as Example[];
   if(command==='examples'){process.stdout.write(JSON.stringify(examples.map(e=>({...e,available:e.requires.every(name=>catalog.components.has(name))})))+'\n');return 0;}
   const selected=examples.find(e=>e.name===rest[0]);if(!selected)throw new Error('Unknown example; use examples to list allowed names');
   const missing=selected.requires.filter(name=>!catalog.components.has(name));if(missing.length)throw new Error('Example unavailable in this package catalog: '+missing.join(', '));
   const source=await readFile(new URL('../skills/pi-a2ui/examples/'+selected.name+'.express',import.meta.url),'utf8');compile('preflight',source);process.stdout.write(source);return 0;
  }
  const source=await sourceFile(rest[2]);compile(rest[1],source);process.stdout.write(JSON.stringify({surfaceId:rest[1],source})+'\n');return 0;
 }catch(error){process.stderr.write(JSON.stringify({error:error instanceof Error?error.message:'Preflight failed'})+'\n');return 1;}
}

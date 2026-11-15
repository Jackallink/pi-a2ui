export interface Rect {x:number;y:number;width:number;height:number}
export interface Subject {rect:Rect|null;visible:boolean;hit:boolean|null}
export interface LayoutObservation {viewport:{width:number;height:number};subjects:Record<string,Subject>}
export type Pair=readonly[string,string];
export function layoutFaults(observed:LayoutObservation,pairs:readonly Pair[]):string[]{
 const setup=(reason:string):never=>{throw new Error('BM3 setup: '+reason);};
 if(!observed.viewport||![observed.viewport.width,observed.viewport.height].every(value=>Number.isFinite(value)&&value>0))setup('invalid viewport');
 if(!Object.keys(observed.subjects).length||!pairs.length)setup('missing declared subjects/pairs');
 const faults:string[]=[];
 for(const [name,subject]of Object.entries(observed.subjects)){
  const box=subject.rect;
  if(!box||![box.x,box.y,box.width,box.height].every(Number.isFinite)||box.width<=0||box.height<=0)setup('missing/invalid geometry '+name);
  if(typeof subject.visible!=='boolean'||(subject.hit!==null&&typeof subject.hit!=='boolean'))setup('invalid visibility/hit '+name);
  if(!subject.visible)faults.push('hidden:'+name);
  if(box!.x<0||box!.y<0||box!.x+box!.width>observed.viewport.width||box!.y+box!.height>observed.viewport.height)faults.push('viewport:'+name);
  if(subject.hit===false)faults.push('occluded:'+name);
 }
 const seen=new Set<string>();
 for(const [first,second]of pairs){
  if(first===second||seen.has([first,second].sort().join('/')))setup('duplicate/self pair');seen.add([first,second].sort().join('/'));
  const a=observed.subjects[first]?.rect,b=observed.subjects[second]?.rect;
  if(!a||!b)setup('missing pair subject '+first+'/'+second);
  if(Math.min(a!.x+a!.width,b!.x+b!.width)-Math.max(a!.x,b!.x)>1&&Math.min(a!.y+a!.height,b!.y+b!.height)-Math.max(a!.y,b!.y)>1)faults.push('overlap:'+first+'/'+second);
 }
 return faults;
}

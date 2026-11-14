import {z} from 'zod';
import {ExpressUnknownPropertyError,ExpressMissingRequiredPropertyError,ExpressUnknownComponentError} from '@a2ui/agent';
import type {Catalog,ComponentApi} from '@a2ui/web_core/v1_0';
export const FORBIDDEN_AUTHORING_KEYS:readonly string[]=Object.freeze(['checks','path','call','callFunction']);
const inputNames=new Set(['TextField','CheckBox','ChoicePicker','Slider','DateTimeInput','SearchablePicker']);
const nativeNames=new Set(['LogView','TaskProgress','ActivityTimeline']);
export function authoringParameters(api:ComponentApi):{name:string;required:boolean}[]{
 let schema:z.ZodTypeAny=api.schema;
 for(let depth=0;depth<8;depth++){
  if(schema instanceof z.ZodObject)return Object.entries(schema.shape as Record<string,z.ZodTypeAny>)
   .filter(([name])=>!FORBIDDEN_AUTHORING_KEYS.includes(name)&&(!nativeNames.has(api.name)||name==='stream'))
   .map(([name,property])=>({name,required:(inputNames.has(api.name)&&name==='value')||(api.name==='DateTimeInput'&&['enableDate','enableTime'].includes(name))||!property.isOptional()}));
  if(schema instanceof z.ZodEffects)schema=schema.innerType();
  else if(schema instanceof z.ZodOptional||schema instanceof z.ZodNullable)schema=schema.unwrap();
  else if(schema instanceof z.ZodDefault)schema=schema.removeDefault();
  else break;
 }
 throw new Error('Authoring parameter metadata unavailable for '+api.name);
}
export function expressCause(error:unknown):ExpressUnknownPropertyError|ExpressMissingRequiredPropertyError|ExpressUnknownComponentError|undefined{
 const seen=new Set<unknown>();let current=error;
 for(let depth=0;depth<8&&current instanceof Error&&!seen.has(current);depth++){
  seen.add(current);
  if(current instanceof ExpressUnknownPropertyError||current instanceof ExpressMissingRequiredPropertyError||current instanceof ExpressUnknownComponentError)return current;
  current=current.cause;
 }
 return undefined;
}
export function compilerErrorMessage(error:unknown,catalog:Catalog<ComponentApi>):string{
 const cause=expressCause(error);
 if(cause instanceof ExpressUnknownPropertyError||cause instanceof ExpressMissingRequiredPropertyError){
  const api=catalog.components.get(cause.compName);let properties:string[]=[];
  try{if(api)properties=authoringParameters(api).map(p=>p.name);}catch{/* Keep the error honest if an upstream schema changes. */}
  const reason=cause instanceof ExpressUnknownPropertyError?`Property '${cause.propName}' is not a valid property of component '${cause.compName}'.`:`Component '${cause.compName}' requires property '${cause.propName}'.`;
  let location='';if(error instanceof Error){const details=error as Error&{line?:number;column?:number};if(Number.isSafeInteger(details.line)&&details.line!>=0)location=' Line '+details.line+(Number.isSafeInteger(details.column)&&details.column!>=0?', Col '+details.column:'')+'.';}
  return reason+location+(properties.length?' Allowed authoring properties: '+properties.join(', ')+'.':' Query component metadata for supported authoring properties.');
 }
 return error instanceof Error?error.message:'compilation failed';
}

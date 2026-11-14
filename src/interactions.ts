import {z} from 'zod';
import {basicCatalog,type ComponentApi} from '@a2ui/web_core/v1_0';
import {UiError,type SurfaceMessage} from './protocol.ts';
const choice=basicCatalog.components.get('ChoicePicker')!.schema as z.ZodObject<any>;
export const searchablePickerApi={name:'SearchablePicker',schema:z.object({label:z.string().min(1).max(128),options:z.array(z.object({label:z.string().min(1).max(128),value:z.string().min(1).max(128)}).strict()).max(200),value:choice.shape.value,variant:z.enum(['mutuallyExclusive','multipleSelection']).default('mutuallyExclusive')}).strict()} satisfies ComponentApi;
export const interactionApis:ComponentApi[]=[searchablePickerApi];
export function validateInteractions(message:SurfaceMessage,_initial=false):void{
 for(const c of message.createSurface.components){
  if(c.component==='SearchablePicker'){
   const {id:_,component:__,...props}=c;const parsed=searchablePickerApi.schema.parse(props);
   if(!parsed.value||typeof parsed.value!=='object'||Array.isArray(parsed.value)||!('@path' in parsed.value))throw new UiError(400,'SearchablePicker requires an initialized absolute value binding');
   Object.assign(c,parsed);
  }
 }
}

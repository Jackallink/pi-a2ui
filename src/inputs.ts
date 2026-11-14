import { UiError, type Component } from './protocol.ts';

const inputTypes = new Set(['TextField','CheckBox','ChoicePicker','Slider','DateTimeInput','SearchablePicker']);
export function inputPaths(components: Iterable<Component>): Map<string, Component> {
  const paths = new Map<string, Component>();
  for (const component of components) {
    if (!inputTypes.has(component.component)) continue;
    const value = component.value;
    if (!value || typeof value !== 'object' || !('@path' in value)) continue;
    const path = (value as {'@path':string})['@path'];
    const previous = paths.get(path);
    if (previous && (previous.component !== 'TextField' || component.component !== 'TextField')) throw new UiError(400,'Typed input bindings must not share paths');
    paths.set(path,component);
  }
  return paths;
}
function datePart(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year,month,day] = match.slice(1).map(Number);
  const leap = year%4===0 && (year%100!==0 || year%400===0);
  const days = [31,leap?29:28,31,30,31,30,31,31,30,31,30,31];
  return year>=1 && month>=1 && month<=12 && day>=1 && day<=days[month-1];
}
function dateValue(component: Component, value: unknown, empty: boolean): string {
  if (typeof value !== 'string') throw new UiError(400,'Date/time input must be a string');
  if (empty && value==='') return '';
  const date = component.enableDate;
  const time = component.enableTime;
  const parts = date && time ? value.split('T') : [value];
  const valid = date && time ? parts.length===2 && datePart(parts[0]) && timePart(parts[1]) : date ? datePart(value) : timePart(value);
  if (!valid) throw new UiError(400,'Invalid local calendar date/time');
  // SDK emits optional :00 seconds; compare equivalent minute values equally.
  return time && (date ? parts[1] : value).length===8 ? value.slice(0,-3) : value;
}
function timePart(value: string): boolean { return /^(?:[01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(value); }
export function validateInput(component: Component, value: unknown): void {
  switch (component.component) {
    case 'TextField':
      if (typeof value !== 'string') throw new UiError(400,'TextField context must be a string');
      break;
    case 'CheckBox':
      if (typeof value !== 'boolean') throw new UiError(400,'CheckBox value must be a boolean');
      break;
    case 'ChoicePicker':
    case 'SearchablePicker': {
      const options = component.options as Array<{value:string}>;
      const allowed = new Set(options.map(option=>option.value));
      if (allowed.size!==options.length) throw new UiError(400,'Duplicate choice option IDs');
      if (!Array.isArray(value) || value.some(item=>typeof item!=='string' || !allowed.has(item)) || new Set(value).size!==value.length || component.variant!=='multipleSelection' && value.length>1) throw new UiError(400,'Invalid choice selection');
      break;
    }
    case 'Slider': {
      const min = component.min ?? 0;
      const max = component.max;
      if (typeof min!=='number' || typeof max!=='number' || !Number.isFinite(min) || !Number.isFinite(max) || min>=max || !Number.isFinite(max-min)) throw new UiError(400,'Invalid static slider range');
      if (typeof value!=='number' || !Number.isFinite(value) || value<min || value>max) throw new UiError(400,'Slider value outside the declared range');
      if (component.steps!==undefined) {
        const steps = component.steps;
        if (typeof steps!=='number' || !Number.isSafeInteger(steps) || steps<1) throw new UiError(400,'Invalid slider divisions');
        const index = (value-min)/(max-min)*steps;
        if (Math.abs(index-Math.round(index))>1e-8) throw new UiError(400,'Slider value is off the declared grid');
      }
      break;
    }
    case 'DateTimeInput': {
      if (typeof component.enableDate!=='boolean' || typeof component.enableTime!=='boolean' || !component.enableDate && !component.enableTime) throw new UiError(400,'Date/time flags must be explicit and enable at least one input');
      const current = dateValue(component,value,true);
      const min = component.min===undefined ? undefined : dateValue(component,component.min,false);
      const max = component.max===undefined ? undefined : dateValue(component,component.max,false);
      if (min!==undefined && max!==undefined && min>max || current!=='' && (min!==undefined && current<min || max!==undefined && current>max)) throw new UiError(400,'Date/time value outside the declared range');
      break;
    }
  }
}
export function validateInputs(components: Iterable<Component>, resolve: (path:string)=>unknown): void {
  const entries = [...components];
  inputPaths(entries);
  for (const component of entries) {
    if (!inputTypes.has(component.component)) continue;
    const value = component.value;
    validateInput(component,value && typeof value==='object' && '@path' in value ? resolve((value as {'@path':string})['@path']) : value);
  }
}

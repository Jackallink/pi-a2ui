import { basicCatalog } from '@a2ui/web_core/v1_0';

// Keep the official implementations; pruning schema alone would not render in Lit.
export const restrictedCatalog = basicCatalog.derive({
  catalogId: basicCatalog.id,
  components: ['Text', 'Column', 'Row', 'Card', 'Button', 'TextField', 'CheckBox', 'ChoicePicker', 'Slider', 'DateTimeInput', 'Tabs', 'Divider'],
  functions: [],
  instructions: 'Use only the twelve declared components. Text is literal escaped plain text. Use event actions only. No functions, checks, templates, URLs, media or executable expressions. Bind event context only to absolute value paths of reachable inputs. Initialize TextField with strings, CheckBox booleans, Slider bounded finite numbers, ChoicePicker string arrays. Use explicit enableDate/enableTime flags and local YYYY-MM-DD / HH:mm / YYYY-MM-DDTHH:mm date/time strings, optional :00 seconds. Declare static ranges/options.',
});

import { basicCatalog } from '@a2ui/web_core/v1_0';

// Keep the official implementations; pruning schema alone would not render in Lit.
export const restrictedCatalog = basicCatalog.derive({
  catalogId: basicCatalog.id,
  components: ['Text', 'Column', 'Row', 'Card', 'Button', 'TextField'],
  functions: [],
  instructions: 'Use only Text, Column, Row, Card, Button and TextField. Text is literal escaped plain text. Use event actions only. No functions, checks, templates, URLs, media or executable expressions. Bind event context only to absolute value paths of reachable TextFields; submitted values are strings.',
});

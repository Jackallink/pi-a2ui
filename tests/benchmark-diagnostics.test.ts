import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {loadRegistry, verifyFixturePair, verifyDocumentation} from './benchmark/diagnostics.ts';

// These exercise current product rejection and the shipped repair's actual semantics.
// Missing bindings must fail only after complete fixtures have proved runnable.
for (const family of loadRegistry().families) {
  test(`BM1 ${family.id}: actual positive and negative fixtures`, () => verifyFixturePair(family));
  test(`BM1 ${family.id}: shipped executable repair`, () => {
    verifyFixturePair(family);
    verifyDocumentation(family, readFileSync(family.doc.path, 'utf8'));
  });
}

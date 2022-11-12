import test from 'node:test';
import { readFile } from 'node:fs/promises';

import snapshot from '../src/usnap.js';

snapshot.setup(import.meta.url);

test('take a snapshot of package.json', async t => {
  const pjson = JSON.parse(await readFile('package.json', 'utf-8'));

  await snapshot(pjson, t.name);

  const anotherObject = {
    foo: {
      bar: 42
    }
  };

  await snapshot(anotherObject, t.name);
});

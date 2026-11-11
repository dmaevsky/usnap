# μsnap

> **⚠️ Deprecated.** Node.js now has usable built-in snapshot testing. Use [`t.assert.snapshot()`](https://nodejs.org/api/test.html#context-assert) from `node:test` instead (stable since Node 22.13 / 23.4).

## Why deprecated?

μsnap was written for Node 18. Back then the experimental `assert.snapshot` serialized values with `util.inspect` at its default depth, which made it useless for anything non-trivial. Things have changed since:

- `assert.snapshot` was removed in Node 20.
- `node:test` provides `t.assert.snapshot(value)`. It serializes with `JSON.stringify(value, null, 2)` by default, numbers multiple snapshots per test automatically, and updates them with `--test-update-snapshots`.
- You can set custom serializers (YAML, for example) per call with `{ serializers: [...] }` or globally with `snapshot.setDefaultSnapshotSerializers()`.
- `t.assert.fileSnapshot(value, path)` (Node 22.14 / 23.7) stores one value in a file of your choice.
- `node:test` prints human-readable output by default since Node 20, so [`utap`](https://github.com/dmaevsky/utap) is obsolete too.

## Migrating

```js
import test from 'node:test';

test('test name', t => {
  t.assert.snapshot({ foo: { bar: 42 } });
});
```
```
node --test                          # compare
node --test --test-update-snapshots  # create / update
```

Snapshots are stored in `<test file>.snapshot` next to the test file.

### Caveats compared to μsnap

- **Filtered updates:** running `--test-update-snapshots` together with `--test-name-pattern` or `--test-only` rewrites the whole `.snapshot` file and **drops the snapshots of tests that did not run**. μsnap kept a separate file per test, so this never happened there. If you rely on this, use `t.assert.fileSnapshot()` with one file per test.
- **Comparison is textual:** the native runner compares serialized strings, so changing object key order fails the snapshot. μsnap compared with `assert.deepEqual`.
- **Missing snapshots fail** unless you pass `--test-update-snapshots`. μsnap wrote them silently.
- **JSON limitations:** with the default serializer, `Date`s become strings, `Map`/`Set` become `{}`, `undefined` properties are dropped, and `BigInt` throws. A custom serializer solves this.

## Legacy usage

For reference, this is how μsnap was used:

```js
import snapshot from 'usnap';

snapshot.setup(import.meta.url);

test('test name', async t => {
  await snapshot({ foo: { bar: 42 } }, t.name);
});
```
```
node my.test.js      # compare (missing snapshots are created)
node my.test.js -u   # update
```
It created one YAML file per test in a `snapshots/` directory next to the test file.

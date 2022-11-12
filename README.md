# μsnap
A micro snapshot testing tool that works very well with the Node >=18 built-in [`node:test`](https://nodejs.org/docs/latest-v18.x/api/test.html) harness.

## Usage
```
npm install --save-dev usnap utap
```
*Note:* [`utap`](https://github.com/dmaevsky/utap) is of course optional: it is a test TAP output formatter

`my.test.js`:
```js
import snapshot from 'usnap';

snapshot.setup(import.meta.url);

test('test name', async t => {
  const obj = { foo: { bar: 42 } };

  await snapshot(obj, t.name);
});
```
Run the test:
```
node my.test.js | npx utap
```
The snapshot will be created in the `snapshots/` directory next to `my.test.js`.

To update the snapshot:
```
node my.test.js -u | npx utap
```

## But why?

- The currently built-in [`assert.snapshot`](https://nodejs.org/docs/latest-v18.x/api/assert.html#assertsnapshotvalue-name) is horrible since it is using `util.inspect` for serialization, with default options, which means limited depth and basically produces garbage
- `μsnap` relies on YAML. One could not possibly choose a better format for snapshots, since it is
  - perfectly human-readable, git-friendly, and ubiquitously supported
  - homomorphic in the sense
  ```js
  assert.equal(YAML.stringify(array), array.map(a => YAML.stringify([a])).join(''))
  ```
  which makes it trivial to append to an existing snapshot file.
- Unlike most snapshot testing tools, `μsnap` creates a separate snapshot file *for each individual test point*. This avoids many issues when running tests in parallel and updating snapshots in `--test-only` mode.
- 60 lines of code with [YAML](https://www.npmjs.com/package/yaml) as the only dependency.

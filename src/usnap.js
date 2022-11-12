import assert from 'node:assert/strict';

import { readFile, writeFile, appendFile, mkdir } from 'fs/promises';
import YAML from 'yaml';

let snapBasename, updateRequested;
const counters = {};
const expected = {};

async function writeSnapshot(actual, filename, index) {
  const write = index ? appendFile : writeFile;
  return write(filename, YAML.stringify([actual]), 'utf-8');
}

export default async function snapshot(actual, testName) {
  assert(snapBasename, 'Insert `snapshot.setup(import.meta.url)` before your tests');

  const filename = `${await snapBasename}(${testName}).yml`;
  const index = testName in counters ? ++counters[testName] : (counters[testName] = 0);

  if (updateRequested) {
    return writeSnapshot(actual, filename, index);
  }

  if (!expected[testName]) {
    try {
      expected[testName] = YAML.parse(await readFile(filename, 'utf-8'));
    }
    catch (err) {
      if (err.code !== 'ENOENT') throw err;
      expected[testName] = [];
    }
  }

  if (index >= expected[testName].length) {
    return writeSnapshot(actual, filename, index);
  }

  assert.deepEqual(actual, expected[testName][index]);
}

async function getSnapBasename(testURL) {
  const snapshotDir = new URL('snapshots/', testURL);
  try {
    await mkdir(snapshotDir.pathname);
  }
  catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  testURL = testURL.slice(testURL.lastIndexOf('/') + 1);
  testURL = /^[^\.]*/.exec(testURL)[0];

  return new URL(testURL, snapshotDir).pathname;
}

snapshot.setup = testURL => {
  snapBasename = getSnapBasename(testURL);
  updateRequested = process.argv[2] === '-u';
}

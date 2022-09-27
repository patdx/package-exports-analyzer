import { ITestCase } from '../components/test-case';

export const INITIAL_VALUE_JSON = {
  name: 'foobar',
  module: 'dist/module.mjs',
  main: 'dist/require.js',
  exports: {
    '.': {
      import: './dist/module.mjs',
      require: './dist/require.js',
    },
    './lite': {
      worker: {
        browser: './lite/worker.brower.js',
        node: './lite/worker.node.js',
      },
      import: './lite/module.mjs',
      require: './lite/require.js',
    },
  },
};

export const INITIAL_VALUE_TEXT = JSON.stringify(
  INITIAL_VALUE_JSON,
  undefined,
  2
);

export const INITIAL_TEST_CASES: ITestCase[] = [
  {
    type: 'import',
    path: '.',
  },
  {
    type: 'import',
    path: './lite',
  },
  {
    type: 'import',
    path: './lite',
    conditions: ['worker'],
  },
  {
    type: 'import',
    path: './lite',
    conditions: ['worker'],
    browser: true,
  },
];

import Editor from '@monaco-editor/react';
import dirtyJson from 'dirty-json';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { References } from '../components/references';
import { ITestCase, TestCase } from '../components/test-case';
import { analyzePackageJson } from '../shared/analyze-package-json';

// Useful links
// https://www.npmjs.com/package/exports-test
// https://webpack.js.org/guides/package-exports/
// Looks useful but cannot be used directly:
// https://github.com/ljharb/list-exports/blob/main/packages/list-exports/index.js

const INITIAL_VALUE_JSON = {
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

const INITIAL_VALUE_TEXT = JSON.stringify(INITIAL_VALUE_JSON, undefined, 2);

const INITIAL_TEST_CASES: ITestCase[] = [
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

const Home: NextPage = () => {
  const [text, setText] = useState(INITIAL_VALUE_TEXT);

  const [parsed, setParsed] = useState(INITIAL_VALUE_JSON);

  useEffect(() => {
    try {
      setParsed(dirtyJson.parse(text));
    } catch (err) {
      // console.warn(err);
    }
  }, [text]);

  const analysis = useMemo(() => analyzePackageJson(parsed), [parsed]);

  return (
    <div className="grid min-h-screen grid-cols-2">
      <Head>
        <title>Package Export Analyzer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex-1 h-full flex flex-col">
        <div className="flex-none p-2 flex items-center">
          <a
            href="https://github.com/patdx/package-export-analyzer"
            className="font-bold text-blue-500 active:text-blue-700 hover:text-blue-600"
          >
            Package Export Analyzer
          </a>
          <div className="flex-1"></div>
          <button
            className="border p-1 rounded hover:bg-gray-200 active:bg-gray-300"
            onClick={() => setText(JSON.stringify(parsed, undefined, 2))}
          >
            Format JSON
          </button>
        </div>
        <div className="flex-1">
          <Editor
            language="json"
            options={{
              tabSize: 2,
            }}
            value={text}
            onChange={(value) => {
              setText(value ?? '');
            }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-1">
          <h1>Used export condition names</h1>
          <div>{analysis?.conditionNames?.join(', ')}</div>
        </div>
        <div className="p-1 flex flex-col gap-1">
          {INITIAL_TEST_CASES.map((testCase, index) => (
            <TestCase key={index} packageJson={parsed} testCase={testCase} />
          ))}
        </div>
        {/* <pre className="text-gray-500 text-sm">
          {JSON.stringify(parsed, undefined, 2)}
        </pre> */}
        <div className="flex-1"></div>
        <div className="p-1">
          <References />
        </div>
      </div>
    </div>
  );
};

export default Home;

import Editor from '@monaco-editor/react';
import dirtyJson from 'dirty-json';
import type { NextPage } from 'next';
import Head from 'next/head';
import { FC, useEffect, useState } from 'react';
import { resolve } from 'resolve.exports';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

// Useful links
// https://www.npmjs.com/package/exports-test
// https://webpack.js.org/guides/package-exports/
// Looks useful but cannot be used directly:
// https://github.com/ljharb/list-exports/blob/main/packages/list-exports/index.js

type IReference =
  | { type: 'url'; href: string }
  | { type: 'npm'; package: string };

const REFERENCES: Array<IReference> = [
  { type: 'url', href: 'https://webpack.js.org/guides/package-exports/' },
  {
    type: 'url',
    href: 'https://nodejs.org/api/packages.html#conditional-exports',
  },
  { type: 'npm', package: 'resolve.exports' },
];

const Reference: FC<IReference> = (props) => {
  if (props.type === 'url') {
    return <a href={props.href}>{props.href}</a>;
  } else if (props.type === 'npm') {
    return (
      <a href={`https://www.npmjs.com/package/${props.package}`}>
        {props.package}
      </a>
    );
  } else {
    return null;
  }
};

const References: FC = () => {
  return (
    <>
      {REFERENCES.map((reference, index) => (
        <li key={index}>
          <Reference {...reference} />
        </li>
      ))}
    </>
  );
};

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

interface TestCase {
  /** default is "import" */
  type?: 'import' | 'require';
  /** default is "." */
  path?: string;
  /**
   * true = "browser"
   * false = "node"
   */
  browser?: boolean;
  conditions?: string[];
}

const INITIAL_TEST_CASES: TestCase[] = [
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

const TestCaseResult: FC<{
  testCase: TestCase;
  packageJson: unknown;
}> = ({ testCase, packageJson }) => {
  const isRequire = testCase.type === 'require';

  const result = pipe(
    E.tryCatch(
      () =>
        resolve(packageJson, testCase.path ?? '.', {
          require: isRequire,
          conditions: testCase.conditions,
          browser: testCase.browser,
        }),
      (err) => err as Error
    ),
    E.match(
      (err) => `Error: ${err.message}`,
      (result) => result
    )
  );

  const importFnName = isRequire ? 'require' : 'import';

  const allConditions = new Set<string>([
    'default',
    ...(testCase.conditions ?? []),
  ]);

  allConditions.add(importFnName);

  if (testCase.browser) {
    allConditions.add('browser');
  } else {
    allConditions.add('node');
  }

  const importStatement = `${importFnName}(${JSON.stringify(testCase.path)}`;

  return (
    <div className="border p-1 rounded group">
      <div className="flex items-center">
        {importStatement}
        {testCase.conditions ? (
          <small>, {JSON.stringify({ conditions: testCase.conditions })}</small>
        ) : undefined}
        {')'}
      </div>
      <div className="text-sm text-gray-200 group-hover:text-gray-500 group-active:text-gray-500">
        All conditions: {JSON.stringify(Array.from(allConditions))}
      </div>
      <div className="text-right">{result ?? ''}</div>
    </div>
  );
};

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
        <div className="p-1 flex flex-col gap-1">
          {INITIAL_TEST_CASES.map((testCase, index) => (
            <TestCaseResult
              key={index}
              packageJson={parsed}
              testCase={testCase}
            />
          ))}
        </div>
        {/* <pre className="text-gray-500 text-sm">
          {JSON.stringify(parsed, undefined, 2)}
        </pre> */}
        <div className="flex-1"></div>
        <div className="p-1">
          <h4>References</h4>
          <ul className="list-disc list-inside">
            <References />
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;

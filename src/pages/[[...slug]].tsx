import Editor from '@monaco-editor/react';
import dirtyJson from 'dirty-json';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { Dependencies } from '../components/dependencies';
import { References } from '../components/references';
import { TestCase } from '../components/test-case';
import { UsedConditions } from '../components/used-conditions';
import { analyzePackageJson } from '../shared/analyze-package-json';
import {
  INITIAL_TEST_CASES,
  INITIAL_VALUE_JSON,
  INITIAL_VALUE_TEXT,
} from '../shared/consts';

// Useful links
// https://www.npmjs.com/package/exports-test
// https://webpack.js.org/guides/package-exports/
// Looks useful but cannot be used directly:
// https://github.com/ljharb/list-exports/blob/main/packages/list-exports/index.js

const Home: NextPage = () => {
  const [text, setText] = useState(INITIAL_VALUE_TEXT);

  const [parsed, setParsed] = useState(INITIAL_VALUE_JSON);

  const router = useRouter();

  const query = (router.query.slug as string[])?.join('/');

  useEffect(() => {
    if (query) {
      loadFromPackageJson(query);
    }
  }, [query]);

  const loadFromPackageJson = async (packageName: string) => {
    const result = await fetch(
      `https://unpkg.com/${packageName}/package.json`
    ).then((result) => result.text());
    setText(result);
  };

  useEffect(() => {
    try {
      setParsed(dirtyJson.parse(text));
    } catch (err) {
      // console.warn(err);
    }
  }, [text]);

  const analysis = useMemo(() => analyzePackageJson(parsed), [parsed]);

  return (
    <div className="grid h-screen grid-cols-2">
      <Head>
        <title>Package Export Analyzer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <div className="flex flex-none items-center gap-2 p-2">
          <a
            href="https://github.com/patdx/package-export-analyzer"
            className="font-bold text-blue-500 hover:text-blue-600 active:text-blue-700"
          >
            Package Export Analyzer
          </a>
          <div className="flex-1"></div>
          <Button
            onClick={() => {
              const packageName = prompt('Enter a package name');
              if (!packageName) return;
              loadFromPackageJson(packageName);
            }}
          >
            Load package.json from NPM...
          </Button>
          <Button onClick={() => setText(JSON.stringify(parsed, undefined, 2))}>
            Format JSON
          </Button>
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

      <div className="flex h-screen flex-1 flex-col overflow-y-auto">
        <Card title="Used export condition names">
          <UsedConditions
            conditionNames={analysis.conditionNames}
            pkg={parsed}
          />
        </Card>

        <Dependencies pkg={parsed} />

        {1 > 2 && (
          <Card title="Test cases">
            <div className="flex flex-col gap-1 p-1">
              {INITIAL_TEST_CASES.map((testCase, index) => (
                <TestCase
                  key={index}
                  packageJson={parsed}
                  testCase={testCase}
                />
              ))}
            </div>
          </Card>
        )}

        {/* <pre className="text-gray-500 text-sm">
          {JSON.stringify(parsed, undefined, 2)}
        </pre> */}
        <div className="flex-1"></div>
        <Card title="References">
          <References />
        </Card>
      </div>
    </div>
  );
};

export default Home;

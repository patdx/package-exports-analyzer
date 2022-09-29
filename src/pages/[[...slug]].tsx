import Editor from '@monaco-editor/react';
import dirtyJson from 'dirty-json';
import type { NextPage } from 'next';
import Head from 'next/head';
import Router from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { Dependencies } from '../components/dependencies';
import { PackageFileList } from '../components/package-file-list';
import { References } from '../components/references';
import { SimplifiedExports } from '../components/simplified';
import { TestCase } from '../components/test-case';
import { UsedConditions } from '../components/used-conditions';
import { analyzePackageJson } from '../shared/analyze-package-json';
import {
  INITIAL_TEST_CASES,
  INITIAL_VALUE_JSON,
  INITIAL_VALUE_TEXT,
} from '../shared/consts';
import { usePackageInfo, usePackageInfoForPage } from '../shared/load-package';

// Useful links
// https://www.npmjs.com/package/exports-test
// https://webpack.js.org/guides/package-exports/
// Looks useful but cannot be used directly:
// https://github.com/ljharb/list-exports/blob/main/packages/list-exports/index.js

const Home: NextPage = () => {
  const [text, setText] = useState(INITIAL_VALUE_TEXT);

  const [pkg, setPkg] = useState(INITIAL_VALUE_JSON);

  const info = usePackageInfoForPage();

  useEffect(() => {
    if (info.requestedPath.data) {
      setText(JSON.stringify(info.requestedPath.data, undefined, 2));
    }
  }, [info.requestedPath.data]);

  useEffect(() => {
    try {
      setPkg(dirtyJson.parse(text));
    } catch (err) {
      // console.warn(err);
    }
  }, [text]);

  const analysis = useMemo(() => analyzePackageJson(pkg), [pkg]);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-none items-center gap-2 p-2">
        <a
          href="https://github.com/patdx/package-export-analyzer"
          className="font-bold text-blue-500 hover:text-blue-600 active:text-blue-700"
        >
          Package Exports Analyzer
        </a>
        {/* <div className="flex-1"></div> */}
        <Button
          onClick={() => {
            const packageName = prompt('Enter a package name');
            if (!packageName) return;
            Router.push(`/${packageName}`);
          }}
        >
          Load package.json from NPM...
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-5 gap-2 overflow-clip">
        <Head>
          <title>Package Exports Analyzer</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div>
          <PackageFileList />
          <Dependencies pkg={pkg} />
        </div>

        <div className="col-span-2 flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-none items-center justify-end gap-2 p-2">
            <Button onClick={() => setText(JSON.stringify(pkg, undefined, 2))}>
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

        <div className="relative col-span-2 flex flex-1 flex-col overflow-y-auto">
          {/* <PackageFileList /> */}

          <UsedConditions conditionNames={analysis.conditionNames} pkg={pkg} />

          {/* show a window that has all the sub package jsons listed and selectable*/}
          {/* using unpkg.com/react/?meta */}

          {1 > 2 && (
            <Card title="Test cases">
              <div className="flex flex-col gap-1 p-1">
                {INITIAL_TEST_CASES.map((testCase, index) => (
                  <TestCase key={index} pkg={pkg} testCase={testCase} />
                ))}
              </div>
            </Card>
          )}

          {1 > 2 && <SimplifiedExports />}

          {/* <pre className="text-gray-500 text-sm">
          {JSON.stringify(parsed, undefined, 2)}
        </pre> */}
          <div className="flex-1"></div>
          <Card title="References">
            <References />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;

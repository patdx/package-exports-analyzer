import Editor from '@monaco-editor/react';
import dirtyJson from 'dirty-json';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './components/button';
import { Card } from './components/card';
import { Dependencies } from './components/dependencies';
import { PackageFileList } from './components/package-file-list';
import { References } from './components/references';
import { SimplifiedExports } from './components/simplified';
import { TestCase } from './components/test-case';
import { UsedConditions } from './components/used-conditions';
import { analyzePackageJson } from './shared/analyze-package-json';
import {
  INITIAL_TEST_CASES,
  INITIAL_VALUE_JSON,
  INITIAL_VALUE_TEXT,
} from './shared/consts';
import { usePackageInfoForPage } from './shared/load-package';
import { navigate, replace, usePathname } from './shared/router';

const App = () => {
  const [text, setText] = useState(INITIAL_VALUE_TEXT);
  const [pkg, setPkg] = useState(INITIAL_VALUE_JSON);
  const info = usePackageInfoForPage();
  const pathname = usePathname();

  useEffect(() => {
    document.title = 'Package Exports Analyzer';
  }, []);

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

  useEffect(() => {
    if (!info.parsed && pathname === '/') {
      replace('/exports-test');
    }
  }, [info.parsed, pathname]);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-none items-center gap-2 p-2">
        <a
          href="https://github.com/patdx/package-export-analyzer"
          className="font-bold text-blue-500 hover:text-blue-600 active:text-blue-700"
        >
          Package Exports Analyzer
        </a>
        <Button
          onClick={() => {
            const packageName = prompt('Enter a package name');
            if (!packageName) return;
            navigate(`/${packageName}`);
          }}
        >
          Load package.json from NPM...
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-5 gap-2 overflow-clip">
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
          <UsedConditions conditionNames={analysis.conditionNames} pkg={pkg} />

          {1 > 2 && (
            <Card title="Test cases">
              <div className="flex flex-col gap-1 p-1">
                {INITIAL_TEST_CASES.map((testCase, index) => (
                  <TestCase key={index} pkg={pkg} testCase={testCase} />
                ))}
              </div>
            </Card>
          )}

          {1 > 0 && <SimplifiedExports />}

          <div className="flex-1"></div>
          <Card title="References">
            <References />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default App;

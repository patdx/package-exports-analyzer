import { pipe } from 'fp-ts/lib/function';
import { FC } from 'react';
import { resolve } from 'resolve.exports';
import * as E from 'fp-ts/Either';

export interface ITestCase {
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

export const TestCase: FC<{
  testCase: ITestCase;
  pkg: unknown;
}> = ({ testCase, pkg }) => {
  const isRequire = testCase.type === 'require';

  const result = pipe(
    E.tryCatch(
      () =>
        resolve(pkg, testCase.path ?? '.', {
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
    <div className="group rounded border p-1">
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

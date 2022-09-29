// type Export = ExportsObject | ExportsList | ExportsList
// type ExportsObject = Record<string, Export>;
// type ExportsList = Array<Export>;
// type ExportPath = string;

import { simplify } from 'mathjs';
import { IPackageJsonExports, IPackageJsonExportsNode } from './types';

const smplfy = (text: string) => {
  try {
    return simplify(text, [
      'not(n1 and n2) -> not(n1) or not(n2)',
      'not(n1 or n2) -> not(n1) and not(n2)',
      'not(not(n1)) -> n1',
      'n1 and (n2 and n3) -> (n1 and n2) and n3',
      'n1 or (n2 or n3) -> n1 or n2 or n3',
      '(n1 and n2) or (n1 and n3) -> (n1) and (n2 or n3)',
    ]).toString();
  } catch (err) {
    return String(err);
  }
};

// right now the output looks like this, I thought I might be able to use
// mathjs to simplify it algebraically but it is not quite working.
// accurate yet:
// "'./store' -> './store/dist/server.cjs'": {
//   "rules": [
//     "worker and not(import) and require",
//     "not(worker) and not(browser) and deno and not(import) and require",
//     "not(worker) and not(browser) and not(deno) and node and not(import) and require"
//   ],
//   "combined": "(worker and not(import) and require) or (not(worker) and not(browser) and deno and not(import) and require) or (not(worker) and not(browser) and not(deno) and node and not(import) and require)",
//   "simplified": "worker and not import and require or not worker and not browser and deno and not import and require or not worker and not browser and not deno and node and not import and require"
// },

type Output = Map<
  string,
  {
    rules: string[];
    combined: string;
    simplified: string;
  }
>;

interface TraverseContext {
  node: IPackageJsonExportsNode;
  output: Output;
  rules: Set<string>;
  path: string;
}

export const simplifyExports = (exports?: IPackageJsonExports) => {
  const output: Output = new Map();

  if (exports) {
    traverseExports({
      node: exports,
      output,
      rules: new Set(),
      path: '.',
    });
  }

  for (const match of output.values()) {
    match.combined = match.rules.map((expr) => `(${expr})`).join(' or ');
    match.simplified = smplfy(match.combined);
  }

  return Object.fromEntries(output);
};

const traverseExports = (context: TraverseContext): void => {
  const { node, output, rules, path } = context;
  if (typeof node === 'string') {
    const vector = `'${path}' -> '${node}'`;
    const match = output.get(vector) ?? ({} as any);
    if (!match.rules) {
      match.rules = [];
    }

    if (rules.size >= 1) {
      match.rules.push([...rules].join(' and '));
    } else {
      match.rules.push('true');
    }

    output.set(vector, match);
  } else if (Array.isArray(node)) {
    // for now, just use the first one
    // since we do not actually check the existing files
    // this could be a setting, "show fallbacks? T/F"

    traverseExports({
      ...context,
      node: node[0],
    });
  } else {
    const skipConditions = new Set<string>();
    // is object
    for (const [key, value] of Object.entries(node ?? {})) {
      if (key.startsWith('.')) {
        // is a path
        traverseExports({
          ...context,
          node: value,
          path: key,
        });
      } else {
        // is a condition
        traverseExports({
          ...context,
          node: value,
          rules: new Set([
            ...rules,
            ...skipConditions,
            ...(key === 'default' ? [] : [key]),
          ]),
        });

        // the next item in the array does not support this condition
        skipConditions.add(`not(${key})`);
      }
    }
  }
};

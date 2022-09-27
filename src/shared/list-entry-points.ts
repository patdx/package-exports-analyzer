// type Export = ExportsObject | ExportsList | ExportsList
// type ExportsObject = Record<string, Export>;
// type ExportsList = Array<Export>;
// type ExportPath = string;

import { IPackageJson } from './types';

export type EntryPoints = Map<string, string>;

export const listEntryPoints = (
  pkg?: IPackageJson,
  conditions?: Set<string>
): EntryPoints => {
  const entryPoints: EntryPoints = new Map();

  if (!pkg || !pkg.exports) {
    return entryPoints;
  }

  const { exports } = pkg;

  traverseExports(exports, {
    conditions,
    entryPoints,
    path: '.',
  });

  return entryPoints;
};

interface TraverseContext {
  conditions?: Set<string>;
  entryPoints: EntryPoints;
  path: string;
}

const traverseExports = (
  obj: string | Array<any> | Record<string, any>,
  context: TraverseContext
): void => {
  if (typeof obj === 'string') {
    if (context.entryPoints.has(context.path)) {
      console.log(`path ${context.path} already resolved, skipping ${obj}`);
      return;
    }
    context.entryPoints.set(context.path, obj);
  } else if (Array.isArray(obj)) {
    // for now, just use the first one
    // since we do not actually check the existing files
    // this could be a setting, "show fallbacks? T/F"
    traverseExports(obj[0], context);
    // for (const element of obj) {
    //   traverseExports(element, conditionNames);
    // }
  } else {
    // is object
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('.')) {
        // is a path
        traverseExports(value, {
          ...context,
          path: key,
        });
      } else {
        // is a condition
        if (context.conditions?.has(key)) {
          traverseExports(value, context);
        }
      }
    }
  }
};

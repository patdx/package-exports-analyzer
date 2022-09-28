// type Export = ExportsObject | ExportsList | ExportsList
// type ExportsObject = Record<string, Export>;
// type ExportsList = Array<Export>;
// type ExportPath = string;

import { IPackageJson } from './types';
import pick from 'lodash/pick';

export type ResolvedExportMap = Map<string, string>;

export type EntryPointResult = {
  exports?: Record<string, string>;
} & Record<string, any>;

export const listEntryPoints = (
  pkg?: IPackageJson,
  conditions?: Set<string>
): EntryPointResult => {
  if (!pkg) {
    return {
      exports: {},
    };
  }

  const result: EntryPointResult = {};

  const { exports } = pkg;

  if (exports) {
    const resolvedExports: ResolvedExportMap = new Map();

    traverseExports(exports, {
      conditions,
      resolvedExports,
      path: '.',
    });

    // because the "exports" map almost always takes priority,
    // as long as the key existed in the original package json,
    // definitely show it here, even if it is empty due
    // to not having any matches for the given conditions
    result.exports = Object.fromEntries(resolvedExports);
  }

  if (!exports) {
    // In general, other conditions in package.json seem to be intended to
    // only be resolved when the `exports` map is not available.
    // This is documented very clearly for Typescript

    // Also, I'm not really sure how to decide when to show these or not.
    // Right now I am checking if it is in the export condition list, but
    // really it is a higher level "target" that should determine the export
    // conditions and other properties that may be referenced.
    if (conditions?.has('types')) {
      Object.assign(result, pick(pkg, ['types', 'typings', 'typesVersions']));
    }

    if (conditions?.has('node')) {
      Object.assign(result, pick(pkg, ['main']));
    }

    if (conditions?.has('module')) {
      Object.assign(result, pick(pkg, ['module']));
    }

    if (conditions?.has('deno')) {
      // TODO: this seems to be for separate publishing, maybe not necessary
      Object.assign(result, pick(pkg, ['denoify']));
    }

    if (conditions?.has('react-native')) {
      // not sure how react-native works but seems to be present in some packages
      Object.assign(result, pick(pkg, ['react-native']));
    }
  }

  if (conditions?.has('browser')) {
    // browser is special property that may sometimes supersede exports map (?)
    // depending on the implementation. will show always instead of just when no "exports"
    // map is present.
    Object.assign(result, pick(pkg, ['browser']));
  }

  return result;
};

interface TraverseContext {
  conditions?: Set<string>;
  resolvedExports: ResolvedExportMap;
  path: string;
}

const traverseExports = (
  obj: string | Array<any> | Record<string, any>,
  context: TraverseContext
): void => {
  if (typeof obj === 'string') {
    if (context.resolvedExports.has(context.path)) {
      console.log(`path ${context.path} already resolved, skipping ${obj}`);
      return;
    }
    context.resolvedExports.set(context.path, obj);
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
    for (const [key, value] of Object.entries(obj ?? {})) {
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
        } else if (
          context.conditions?.has('types') &&
          key.startsWith('types@')
        ) {
          // versioned type key, like {exports: {'./': {'types@4.7.0-beta': './lib/index.d.ts'}}}
          // https://github.com/microsoft/TypeScript/issues/48369#issuecomment-1110920451
          // TODO: basically this logic would just pick the first matching types version
          // though I think it would be better to just leave it as an unresolved object
          // unless a typescript version is selected
          traverseExports(value, context);
        }
      }
    }
  }
};

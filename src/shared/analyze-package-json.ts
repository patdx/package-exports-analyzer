// type Export = ExportsObject | ExportsList | ExportsList
// type ExportsObject = Record<string, Export>;
// type ExportsList = Array<Export>;
// type ExportPath = string;

import { IPackageJson } from './types';

export interface PackageJsonInfo {
  conditionNames: string[];
}

export const analyzePackageJson = (pkg?: IPackageJson): PackageJsonInfo => {
  if (!pkg)
    return {
      conditionNames: [],
    };

  const { exports } = pkg;

  if (!exports)
    return {
      conditionNames: [],
    };

  const conditionNames = new Set<string>();

  traverseExports(exports, conditionNames);

  return {
    conditionNames: Array.from(conditionNames),
  };
};

const traverseExports = (
  obj: string | Array<any> | Record<string, any>,
  conditionNames: Set<string>
): void => {
  if (typeof obj === 'string') {
    // do nothing, the end
  } else if (Array.isArray(obj)) {
    for (const element of obj) {
      traverseExports(element, conditionNames);
    }
  } else {
    // is object
    for (const [key, value] of Object.entries(obj)) {
      if (!key.startsWith('.')) {
        conditionNames.add(key);
      }
      traverseExports(value, conditionNames);
    }
  }
};

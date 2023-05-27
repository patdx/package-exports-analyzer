import { FC, useEffect } from 'react';
import clsx from 'clsx';
import { create } from 'zustand';
import { listEntryPoints } from '../shared/list-entry-points';
import { IPackageJson } from '../shared/types';
import { Card } from './card';
import { Button } from './button';
import { useRouter } from 'next/router';

interface SelectedConditions {
  preset?: string;
  selected: Set<string>;
  toggle: (name: string) => void;
  applyPreset: (name: string) => void;
}

const KNOWN_CONDITONS_SETS: string[][] = [
  ['import', 'require'],
  ['browser', 'node'],
  ['production', 'development'],
  ['module'],
  ['worker', 'electron', 'worklet'],
  ['react-native'],
  ['types'],
  ['deno'],
  ['solid'],
  // ['node-addons'],
  ['default'],
];

const PRESETS: Record<
  string,
  {
    title?: string;
    conditions: string[];
  }
> = {
  webpack: {
    title: 'Webpack, etc',
    conditions: ['import', 'browser', 'module', 'default'],
  },
  'node-esm': {
    title: 'Node ESM',
    conditions: ['node', 'import', 'default'],
  },
  'node-classic': {
    title: 'Node CJS',
    conditions: ['node', 'require', 'default'],
  },
  deno: {
    // https://github.com/denoland/deno/blob/716005a0d4afd1042fa75d8bdc32fd13e9ebe95f/ext/node/resolution.rs
    title: 'Deno',
    conditions: ['deno', 'node', 'import', 'default'],
  },
  cloudflare: {
    // https://github.com/cloudflare/wrangler2/issues/84
    title: 'Cloudflare Workers',
    conditions: ['import', 'worker', 'browser', 'default'],
    // Note: while a "module" condition also exists, it does not seem to be set by esbuild
    // automatically which is used in Wrangler2:
    // https://github.com/evanw/esbuild/blob/3e2374cb011a47482b415f84716afa13ea88f3ce/internal/resolver/resolver.go
    // however, esbuild may fall back to packageJson.module or packageJson.browser when
    // the packageJson.exports does not exist. So technically need some way to allow resolution
    // via packageJson.module without enabling export condition "module".
  },
  'typescript-esm': {
    // https://github.com/microsoft/TypeScript/blob/63791f52d4e7a3bf461b974e94abd8cbb6b546c5/src/compiler/moduleNameResolver.ts#L370
    title: 'Typescript ESM',
    conditions: ['node', 'import', 'types', 'default'],
  },
  'typescript-cjs': {
    // https://github.com/microsoft/TypeScript/blob/63791f52d4e7a3bf461b974e94abd8cbb6b546c5/src/compiler/moduleNameResolver.ts#L370
    title: 'Typescript CJS',
    conditions: ['node', 'require', 'types', 'default'],
  },
  // Other:
  // esm.sh target for deno https://github.com/ije/esm.sh/blob/049c2ba89ad59dfcdddbc5d31c9900b562a11dc0/server/nodejs.go#L438
};

const useSelectedConditions = create<SelectedConditions>((set, get) => ({
  preset: 'webpack',
  selected: new Set(PRESETS['webpack'].conditions),
  toggle: function (name) {
    const selected = new Set(get().selected);
    if (selected.has(name)) {
      selected.delete(name);
    } else {
      selected.add(name);

      const mutuallyExclusiveConditions = KNOWN_CONDITONS_SETS.find((set) =>
        set.includes(name)
      );
      if (mutuallyExclusiveConditions) {
        for (const excludeName of mutuallyExclusiveConditions) {
          if (excludeName !== name) {
            selected.delete(excludeName);
          }
        }
      }
    }
    set({
      selected,
      preset: undefined,
    });
  },
  applyPreset: (name) => {
    const preset = PRESETS[name];
    if (!preset) return;
    set({
      selected: new Set(preset.conditions),
      preset: name,
    });
  },
}));

interface ConditionGroup {
  all: string[];
  used: string[];
}

const sortIntoGroups = (names?: string[]): ConditionGroup[] => {
  const nameSet = new Set(names);

  const startGroups: ConditionGroup[] = [];
  const endGroups: ConditionGroup[] = [];

  for (const knownConditionSet of KNOWN_CONDITONS_SETS) {
    const result: ConditionGroup = {
      all: knownConditionSet,
      used: [],
    };
    for (const candidate of knownConditionSet) {
      if (nameSet.has(candidate)) {
        nameSet.delete(candidate);
        result.used.push(candidate);
      }
    }
    if (knownConditionSet[0] === 'default') {
      // put "default at the end"
      endGroups.push(result);
    } else {
      startGroups.push(result);
    }
  }

  for (const condition of nameSet) {
    startGroups.push({
      all: [condition],
      used: [condition],
    });
  }

  return [...startGroups, ...endGroups];
};

export const UsedConditions: FC<{
  conditionNames?: string[];
  pkg?: IPackageJson;
}> = (props) => {
  const groups = sortIntoGroups(props.conditionNames);

  const selected = useSelectedConditions();

  const router = useRouter();

  const preset = router.query.preset as string | undefined;

  useEffect(() => {
    if (preset) {
      selected.applyPreset(preset);
    }
  }, [preset]);

  const entryPoints = listEntryPoints(props.pkg, selected.selected);

  const warnings: string[] = [];

  if (!selected.selected.has('default')) {
    warnings.push(
      `Deselecting 'default' may lead to strange results because this is the standard fallback condition.`
    );
  }

  return (
    <>
      <Card title="Selected conditions" className="flex flex-col gap-2">
        <div className="rounded bg-yellow-100 p-1">
          <div>Presets</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESETS).map(([key, value]) => (
              <Button
                key={key}
                onClick={() => selected.applyPreset(key)}
                className={selected.preset === key ? 'font-bold' : undefined}
              >
                {value.title}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {groups.map((group) => (
            <div className="flex flex-none flex-col items-center gap-1">
              {group.all.map((name) => (
                <button
                  type="button"
                  onClick={() => selected.toggle(name)}
                  className={clsx(
                    'rounded-full p-1 transition',
                    group.used.includes(name)
                      ? 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400'
                      : 'bg-gray-100 text-gray-500 line-through',
                    selected.selected.has(name) &&
                      '!bg-blue-500 font-bold !text-white'
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
          ))}
        </div>

        {warnings.length >= 1 && (
          <div className="mt-2 flex flex-col gap-4">
            {warnings.map((warning) => (
              <div className="rounded border border-red-600 bg-red-200 p-1">
                {warning}
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card title="Available exports for selected conditions">
        <pre>{JSON.stringify(entryPoints, undefined, 2)}</pre>
      </Card>
    </>
  );
};

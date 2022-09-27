import { FC, useEffect } from 'react';
import clsx from 'clsx';
import create from 'zustand';
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
  ['default'],
  ['types'],
  ['deno'],
  ['solid'],
  // ['node-addons'],
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
  'node-classic': {
    title: 'Node Classic',
    conditions: ['node', 'require', 'default'],
  },
  'node-es': {
    title: 'Node ES Modules',
    conditions: ['node', 'import', 'default'],
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
  },
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
    });
  },
  applyPreset: (name) => {
    const preset = PRESETS[name];
    if (!preset) return;
    set({
      selected: new Set(preset.conditions),
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
      <Card title="Selected conditions">
        <div className="flex items-center gap-4">
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
          <div className="flex-1 rounded bg-yellow-100 p-1">
            <div>Presets</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRESETS).map(([key, value]) => (
                <Button key={key} onClick={() => selected.applyPreset(key)}>
                  {value.title}
                </Button>
              ))}
            </div>
          </div>
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
        <pre>
          {JSON.stringify(Object.fromEntries(entryPoints), undefined, 2)}
        </pre>
      </Card>
    </>
  );
};

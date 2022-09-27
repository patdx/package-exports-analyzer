import Link from 'next/link';
import { FC } from 'react';
import { IPackageJson } from '../shared/types';
import { Card } from './card';

export const Dependencies: FC<{
  pkg?: IPackageJson;
}> = ({ pkg }) => {
  const all = {
    ...(pkg?.dependencies ?? {}),
    ...(pkg?.devDependencies ?? {}),
  };

  return (
    <Card title="Dependencies">
      <ul className="list-inside list-disc">
        {Object.entries(all).map(([packageName, version]) => {
          const specifier = `${packageName}@${version}`;

          return (
            <li>
              <Link href={`/${specifier}`}>{specifier}</Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

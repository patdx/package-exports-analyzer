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
        <DependenciesList list={pkg?.dependencies} />
        <DependenciesList list={pkg?.devDependencies} isDev={true} />
      </ul>
    </Card>
  );
};

const DependenciesList: FC<{
  list?: Record<string, string>;
  isDev?: boolean;
}> = (props) => {
  return (
    <>
      {Object.entries(props.list ?? {}).map(([packageName, version]) => {
        let specifier = `${packageName}@${version}`;
        if (props.isDev) {
          specifier += ' (devDependencies)';
        }

        return (
          <li>
            <Link href={`/${specifier}`}>{specifier}</Link>
          </li>
        );
      })}
    </>
  );
};

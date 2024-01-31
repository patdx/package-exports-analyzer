import Link from 'next/link';
import { FC } from 'react';
import { usePackageInfoForPage } from '../shared/load-package';
import { IPackageJson } from '../shared/types';
import { Card } from './card';

export const Dependencies: FC<{
  pkg?: IPackageJson;
}> = (props) => {
  const info = usePackageInfoForPage();

  const pkg = info.rootPackageJson.data;

  const all = {
    ...(pkg?.dependencies ?? {}),
    ...(pkg?.devDependencies ?? {}),
  };

  // if (Object.keys(all).length === 0) return null;

  return (
    <Card title={`Dependencies of '${info.parsed?.name}'`}>
      {Object.keys(all).length === 0 ? (
        '(none)'
      ) : (
        <ul className="list-inside list-disc">
          <DependenciesList list={pkg?.dependencies} />
          <DependenciesList list={pkg?.devDependencies} isDev={true} />
        </ul>
      )}
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
        const specifier = `${packageName}@${version}`;

        const text = props.isDev ? `${specifier} (dev)` : specifier;

        return (
          <li
            key={specifier}
            className={props.isDev ? 'text-gray-500' : undefined}
          >
            <Link href={`/${specifier}`}>{text}</Link>
          </li>
        );
      })}
    </>
  );
};

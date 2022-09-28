// could be a string like
// @tanstack/react-query@4.7.1/my-subdir

import { QueryFunction, useQueries, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { IPackageJson } from './types';

interface ParsedPackageQuery {
  name: string;
  version?: string;
  nameWithVersion: string;
  // undefined or path starting with "/"
  path?: string;
}

type UnpkgMeta = {
  /** absolute path starting with strnig */
  path: string;
  type: 'file' | 'directory';
  contentType?: string;
  files?: UnpkgMeta[];
};

const flattenFileList = (meta?: UnpkgMeta): string[] => {
  const files: string[] = [];

  if (meta?.type === 'file') {
    files.push(meta.path);
  } else if (meta?.type === 'directory') {
    for (const file of meta.files ?? []) {
      files.push(...flattenFileList(file));
    }
  }

  return files;
};

const parsePackageQuery = (packageQuery?: string) => {
  if (!packageQuery) return;
  const isScoped = packageQuery.startsWith('@');
  const segment = packageQuery.split('/');

  let name: string;
  let version: string;

  if (isScoped) {
    const one = segment.shift();
    const two = segment.shift()!.split('@');
    name = `${one}/${two[0]}`;
    version = two[1];
  } else {
    const one = segment.shift()!.split('@');
    name = one[0];
    version = one[1];
  }

  const path = segment.length >= 1 ? `/${segment.join('/')}` : undefined;

  const nameWithVersion = version ? `${name}@${version}` : name;

  const result: ParsedPackageQuery = {
    name,
    version,
    nameWithVersion,
    path,
  };

  return result;
};

const fetchJson: QueryFunction = async (props) => {
  const url = props.queryKey[0] as string;
  const result = await fetch(url).then((res) => res.json());
  return result;
};

export const usePackageInfo = (packageQuery?: string) => {
  const parsed = parsePackageQuery(packageQuery);

  // const rootPackageJson = parsed
  //   ? `${nameWithVersion}/package.json`
  //   : undefined;

  const rootPackageJson = useQuery(
    [`https://unpkg.com/${parsed?.nameWithVersion}/package.json`],
    fetchJson as QueryFunction<IPackageJson>,
    {
      enabled: Boolean(parsed),
    }
  );

  const meta = useQuery(
    [`https://unpkg.com/${parsed?.nameWithVersion}/?meta`],
    fetchJson as QueryFunction<UnpkgMeta>,
    {
      enabled: Boolean(parsed),
    }
  );

  const path = useQuery(
    [
      `https://unpkg.com/${parsed?.nameWithVersion}${parsed?.path}/package.json`,
    ],
    fetchJson,
    {
      enabled: Boolean(parsed?.path),
    }
  );

  const requestedPath = parsed?.path ? path : rootPackageJson;

  const files = flattenFileList(meta.data);

  const result = {
    parsed,
    rootPackageJson,
    meta,
    requestedPath,
    files,
  };

  return result;
};

export const usePackageInfoForPage = () => {
  const router = useRouter();

  const query = (router.query.slug as string[])?.join('/');

  const info = usePackageInfo(query);

  return info;
};

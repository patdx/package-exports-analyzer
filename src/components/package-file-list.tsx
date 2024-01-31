import Link from 'next/link';
import { usePackageInfoForPage } from '../shared/load-package';
import { Card } from './card';

export const PackageFileList = () => {
  const info = usePackageInfoForPage();

  const allPackageJsons = info.files.filter((file) =>
    file.endsWith('package.json'),
  );

  // if (allPackageJsons.length <= 1) return null;

  return (
    <Card title={`Package manifests in '${info.parsed?.name}'`}>
      <ul className="list-inside list-disc">
        {allPackageJsons.map((item) => (
          <li key={info.parsed?.nameWithVersion}>
            <Link
              href={`/${info.parsed?.nameWithVersion}/${item.replace(
                /package.json$/,
                '',
              )}`}
            >
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
};

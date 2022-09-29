import { usePackageInfoForPage } from '../shared/load-package';
import { simplifyExports } from '../shared/simplify-exports';
import { Card } from './card';

export const SimplifiedExports = () => {
  const info = usePackageInfoForPage();

  const simplified = simplifyExports(info.requestedPath.data?.exports);

  return (
    <Card title="Simplified exports (experimental)">
      <pre className=" whitespace-pre-wrap">
        {JSON.stringify(simplified, undefined, 2)}
      </pre>
    </Card>
  );
};

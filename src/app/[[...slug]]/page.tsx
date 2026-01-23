import PageClient from './page-client';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ slug: [] }];
}

export default function Page() {
  return <PageClient />;
}

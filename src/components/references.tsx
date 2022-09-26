import { FC } from 'react';

type IReference =
  | { type: 'url'; href: string }
  | { type: 'npm'; package: string };

const REFERENCES: Array<IReference> = [
  { type: 'url', href: 'https://webpack.js.org/guides/package-exports/' },
  {
    type: 'url',
    href: 'https://nodejs.org/api/packages.html#conditional-exports',
  },
  { type: 'npm', package: 'resolve.exports' },
];

const Reference: FC<IReference> = (props) => {
  if (props.type === 'url') {
    return <a href={props.href}>{props.href}</a>;
  } else if (props.type === 'npm') {
    return (
      <a href={`https://www.npmjs.com/package/${props.package}`}>
        {props.package}
      </a>
    );
  } else {
    return null;
  }
};

export const References: FC = () => {
  return (
    <>
      <h4>References</h4>
      <ul className="list-disc list-inside">
        {REFERENCES.map((reference, index) => (
          <li key={index}>
            <Reference {...reference} />
          </li>
        ))}
      </ul>
    </>
  );
};

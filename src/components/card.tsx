import { FC, ReactNode } from 'react';

export const Card: FC<{
  title?: ReactNode;
  children?: ReactNode;
}> = (props) => {
  return (
    <div className="p-1">
      <div className="overflow-hidden rounded border">
        <div className="bg-gray-100 p-1 font-bold">{props.title}</div>
        <div className="p-1">{props.children}</div>
      </div>
    </div>
  );
};

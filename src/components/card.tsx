import { FC, ReactNode } from 'react';
import clsx from 'clsx';

export const Card: FC<{
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}> = (props) => {
  return (
    <div className="p-1">
      <div className="overflow-hidden rounded border">
        <div className="bg-gray-100 p-1 font-bold">{props.title}</div>
        <div className={clsx('p-3', props.className)}>{props.children}</div>
      </div>
    </div>
  );
};

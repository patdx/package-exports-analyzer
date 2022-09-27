import { FC } from 'react';
import clsx from 'clsx';

export const Button: FC<
  Pick<React.HTMLProps<HTMLButtonElement>, 'onClick' | 'children' | 'className'>
> = (props) => {
  return (
    <button
      type="button"
      className={clsx(
        'rounded border bg-white p-1 hover:bg-gray-200 active:bg-gray-300',
        props.className
      )}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

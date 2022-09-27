import { FC } from 'react';

export const Button: FC<
  Pick<React.HTMLProps<HTMLButtonElement>, 'onClick' | 'children'>
> = (props) => {
  return (
    <button
      type="button"
      className="rounded border bg-white p-1 hover:bg-gray-200 active:bg-gray-300"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

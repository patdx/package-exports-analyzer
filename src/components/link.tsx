import type { AnchorHTMLAttributes, MouseEvent, PropsWithChildren } from 'react';
import { navigate } from '../shared/router';

type LinkProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }
>;

const isModifiedEvent = (event: MouseEvent<HTMLAnchorElement>) =>
  event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;

const isExternal = (href: string) =>
  href.startsWith('http://') ||
  href.startsWith('https://') ||
  href.startsWith('mailto:');

export const Link = ({ href, onClick, ...props }: LinkProps) => {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          isModifiedEvent(event) ||
          isExternal(href)
        ) {
          return;
        }
        event.preventDefault();
        navigate(href);
      }}
    />
  );
};

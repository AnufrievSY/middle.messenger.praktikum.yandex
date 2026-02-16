import { BlockProps } from '../../core/Block';

export type NavLinkProps = BlockProps & {
  href: string;
  label: string;
};

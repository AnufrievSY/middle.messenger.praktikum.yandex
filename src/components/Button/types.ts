import { BlockProps } from '../../core/Block';

export type ButtonProps = BlockProps & {
  label: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary';
};

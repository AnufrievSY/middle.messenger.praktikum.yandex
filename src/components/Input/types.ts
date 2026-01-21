import { BlockProps } from '../../core/Block';

export type InputProps = BlockProps & {
  name: string;
  label: string;
  type?: string;
  value?: string;
  placeholder?: string;
};

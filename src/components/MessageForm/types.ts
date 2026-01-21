import { BlockProps } from '../../core/Block';

export type MessageFormProps = BlockProps & {
  onSubmit?: (message: string) => void;
};

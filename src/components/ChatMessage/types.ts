import { BlockProps } from '../../core/Block';

export type ChatMessageProps = BlockProps & {
  text: string;
  time: string;
  isMine?: boolean;
};

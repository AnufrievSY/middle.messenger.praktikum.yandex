import { BlockProps } from '../../core/Block';
import { MessageStatus } from '../../services/chatService';

export type ChatMessageProps = BlockProps & {
  text: string;
  time: string;
  isMine?: boolean;
  status?: MessageStatus;
  author?: string;
  avatar?: string;
};

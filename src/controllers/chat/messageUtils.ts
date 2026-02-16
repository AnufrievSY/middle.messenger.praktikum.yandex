import { Message, MessageStatus } from '../../services/chatTypes';

export function mergeUniqueMessages(messages: Message[]): Message[] {
  const map = new Map<string, Message>();

  messages.forEach((message) => {
    const key = message.localId ?? String(message.id);
    map.set(key, message);
  });

  return [...map.values()].sort(
    (left, right) => new Date(left.time).getTime() - new Date(right.time).getTime(),
  );
}

export function replaceSendingMessage(messages: Message[], incomingMessage: Message): Message[] {
  const sendingIndex = messages.findIndex((message) => {
    const isOwnPendingMessage = message.status === 'sending' || message.status === 'sent';
    return isOwnPendingMessage && message.content === incomingMessage.content && message.localId;
  });

  if (sendingIndex === -1) {
    return [...messages, { ...incomingMessage, status: 'sent' }];
  }

  const updated = [...messages];
  const sendingMessage = updated[sendingIndex];

  updated[sendingIndex] = {
    ...incomingMessage,
    localId: sendingMessage.localId,
    status: 'sent',
  };

  return updated;
}

export function applyDeliveredStatus(
  messages: Message[],
  localId: string,
  status: MessageStatus,
): Message[] {
  return messages.map((message) => {
    if (message.localId === localId) {
      return {
        ...message,
        status,
      };
    }

    return message;
  });
}

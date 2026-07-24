import {
  SEED_MESSAGES,
  generateMessageId,
  type Message,
  type MessageSender,
} from "@/lib/mock-data";
import { messagesKey, readJSON, writeJSON } from "@/lib/storage";

export function getMessages(clientId: string): Message[] {
  return readJSON(messagesKey(clientId), SEED_MESSAGES[clientId] ?? []);
}

export function appendMessage(
  clientId: string,
  sender: MessageSender,
  text: string
): Message[] {
  const next: Message[] = [
    ...getMessages(clientId),
    {
      id: generateMessageId(),
      clientId,
      sender,
      text,
      createdAt: new Date().toISOString(),
    },
  ];
  writeJSON(messagesKey(clientId), next);
  return next;
}

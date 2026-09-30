import { Chat } from "chat";
import { createSlackAdapter } from "@chat-adapter/slack";
import { createMemoryState } from "@chat-adapter/state-memory";
import { teachingAssistant } from "./mastra/agents/teaching-assistant";

export const bot = new Chat({
  userName: "meeting-assistant",
  adapters: {
    slack: createSlackAdapter(),
  },
  // In memory for local dev storage
  // move to redis backed in a prod deployment
  // @chat-adapter/state-redis
  state: createMemoryState(),
});

bot.onNewMention(async (thread, message) => {
  await thread.subscribe();
  await thread.startTyping();

  // Pass memory context so the agent remembers this conversation
  // thread: scopes messages to this specific Slack thread
  // resource: scopes to the channel (shared context across threads)
  const result = await teachingAssistant.generate(message.text, {
    memory: {
      thread: thread.id,
      // Fixed resource ID so working memory (your profile) is shared
      // across all channels, not isolated per channel
     // resource: "user",
      resource: thread.channelId,
    },
  });
  await thread.post(result.text);
});

bot.onSubscribedMessage(async (thread, message) => {
  await thread.startTyping();

  const result = await teachingAssistant.generate(message.text, {
    memory: {
      thread: thread.id,
      // Fixed resource ID so working memory (your profile) is shared
      // across all channels, not isolated per channel
      // resource: "user",
      resource: thread.channelId,
    },
  });
  await thread.post(result.text);
});
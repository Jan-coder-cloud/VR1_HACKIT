import "server-only";

type TelegramSendResult = {
  success: boolean;
  attempted: number;
  sent: number;
  failedChatIds: string[];
};

async function sendOne(args: { token: string; chatId: string; message: string }) {
  const response = await fetch(`https://api.telegram.org/bot${args.token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: args.chatId,
      text: args.message,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }),
  });

  return response.ok;
}

export async function sendTelegramMessages(args: {
  chatIds: string[];
  message: string;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN environment variable.");
  }

  const uniqueChatIds = Array.from(
    new Set(args.chatIds.map((id) => id.trim()).filter((id) => id.length > 0))
  );

  if (uniqueChatIds.length === 0) {
    return {
      success: false,
      attempted: 0,
      sent: 0,
      failedChatIds: [],
    } as TelegramSendResult;
  }

  let sent = 0;
  const failedChatIds: string[] = [];

  for (const chatId of uniqueChatIds) {
    const ok = await sendOne({ token, chatId, message: args.message });
    if (ok) {
      sent += 1;
    } else {
      failedChatIds.push(chatId);
    }
  }

  return {
    success: sent === uniqueChatIds.length,
    attempted: uniqueChatIds.length,
    sent,
    failedChatIds,
  } as TelegramSendResult;
}

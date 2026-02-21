import { NextResponse } from "next/server";
import { ChatFocus, generateBotResponse } from "../user-bot";

type UserBotRequest = {
  message?: string;
  chatFocus?: ChatFocus;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UserBotRequest;
    const message = body.message?.trim();
    const chatFocus = body.chatFocus ?? "overall";

    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const text = await generateBotResponse(message, chatFocus);
    return NextResponse.json({ text });
  } catch (error) {
    console.error("User bot route error:", error);
    return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
  }
}

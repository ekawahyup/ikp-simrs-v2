import { NextResponse } from 'next/server';

/**
 * Mock API for Telegram Bot integration.
 * In a real scenario, this would use `node-telegram-bot-api` or a simple fetch to the Telegram Bot API.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId, message } = body;

    if (!chatId || !message) {
      return NextResponse.json({ error: 'chatId and message are required' }, { status: 400 });
    }

    // Simulate network delay to Telegram API
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`[TELEGRAM MOCK] Sent to ${chatId}: ${message}`);

    return NextResponse.json({ 
      success: true, 
      deliveredTo: chatId,
      timestamp: new Date().toISOString() 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

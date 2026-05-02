import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { auth, clerkClient } from '@clerk/nextjs/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FREE_LIMIT = 3;

async function checkAndIncrementUsage(userId: string): Promise<{ allowed: boolean; count: number }> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const meta = (user.publicMetadata ?? {}) as { chatCount?: number; chatDate?: string };
  const today = new Date().toISOString().split('T')[0];
  const isPro = (user.publicMetadata as { isPro?: boolean }).isPro === true;

  if (isPro) return { allowed: true, count: 0 };

  const count = meta.chatDate === today ? (meta.chatCount ?? 0) : 0;
  if (count >= FREE_LIMIT) return { allowed: false, count };

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { ...user.publicMetadata, chatCount: count + 1, chatDate: today },
  });
  return { allowed: true, count: count + 1 };
}

export async function POST(req: NextRequest) {
  try {
    const { text, messages, mode } = await req.json() as {
      text: string;
      messages: { role: 'user' | 'assistant'; content: string }[];
      mode: 'summary' | 'chat';
    };

    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: 'Document text is too short.' }, { status: 400 });
    }

    // Usage gate — only count on non-summary mode (summary is free, chat is gated)
    if (mode === 'chat') {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json(
          { error: 'Sign in to chat with documents. It\'s free — 3 chats/day.' },
          { status: 401 }
        );
      }
      const { allowed } = await checkAndIncrementUsage(userId);
      if (!allowed) {
        return NextResponse.json(
          { error: 'Daily limit reached (3 chats/day on free plan). Upgrade to Pro for unlimited chats.' },
          { status: 429 }
        );
      }
    }

    const systemPrompt = `You are a helpful document assistant. The user has uploaded a document. Here is the full document text:

<document>
${text.slice(0, 180000)}
</document>

${mode === 'summary'
  ? 'Provide a concise summary of this document. Include: 1) A 2-3 sentence overview, 2) 5 key points as bullet points, 3) Three suggested follow-up questions the user might want to ask.'
  : 'Answer the user\'s questions about this document accurately and concisely. Base your answers only on the document content. If something is not in the document, say so clearly.'
}`;

    const stream = await client.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: mode === 'summary'
        ? [{ role: 'user', content: 'Please summarize this document.' }]
        : messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'AI request failed. Check your API key.' }, { status: 500 });
  }
}

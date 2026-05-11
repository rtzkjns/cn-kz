import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic()

type IncomingMessage =
  | { role: 'user' | 'assistant'; content: string }
  | { role: 'user' | 'assistant'; text: string }

export async function POST(req: NextRequest) {
  const { messages, context } = (await req.json()) as {
    messages?: IncomingMessage[]
    context?: string
  }

  const normalizedMessages =
    messages?.map((m) => ({
      role: m.role,
      content: 'content' in m ? m.content : m.text,
    })) ?? []

  const systemPrompt = `You are an expert on Michael Jackson — his life, music, and legacy. Answer questions about him accurately and concisely.

Rules:
- Keep answers short and direct. 2-4 sentences max unless the question requires more.
- Speak in third person about Michael, not as him.
- No dramatic language or poetry. Just clear, interesting facts.
- If asked for opinions, share what Michael himself said in interviews.

${context ? `Additional context:\n\n${context}` : ''}`

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: normalizedMessages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on('text', (delta) => { controller.enqueue(encoder.encode(delta)) })
      stream.on('error', (err) => { controller.error(err) })
      stream.on('end', () => { controller.close() })
    },
    cancel() { stream.abort() },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

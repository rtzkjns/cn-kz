import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic()

type IncomingMessage =
  | { role: 'user' | 'assistant'; content: string }
  | { role: 'user' | 'assistant'; text: string }

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages?: IncomingMessage[] }

  const normalizedMessages =
    messages?.map((m) => ({
      role: m.role,
      content: 'content' in m ? m.content : m.text,
    })) ?? []

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: 'Ты полезный AI ассистент. Отвечай чётко и по делу.',
    messages: normalizedMessages,
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on('text', (delta) => {
        controller.enqueue(encoder.encode(delta))
      })
      stream.on('error', (err) => {
        controller.error(err)
      })
      stream.on('abort', (err) => {
        controller.error(err)
      })
      stream.on('end', () => {
        controller.close()
      })
    },
    cancel() {
      stream.abort()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
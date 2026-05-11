import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import pdf from 'pdf-parse'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function chunkText(text: string, size = 500, overlap = 50): string[] {
  const chunks: string[] = []
  let i = 0
  while (i < text.length) {
    chunks.push(text.slice(i, i + size))
    i += size - overlap
  }
  return chunks
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const userId = formData.get('userId') as string

  if (!file || !userId) {
    return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  let text = ''

  if (file.type === 'application/pdf') {
    const parsed = await pdf(buffer)
    text = parsed.text
  } else {
    text = buffer.toString('utf-8')
  }

  const { data: doc } = await supabase
    .from('documents')
    .insert([{ user_id: userId, name: file.name }])
    .select()
    .single()

  if (!doc) return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })

  const chunks = chunkText(text)

  for (const chunk of chunks) {
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunk,
    })
    const embedding = embeddingRes.data[0].embedding

    await supabase.from('chunks').insert([{
      document_id: doc.id,
      user_id: userId,
      content: chunk,
      embedding: JSON.stringify(embedding),
    }])
  }

  return NextResponse.json({ success: true, documentId: doc.id, chunks: chunks.length })
}

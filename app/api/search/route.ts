import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { query, userId, documentId } = await req.json()

  const embeddingRes = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  const embedding = embeddingRes.data[0].embedding

  const { data: chunks } = await supabase.rpc('match_chunks', {
    query_embedding: embedding,
    match_user_id: userId,
    match_document_id: documentId || null,
    match_count: 5,
  })

  return NextResponse.json({ chunks: chunks || [] })
}

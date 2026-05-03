import Anthropic from '@anthropic-ai/sdk'                                                                                                                                                                          
  import { NextRequest, NextResponse } from 'next/server'                                                                                                                                                            
                                                                                                                                                                                                                     
  const client = new Anthropic()
                                                                                                                                                                                                                     
  export async function POST(req: NextRequest) {
    const { message } = await req.json()

    const response = await client.messages.create({                                                                                                                                                                  
      model: 'claude-opus-4-6',
      max_tokens: 1024,                                                                                                                                                                                              
      messages: [{ role: 'user', content: message }],
    })                                                                                                                                                                                                               
   
    return NextResponse.json({                                                                                                                                                                                       
      reply: response.content[0].type === 'text' ? response.content[0].text : ''
    })
  }
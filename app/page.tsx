'use client'                                                                                                                                                                                                       
   
  import { useState } from 'react'                                                                                                                                                                                   
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'                                                                                                                                                                      
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
                                                                                                                                                                                                                     
  export default function Home() {
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<{role: string, text: string}[]>([])
    const [loading, setLoading] = useState(false)                                                                                                                                                                    
   
    async function sendMessage() {                                                                                                                                                                                   
      if (!message.trim()) return
      const userMessage = message                                                                                                                                                                                    
      setMessages(prev => [...prev, { role: 'user', text: userMessage }])
      setMessage('')                                                                                                                                                                                                 
      setLoading(true)
                                                                                                                                                                                                                     
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      })                                                                                                                                                                                                             
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }])                                                                                                                                               
      setLoading(false)
    }                                                                                                                                                                                                                
   
    return (                                                                                                                                                                                                         
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>                                                                                                                                                                                               
            <CardTitle>AI Chat</CardTitle>
          </CardHeader>                                                                                                                                                                                              
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 min-h-[300px] max-h-[400px] overflow-y-auto">
              {messages.map((msg, i) => (                                                                                                                                                                            
                <div key={i} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'} max-w-[80%]`}>                                                            
                  {msg.text}                                                                                                                                                                                         
                </div>                                                                                                                                                                                               
              ))}                                                                                                                                                                                                    
              {loading && <div className="bg-muted p-3 rounded-lg max-w-[80%]">Думаю...</div>}
            </div>                                                                                                                                                                                                   
            <div className="flex gap-2">
              <Input                                                                                                                                                                                                 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}                                                                                                                                                
                placeholder="Напиши сообщение..."
              />                                                                                                                                                                                                     
              <Button onClick={sendMessage} disabled={loading}>
                Отправить                                                                                                                                                                                            
              </Button>
            </div>                                                                                                                                                                                                   
          </CardContent>
        </Card>
      </div>
    )
  }

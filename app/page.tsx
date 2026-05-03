'use client'                                                                                                                                                                                                       
                                                                                                                                                                                                                     
  import { useState } from 'react'                                                                                                                                                                                   
                  
  export default function Home() {
    const [message, setMessage] = useState('')
    const [reply, setReply] = useState('')
    const [loading, setLoading] = useState(false)                                                                                                                                                                    
   
    async function sendMessage() {                                                                                                                                                                                   
      setLoading(true)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      setReply(data.reply)
      setLoading(false)                                                                                                                                                                                              
    }
                                                                                                                                                                                                                     
    return (      
      <div style={{ padding: '40px', maxWidth: '600px' }}>
        <h1>AI Chat</h1>                                                                                                                                                                                             
        <textarea
          value={message}                                                                                                                                                                                            
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Напиши сообщение..."
          rows={4}                                                                                                                                                                                                   
          style={{ width: '100%', marginBottom: '10px' }}
        />                                                                                                                                                                                                           
        <br />    
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Думаю...' : 'Отправить'}                                                                                                                                                                       
        </button>
        {reply && (                                                                                                                                                                                                  
          <div style={{ marginTop: '20px', padding: '20px', background: '#f0f0f0' }}>
            {reply}                                                                                                                                                                                                  
          </div>
        )}                                                                                                                                                                                                           
      </div>      
    )
  }

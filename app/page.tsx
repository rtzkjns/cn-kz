'use client'                                                                                                                                                                                                       
   import ReactMarkdown from 'react-markdown'
  import { useState, useRef, useEffect } from 'react'                                                                                                                                                                
                  
  function GlitchBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
                                                                                                                                                                                                                     
    useEffect(() => {
      const canvas = canvasRef.current                                                                                                                                                                               
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
                                                                                                                                                                                                                     
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight                                                                                                                                                                             
                  
      const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ█▓▒░'                                                                                                                                       
      const columns = Math.floor(canvas.width / 14)
      const drops: number[] = Array(columns).fill(0)                                                                                                                                                                 
                  
      let frame = 0                                                                                                                                                                                                  
                  
      const draw = () => {                                                                                                                                                                                           
        ctx.fillStyle = 'rgba(13, 17, 23, 0.05)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)                                                                                                                                                              
   
        frame++                                                                                                                                                                                                      
                  
        drops.forEach((y, i) => {
          const glitch = Math.random() > 0.95
          ctx.font = '13px monospace'                                                                                                                                                                                
                                                                                                                                                                                                                     
          if (glitch) {                                                                                                                                                                                              
            ctx.fillStyle = `rgba(255, 0, 60, ${Math.random() * 0.8})`                                                                                                                                               
          } else if (y < 3) {                                                                                                                                                                                        
            ctx.fillStyle = '#fff'
          } else {                                                                                                                                                                                                   
            const alpha = Math.random() * 0.5 + 0.1
            ctx.fillStyle = `rgba(0, 255, 100, ${alpha})`                                                                                                                                                            
          }       
                                                                                                                                                                                                                     
          const char = chars[Math.floor(Math.random() * chars.length)]                                                                                                                                               
          ctx.fillText(char, i * 14, y * 14)
                                                                                                                                                                                                                     
          if (y * 14 > canvas.height && Math.random() > 0.975) {                                                                                                                                                     
            drops[i] = 0
          } else {                                                                                                                                                                                                   
            drops[i]++
          }                                                                                                                                                                                                          
   
          // Glitch horizontal slice                                                                                                                                                                                 
          if (frame % 60 === 0 && Math.random() > 0.97) {
            ctx.fillStyle = `rgba(255, 0, 60, 0.03)`                                                                                                                                                                 
            const sliceY = Math.random() * canvas.height
            ctx.fillRect(0, sliceY, canvas.width, 2)                                                                                                                                                                 
          }       
        })                                                                                                                                                                                                           
      }                                                                                                                                                                                                              
   
      const interval = setInterval(draw, 40)                                                                                                                                                                         
      const resize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight                                                                                                                                                                           
      }
      window.addEventListener('resize', resize)                                                                                                                                                                      
                  
      return () => {
        clearInterval(interval)
        window.removeEventListener('resize', resize)
      }                                                                                                                                                                                                              
    }, [])
                                                                                                                                                                                                                     
    return (      
      <canvas ref={canvasRef} style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.4
      }} />                                                                                                                                                                                                          
    )
  }                                                                                                                                                                                                                  
                  
  export default function Home() {
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<{role: string, text: string}[]>([])
    const [loading, setLoading] = useState(false)                                                                                                                                                                    
    const bottomRef = useRef<HTMLDivElement>(null)
                                                                                                                                                                                                                     
    useEffect(() => {                                                                                                                                                                                                
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])                                                                                                                                                                                                   
                  
    async function sendMessage() {
      if (!message.trim()) return
      const userMessage = message
      const newMessages = [...messages, { role: 'user', text: userMessage }]
      setMessages(newMessages)
      setMessage('')
      setLoading(true)
  
      const history = newMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
  
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }])
      setLoading(false)
    }                                                                                                                                                                                                                
   
    return (                                                                                                                                                                                                         
      <div style={{
        minHeight: '100vh',
        background: '#0d1117',
        color: '#e6edf3',
        fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',                                                                                                                                     
        display: 'flex',                                                                                                                                                                                             
        flexDirection: 'column',                                                                                                                                                                                     
        alignItems: 'center',                                                                                                                                                                                        
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
      }}>                                                                                                                                                                                                            
        <GlitchBackground />
                                                                                                                                                                                                                     
        <div style={{ width: '100%', maxWidth: '720px', position: 'relative', zIndex: 1 }}>                                                                                                                          
   
          {/* Header */}                                                                                                                                                                                             
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#ff003c', letterSpacing: '4px', marginBottom: '6px' }}>                                                                                                          
              ▓▒░ SYSTEM BREACH ░▒▓                                                                                                                                                                                  
            </div>                                                                                                                                                                                                   
            <h1 style={{ margin: 0, fontSize: '22px', color: '#00ff64', textShadow: '0 0 20px #00ff64' }}>                                                                                                           
              GLITCH_AI.exe                                                                                                                                                                                          
            </h1>                                                                                                                                                                                                    
          </div>                                                                                                                                                                                                     
                                                                                                                                                                                                                     
          {/* Chat window */}
          <div style={{
            background: 'rgba(22, 27, 34, 0.85)',
            border: '1px solid #ff003c',                                                                                                                                                                             
            borderRadius: '4px',
            padding: '20px',                                                                                                                                                                                         
            minHeight: '360px',
            maxHeight: '460px',                                                                                                                                                                                      
            overflowY: 'auto',                                                                                                                                                                                       
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 30px rgba(255, 0, 60, 0.15), inset 0 0 30px rgba(0,0,0,0.3)',                                                                                                                            
            display: 'flex',                                                                                                                                                                                         
            flexDirection: 'column',
            gap: '16px',                                                                                                                                                                                             
          }}>     
            {messages.length === 0 && (
              <span style={{ color: '#484f58', fontSize: '13px' }}>                                                                                                                                                  
                {'>'} initializing connection...
              </span>                                                                                                                                                                                                
            )}    
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: msg.role === 'user' ? '#ff003c' : '#00ff64' }}>                                                                                                              
                  {msg.role === 'user' ? '▸ USER' : '▸ AI'}
                </span>                                                                                                                                                                                              
                <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#e6edf3' }}>                                                                                                                                            
    <ReactMarkdown>{msg.text}</ReactMarkdown>
  </div>

              </div>
            ))}
            {loading && (
              <div>
                <span style={{ fontSize: '11px', color: '#00ff64' }}>▸ AI</span>                                                                                                                                     
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#00ff64' }}>
                  decrypting...                                                                                                                                                                                      
                </p>
              </div>                                                                                                                                                                                                 
            )}    
            <div ref={bottomRef} />                                                                                                                                                                                  
          </div>  

          {/* Input */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <div style={{                                                                                                                                                                                            
              flex: 1,
              display: 'flex',                                                                                                                                                                                       
              alignItems: 'center',
              background: 'rgba(22, 27, 34, 0.85)',                                                                                                                                                                  
              border: '1px solid #30363d',
              borderRadius: '4px',                                                                                                                                                                                   
              padding: '0 12px',
              backdropFilter: 'blur(8px)',                                                                                                                                                                           
            }}>
              <span style={{ color: '#ff003c', marginRight: '8px' }}>{'>'}</span>                                                                                                                                    
              <input                                                                                                                                                                                                 
                value={message}
                onChange={(e) => setMessage(e.target.value)}                                                                                                                                                         
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="enter command..."                                                                                                                                                                       
                style={{
                  flex: 1,                                                                                                                                                                                           
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#e6edf3',                                                                                                                                                                                  
                  fontFamily: 'inherit',
                  fontSize: '14px',                                                                                                                                                                                  
                  padding: '12px 0',
                }}
              />
            </div>
            <button
              onClick={sendMessage}                                                                                                                                                                                  
              disabled={loading}
              style={{                                                                                                                                                                                               
                background: 'transparent',
                border: '1px solid #ff003c',
                borderRadius: '4px',
                color: loading ? '#484f58' : '#ff003c',
                fontFamily: 'inherit',
                fontSize: '13px',
                padding: '0 20px',
                cursor: loading ? 'not-allowed' : 'pointer',                                                                                                                                                         
                textShadow: loading ? 'none' : '0 0 10px #ff003c',
                boxShadow: loading ? 'none' : '0 0 10px rgba(255,0,60,0.2)',                                                                                                                                         
              }}                                                                                                                                                                                                     
            >                                                                                                                                                                                                        
              {loading ? '...' : 'EXEC →'}                                                                                                                                                                           
            </button>
          </div>
        </div>
      </div>                                                                                                                                                                                                         
    )
  }
  

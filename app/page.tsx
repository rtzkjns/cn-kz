'use client'
import ReactMarkdown from 'react-markdown'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

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
        if (glitch) ctx.fillStyle = `rgba(255, 0, 60, ${Math.random() * 0.8})`
        else if (y < 3) ctx.fillStyle = '#fff'
        else ctx.fillStyle = `rgba(0, 255, 100, ${Math.random() * 0.5 + 0.1})`
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 14, y * 14)
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0
        else drops[i]++
        if (frame % 60 === 0 && Math.random() > 0.97) {
          ctx.fillStyle = `rgba(255, 0, 60, 0.03)`
          ctx.fillRect(0, Math.random() * canvas.height, canvas.width, 2)
        }
      })
    }

    const interval = setInterval(draw, 40)
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { clearInterval(interval); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.4
    }} />
  )
}

type Message = { role: string; text: string; streaming?: boolean }
type Chat = { id: string; title: string; created_at: string }
type Document = { id: string; name: string }

export default function Home() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showUploadMenu, setShowUploadMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setUser(data.user as { id: string; email?: string })
    })
  }, [])

  useEffect(() => {
    if (!user) return
    supabase.from('chats').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setChats(data) })
    supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setDocuments(data) })
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadChat(chatId: string) {
    setCurrentChatId(chatId)
    const { data } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true })
    if (data) setMessages(data.map(m => ({ role: m.role, text: m.content })))
  }

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', user.id)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()

    if (data.success) {
      const { data: doc } = await supabase.from('documents').select('*').eq('id', data.documentId).single()
      if (doc) {
        setDocuments(prev => [doc, ...prev])
        setActiveDocId(doc.id)
      }
    }
    setUploading(false)
    e.target.value = ''
  }

  async function sendMessage() {
    if (!message.trim() || !user) return
    const userMessage = message
    setMessage('')
    setLoading(true)

    let chatId = currentChatId
    if (!chatId) {
      const { data } = await supabase.from('chats').insert([{ user_id: user.id, title: userMessage.slice(0, 40) }]).select().single()
      if (!data) return
      chatId = data.id
      setCurrentChatId(chatId)
      setChats(prev => [data, ...prev])
    }

    const newMessages = [...messages, { role: 'user', text: userMessage }]
    setMessages(newMessages)

    let context = ''
    if (activeDocId) {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage, userId: user.id, documentId: activeDocId }),
      })
      const { chunks } = await res.json()
      if (chunks?.length > 0) {
        context = chunks.map((c: { content: string }) => c.content).join('\n\n')
      }
    }

    const history = newMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }))

    if (context) {
      history[history.length - 1].content =
        `Context from document:\n\n${context}\n\nQuestion: ${userMessage}`
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    })

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let aiText = ''

    setMessages(prev => [...prev, { role: 'ai', text: '', streaming: true }])
    setLoading(false)

    let rafId: number
    let lastRendered = ''
    const tick = () => {
      if (aiText !== lastRendered) {
        lastRendered = aiText
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'ai', text: aiText, streaming: true }
          return updated
        })
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      aiText += decoder.decode(value, { stream: true })
    }

    cancelAnimationFrame(rafId)
    setMessages(prev => {
      const updated = [...prev]
      updated[updated.length - 1] = { role: 'ai', text: aiText, streaming: false }
      return updated
    })

    await supabase.from('messages').insert([
      { role: 'user', content: userMessage, user_id: user.id, chat_id: chatId },
      { role: 'ai', content: aiText, user_id: user.id, chat_id: chatId },
    ])
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117', color: '#e6edf3',
      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
      display: 'flex', position: 'relative',
    }}>
      <GlitchBackground />

      {/* Sidebar */}
      <div style={{
        width: '240px', minHeight: '100vh', background: 'rgba(13, 17, 23, 0.95)',
        borderRight: '1px solid #21262d', display: 'flex', flexDirection: 'column', zIndex: 1, flexShrink: 0,
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #21262d' }}>
          <div style={{ fontSize: '11px', color: '#ff003c', letterSpacing: '3px', marginBottom: '8px' }}>GLITCH_AI.exe</div>
          <button
            onClick={() => { setCurrentChatId(null); setMessages([]) }}
            style={{ width: '100%', background: 'transparent', border: '1px solid #30363d', borderRadius: '4px', color: '#e6edf3', fontFamily: 'inherit', fontSize: '12px', padding: '8px', cursor: 'pointer', textAlign: 'left' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#ff003c')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#30363d')}
          >
            + New Chat
          </button>
        </div>

        {/* Chats */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {chats.map(chat => (
            <button key={chat.id} onClick={() => loadChat(chat.id)} style={{
              width: '100%', background: currentChatId === chat.id ? 'rgba(255, 0, 60, 0.08)' : 'transparent',
              border: currentChatId === chat.id ? '1px solid #ff003c30' : '1px solid transparent',
              borderRadius: '4px', color: currentChatId === chat.id ? '#e6edf3' : '#8b949e',
              fontFamily: 'inherit', fontSize: '12px', padding: '8px 10px', cursor: 'pointer',
              textAlign: 'left', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
              onMouseEnter={e => { if (currentChatId !== chat.id) e.currentTarget.style.color = '#e6edf3' }}
              onMouseLeave={e => { if (currentChatId !== chat.id) e.currentTarget.style.color = '#8b949e' }}
            >
              ▸ {chat.title}
            </button>
          ))}
        </div>

        {/* Documents section */}
        <div style={{ borderTop: '1px solid #21262d', padding: '8px' }}>
          <div style={{ fontSize: '10px', color: '#484f58', letterSpacing: '2px', padding: '6px 10px' }}>DOCUMENTS</div>
          <input ref={fileInputRef} type="file" accept=".pdf,.txt,.md" onChange={uploadFile} style={{ display: 'none' }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ width: '100%', background: 'transparent', border: '1px solid #30363d', borderRadius: '4px', color: uploading ? '#484f58' : '#00ff64', fontFamily: 'inherit', fontSize: '12px', padding: '8px', cursor: uploading ? 'not-allowed' : 'pointer', textAlign: 'left', marginBottom: '4px' }}
            onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = '#00ff64' }}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#30363d')}
          >
            {uploading ? 'uploading...' : '+ Upload file'}
          </button>
          {documents.map(doc => (
            <button key={doc.id} onClick={() => setActiveDocId(activeDocId === doc.id ? null : doc.id)} style={{
              width: '100%', background: activeDocId === doc.id ? 'rgba(0, 255, 100, 0.08)' : 'transparent',
              border: activeDocId === doc.id ? '1px solid #00ff6430' : '1px solid transparent',
              borderRadius: '4px', color: activeDocId === doc.id ? '#00ff64' : '#8b949e',
              fontFamily: 'inherit', fontSize: '11px', padding: '6px 10px', cursor: 'pointer',
              textAlign: 'left', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              📄 {doc.name}
            </button>
          ))}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #21262d' }}>
          <div style={{ fontSize: '11px', color: '#484f58', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
            style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: '4px', color: '#484f58', fontFamily: 'inherit', fontSize: '11px', padding: '6px 12px', cursor: 'pointer', width: '100%' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e6edf3'; e.currentTarget.style.borderColor = '#484f58' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#484f58'; e.currentTarget.style.borderColor = '#30363d' }}
          >
            logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '720px' }}>

          {activeDocId && (
            <div style={{ fontSize: '11px', color: '#00ff64', marginBottom: '12px', padding: '6px 12px', border: '1px solid #00ff6430', borderRadius: '4px', background: 'rgba(0,255,100,0.05)' }}>
              ▸ RAG mode — answering from: {documents.find(d => d.id === activeDocId)?.name}
            </div>
          )}

          {!currentChatId && messages.length === 0 && (
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ fontSize: '11px', color: '#ff003c', letterSpacing: '4px', marginBottom: '6px' }}>▓▒░ SYSTEM BREACH ░▒▓</div>
              <h1 style={{ margin: 0, fontSize: '28px', color: '#00ff64', textShadow: '0 0 20px #00ff64' }}>GLITCH_AI.exe</h1>
              <p style={{ color: '#484f58', fontSize: '13px', marginTop: '12px' }}>
                {activeDocId ? 'ask anything about your document' : 'start a new conversation or upload a document'}
              </p>
            </div>
          )}

          <div style={{
            background: 'rgba(22, 27, 34, 0.85)', border: '1px solid #ff003c', borderRadius: '4px',
            padding: '20px', minHeight: '360px', maxHeight: '60vh', overflowY: 'auto',
            backdropFilter: 'blur(8px)', boxShadow: '0 0 30px rgba(255, 0, 60, 0.15), inset 0 0 30px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            {messages.length === 0 && <span style={{ color: '#484f58', fontSize: '13px' }}>{'>'} initializing connection...</span>}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: msg.role === 'user' ? '#ff003c' : '#00ff64' }}>
                  {msg.role === 'user' ? '▸ USER' : '▸ AI'}
                </span>
                <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#e6edf3' }}>
                  {msg.streaming ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                </div>
              </div>
            ))}
            {loading && (
              <div>
                <span style={{ fontSize: '11px', color: '#00ff64' }}>▸ AI</span>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#00ff64' }}>decrypting...</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(22, 27, 34, 0.85)',
              border: '1px solid #30363d', borderRadius: '4px', padding: '0 12px', backdropFilter: 'blur(8px)',
            }}>
              <span style={{ color: '#ff003c', marginRight: '8px' }}>{'>'}</span>
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={activeDocId ? 'ask about your document...' : 'enter command...'}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e6edf3', fontFamily: 'inherit', fontSize: '14px', padding: '12px 0' }}
              />
              <div style={{ position: 'relative' }}>
                {showUploadMenu && (
                  <div style={{
                    position: 'absolute', bottom: '36px', right: 0,
                    background: 'rgba(22, 27, 34, 0.98)', border: '1px solid #30363d',
                    borderRadius: '6px', padding: '4px', minWidth: '180px',
                    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                    zIndex: 10,
                  }}>
                    <button
                      onClick={() => { fileInputRef.current?.click(); setShowUploadMenu(false) }}
                      style={{
                        width: '100%', background: 'transparent', border: 'none',
                        color: '#e6edf3', fontFamily: 'inherit', fontSize: '13px',
                        padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '4px',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontSize: '16px' }}>📎</span>
                      Add photos and files
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowUploadMenu(prev => !prev)}
                  disabled={uploading}
                  style={{
                    background: showUploadMenu ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: 'none', color: showUploadMenu ? '#e6edf3' : '#484f58',
                    cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '20px',
                    padding: '0 4px', lineHeight: 1, transition: 'color 0.15s ease',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={e => { if (!uploading) e.currentTarget.style.color = '#e6edf3' }}
                  onMouseLeave={e => { if (!showUploadMenu) e.currentTarget.style.color = '#484f58' }}
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                background: 'transparent', border: '1px solid #ff003c', borderRadius: '4px',
                color: loading ? '#484f58' : '#ff003c', fontFamily: 'inherit', fontSize: '13px',
                padding: '0 20px', cursor: loading ? 'not-allowed' : 'pointer',
                textShadow: loading ? 'none' : '0 0 10px #ff003c',
                boxShadow: loading ? 'none' : '0 0 10px rgba(255,0,60,0.2)',
              }}
            >
              {loading ? '...' : 'EXEC →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

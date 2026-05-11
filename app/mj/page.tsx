'use client'
import ReactMarkdown from 'react-markdown'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

type Message = { role: string; text: string; streaming?: boolean }

const TRACKS = [
  { id: 'oRdxUFDoQe0', title: 'Beat It', start: 58 },
  { id: 'g4tpuu-Up90', title: 'You Rock My World', start: 50 },
  { id: 'dsUXAEzaC3Q', title: 'Bad', start: 133 },
  { id: 'QNJL6nfu__Q', title: "They Don't Care About Us", start: 62 },
]

function MusicPlayer() {
  const [playing, setPlaying] = useState(false)
  const [track, setTrack] = useState(TRACKS[0])
  const [hover, setHover] = useState(false)

  function playRandom() {
    const random = TRACKS[Math.floor(Math.random() * TRACKS.length)]
    setTrack(random)
    setPlaying(true)
  }

  function stop() {
    setPlaying(false)
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 100 }}>

      {/* Hidden audio iframe */}
      {playing && (
        <iframe
          key={track.id}
          src={`https://www.youtube.com/embed/${track.id}?autoplay=1&start=${track.start}&controls=0`}
          allow="autoplay; encrypted-media"
          style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
        />
      )}

      {/* Now playing label */}
      {playing && (
        <div style={{
          position: 'absolute', bottom: '60px', left: 0,
          background: '#0d0d0d', border: '1px solid #1e1e1e',
          borderRadius: '6px', padding: '8px 14px',
          display: 'flex', alignItems: 'center', gap: '10px',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: '11px', color: '#c8a000', letterSpacing: '1px' }}>♫ {track.title}</span>
          <button onClick={playRandom} style={{ background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: '11px' }}>next</button>
          <button onClick={stop} style={{ background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: '14px' }}>×</button>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={playing ? stop : playRandom}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: playing ? 'rgba(200,160,0,0.12)' : hover ? 'rgba(200,160,0,0.08)' : '#0d0d0d',
          border: `1px solid ${playing ? 'rgba(200,160,0,0.7)' : 'rgba(200,160,0,0.4)'}`,
          color: '#c8a000', fontSize: playing ? '16px' : '20px', cursor: 'pointer',
          boxShadow: playing ? '0 0 30px rgba(200,160,0,0.25)' : hover ? '0 0 16px rgba(200,160,0,0.15)' : 'none',
          transition: 'all 0.2s ease',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {playing ? '■' : '♫'}
      </button>
    </div>
  )
}

const HAT_SVG = (
  <svg viewBox="0 0 120 80" width="80" height="53" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="68" rx="58" ry="12" fill="#0d0d0d" stroke="#c8a000" strokeWidth="0.5" strokeOpacity="0.4"/>
    <path d="M25 65 Q25 20 60 18 Q95 20 95 65 Z" fill="#111"/>
    <rect x="25" y="58" width="70" height="6" rx="1" fill="#c8a000" opacity="0.7"/>
    <ellipse cx="60" cy="68" rx="58" ry="12" fill="none" stroke="#c8a000" strokeWidth="0.5" strokeOpacity="0.3"/>
  </svg>
)

const GLOVE_SVG = (
  <svg viewBox="0 0 70 100" width="50" height="70" xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="48" width="38" height="44" rx="8" fill="#e8e8e8"/>
    <rect x="8" y="30" width="12" height="28" rx="6" fill="#e8e8e8"/>
    <rect x="20" y="22" width="12" height="32" rx="6" fill="#e8e8e8"/>
    <rect x="32" y="20" width="12" height="34" rx="6" fill="#e8e8e8"/>
    <rect x="44" y="24" width="12" height="30" rx="6" fill="#e8e8e8"/>
    <rect x="4" y="50" width="18" height="10" rx="5" fill="#e8e8e8" transform="rotate(-20 13 55)"/>
    {[...Array(12)].map((_, i) => (
      <circle key={i} cx={22 + (i % 4) * 9} cy={55 + Math.floor(i / 4) * 10} r="2.5" fill="white" opacity="0.9" stroke="#ddd" strokeWidth="0.5"/>
    ))}
  </svg>
)

function StageSpotlights() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const spotlights = [
      { x: window.innerWidth * 0.15, angle: 0.3, speed: 0.004, color: 'rgba(200,160,0,' },
      { x: window.innerWidth * 0.5,  angle: 0.0, speed: 0.003, color: 'rgba(255,255,255,' },
      { x: window.innerWidth * 0.85, angle: -0.3, speed: 0.005, color: 'rgba(200,160,0,' },
    ]

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 1

      spotlights.forEach(s => {
        const swing = Math.sin(t * s.speed) * 0.4
        const angle = s.angle + swing
        const length = canvas.height * 1.1
        const tx = s.x + Math.sin(angle) * length
        const ty = length

        const grad = ctx.createLinearGradient(s.x, 0, tx, ty)
        grad.addColorStop(0, s.color + '0.07)')
        grad.addColorStop(0.5, s.color + '0.04)')
        grad.addColorStop(1, s.color + '0)')

        const spread = length * 0.18
        ctx.beginPath()
        ctx.moveTo(s.x, 0)
        ctx.lineTo(tx - spread, ty)
        ctx.lineTo(tx + spread, ty)
        ctx.closePath()
        ctx.fillStyle = grad
        ctx.fill()

        // Light source dot
        ctx.beginPath()
        ctx.arc(s.x, 0, 4, 0, Math.PI * 2)
        ctx.fillStyle = s.color + '0.6)'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(s.x, 0, 10, 0, Math.PI * 2)
        ctx.fillStyle = s.color + '0.15)'
        ctx.fill()
      })
    }

    const interval = setInterval(draw, 30)
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)
    return () => { clearInterval(interval); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
}

function MJElements() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes gloveFloat {
          0%, 100% { transform: translateY(0px) rotate(-10deg); }
          50%       { transform: translateY(-14px) rotate(10deg); }
        }
        .gold-shimmer {
          background: linear-gradient(90deg, #c8a000, #fff8dc, #c8a000, #fff8dc, #c8a000);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .glove-float { animation: gloveFloat 3s ease-in-out infinite; display: inline-block; }
        .bg-glove { }
      `}</style>


      {/* Subtle spotlight */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
      }} />
    </div>
  )
}

export default function MJChat() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [context, setContext] = useState('')
  const [uploading, setUploading] = useState(false)
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function uploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const text = await file.text()
    setContext(prev => prev + '\n\n' + text)
    setUploading(false)
    e.target.value = ''
  }

  async function sendMessageWithText(text: string) {
    setMessage('')
    await sendMessageCore(text)
  }

  async function sendMessage() {
    if (!message.trim()) return
    const userMessage = message
    setMessage('')
    await sendMessageCore(userMessage)
  }

  async function sendMessageCore(userMessage: string) {
    setLoading(true)

    const newMessages = [...messages, { role: 'user', text: userMessage }]
    setMessages(newMessages)

    const history = newMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    }))

    const res = await fetch('/api/mj', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history, context }),
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
  }

  return (
    <div style={{
      height: '100vh', background: '#080808', color: '#e6e0d0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      <StageSpotlights />
      <MJElements />
      <MusicPlayer />

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '24px 20px 16px', position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <div className="glove-float" style={{ marginBottom: '8px' }}>
          <img src="/mj.jpg" alt="Michael Jackson" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '1px solid rgba(200,160,0,0.3)', boxShadow: '0 0 30px rgba(200,160,0,0.15)' }} />
        </div>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontFamily: 'inherit', fontStyle: 'normal', fontWeight: 700 }} className="gold-shimmer">
          Michael Jackson
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{ height: '1px', width: '30px', background: 'linear-gradient(90deg, transparent, rgba(200,160,0,0.4))' }} />
          <span style={{ fontSize: '9px', color: '#444', letterSpacing: '4px' }}>KING OF POP</span>
          <div style={{ height: '1px', width: '30px', background: 'linear-gradient(90deg, rgba(200,160,0,0.4), transparent)' }} />
        </div>
        <a href="/" style={{ position: 'absolute', top: '28px', left: '20px', color: '#2a2a2a', fontSize: '11px', textDecoration: 'none', letterSpacing: '2px' }}>← BACK</a>
      </div>

      {/* Scrollable middle */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Empty state */}
          {messages.length === 0 && (
            <div style={{ paddingTop: '8px' }}>
              <div style={{ textAlign: 'center', color: '#1e1e1e', fontSize: '14px', fontStyle: 'normal', fontFamily: 'inherit', marginBottom: '16px' }}>
                "In a world filled with hate, we must still dare to hope."
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '10px', color: '#2a2a2a', letterSpacing: '3px', marginBottom: '10px', textAlign: 'center' }}>QUICK QUESTIONS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {['Tell me about the Moonwalk', 'What is Thriller about?', 'Your childhood in Gary', 'How did you create Billie Jean?', 'What is Neverland to you?', 'Your message to the world'].map(q => (
                    <button key={q} onClick={() => sendMessageWithText(q)} style={{ background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '20px', color: '#3a3a3a', fontFamily: 'inherit', fontSize: '12px', padding: '6px 14px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,160,0,0.4)'; e.currentTarget.style.color = '#c8a000' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#3a3a3a' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: '#2a2a2a', letterSpacing: '3px', marginBottom: '10px', textAlign: 'center' }}>DISCOGRAPHY</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {[{ title: 'Off the Wall', year: '1979' }, { title: 'Thriller', year: '1982' }, { title: 'Bad', year: '1987' }, { title: 'Dangerous', year: '1991' }, { title: 'HIStory', year: '1995' }, { title: 'Invincible', year: '2001' }].map(album => (
                    <button key={album.title} onClick={() => sendMessageWithText(`Tell me about your album "${album.title}" from ${album.year}`)}
                      style={{ background: 'transparent', border: '1px solid #1a1a1a', borderRadius: '4px', color: '#2a2a2a', fontFamily: 'inherit', fontSize: '12px', padding: '8px 14px', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,160,0,0.3)'; e.currentTarget.style.color = '#e6e0d0'; e.currentTarget.style.background = 'rgba(200,160,0,0.04)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#2a2a2a'; e.currentTarget.style.background = 'transparent' }}>
                      <div style={{ fontWeight: 600 }}>{album.title}</div>
                      <div style={{ fontSize: '10px', color: '#222', marginTop: '2px' }}>{album.year}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {messages.length === 0 && (
            <div style={{ marginTop: '24px', marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: '#2a2a2a', letterSpacing: '3px', marginBottom: '14px', textAlign: 'center' }}>TIMELINE</div>
              <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '0', alignItems: 'center', minWidth: 'max-content', padding: '0 8px' }}>
                  {[
                    { year: '1958', event: 'Born in Gary, Indiana' },
                    { year: '1964', event: 'Joins The Jackson 5' },
                    { year: '1979', event: 'Off the Wall' },
                    { year: '1982', event: 'Thriller released' },
                    { year: '1983', event: 'Moonwalk debut' },
                    { year: '1987', event: 'Bad World Tour' },
                    { year: '1988', event: 'Neverland Ranch' },
                    { year: '1991', event: 'Dangerous album' },
                    { year: '1995', event: 'HIStory album' },
                    { year: '2009', event: 'Passes away' },
                  ].map((item, i, arr) => (
                    <div key={item.year} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10px', color: '#2a2a2a' }}>{item.event}</span>
                        <button
                          onClick={() => sendMessageWithText(`Tell me about ${item.event} in ${item.year} in Michael Jackson's life`)}
                          style={{
                            width: '44px', height: '44px', borderRadius: '50%',
                            background: 'transparent', border: '1px solid #1e1e1e',
                            color: '#444', fontFamily: 'inherit', fontSize: '11px',
                            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,160,0,0.5)'; e.currentTarget.style.color = '#c8a000'; e.currentTarget.style.boxShadow = '0 0 16px rgba(200,160,0,0.15)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#444'; e.currentTarget.style.boxShadow = 'none' }}
                        >
                          {item.year.slice(2)}
                        </button>
                      </div>
                      {i < arr.length - 1 && <div style={{ width: '32px', height: '1px', background: '#1a1a1a', flexShrink: 0 }} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '12px 0' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '3px', color: msg.role === 'user' ? '#333' : 'rgba(200,160,0,0.5)' }}>
                  {msg.role === 'user' ? 'YOU' : 'MICHAEL'}
                </span>
                <div style={{ color: msg.role === 'user' ? '#555' : '#e6e0d0', fontSize: '15px', lineHeight: '1.9', fontFamily: 'inherit', fontStyle: 'normal' }}>
                  {msg.streaming ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
                </div>
                {msg.role === 'ai' && !msg.streaming && (
                  <button
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                    style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#2a2a2a', cursor: 'pointer', fontSize: '11px', padding: '2px 0', letterSpacing: '1px', transition: 'color 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#c8a000'}
                    onMouseLeave={e => e.currentTarget.style.color = '#2a2a2a'}
                  >
                    copy ↗
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '3px', color: 'rgba(200,160,0,0.5)' }}>MICHAEL</span>
                <span style={{ color: '#c8a000', fontSize: '20px', letterSpacing: '4px' }}>✦ ✦ ✦</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Fixed input at bottom */}
      <div style={{ flexShrink: 0, padding: '12px 20px 20px', borderTop: '1px solid #141414', background: '#080808', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', gap: '8px' }}>
          <input ref={fileInputRef} type="file" accept=".txt,.md" onChange={uploadFile} style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            style={{ background: 'transparent', border: '1px solid #1e1e1e', borderRadius: '2px', color: '#333', fontSize: '16px', padding: '0 14px', cursor: 'pointer', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#c8a000'; e.currentTarget.style.borderColor = '#c8a00040' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#333'; e.currentTarget.style.borderColor = '#1e1e1e' }}>
            📎
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(10,10,10,0.9)', border: '1px solid #1e1e1e', borderRadius: '2px', padding: '0 16px' }}>
            <input
              id="mj-input"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask Michael anything..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e6e0d0', fontFamily: 'inherit', fontStyle: 'normal', fontSize: '14px', padding: '14px 0' }}
            />
          </div>
          <button onClick={sendMessage} disabled={loading}
            style={{ background: 'transparent', border: '1px solid rgba(200,160,0,0.3)', borderRadius: '2px', color: '#c8a000', fontFamily: 'inherit', fontSize: '12px', padding: '0 20px', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '2px', opacity: loading ? 0.4 : 1, transition: 'all 0.2s ease' }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'rgba(200,160,0,0.08)' } }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
            {loading ? '✦' : 'SEND'}
          </button>
        </div>
      </div>
    </div>
  )
}

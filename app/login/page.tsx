'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [btnHover, setBtnHover] = useState(false)
  const [switchHover, setSwitchHover] = useState(false)
  const router = useRouter()

  async function handleSubmit() {
    setError('')
    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setError('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    }

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Fira Code", monospace',
      color: '#e6edf3',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        background: 'rgba(22, 27, 34, 0.85)',
        border: '1px solid #ff003c',
        borderRadius: '4px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', color: '#ff003c', letterSpacing: '4px', marginBottom: '6px' }}>
            ▓▒░ ACCESS CONTROL ░▒▓
          </div>
          <h1 style={{ margin: 0, fontSize: '20px', color: '#00ff64', textShadow: '0 0 20px #00ff64' }}>
            {isSignUp ? 'CREATE ACCOUNT' : 'SYSTEM LOGIN'}
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #30363d', borderRadius: '4px', padding: '0 12px' }}>
            <span style={{ color: '#ff003c', marginRight: '8px' }}>{'>'}</span>
            <input
              type="email"
              placeholder="email..."
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e6edf3', fontFamily: 'inherit', fontSize: '14px', padding: '12px 0' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #30363d', borderRadius: '4px', padding: '0 12px' }}>
            <span style={{ color: '#ff003c', marginRight: '8px' }}>{'>'}</span>
            <input
              type="password"
              placeholder="password..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e6edf3', fontFamily: 'inherit', fontSize: '14px', padding: '12px 0' }}
            />
          </div>

          {error && (
            <div style={{ fontSize: '13px', color: error.includes('Check') ? '#00ff64' : '#ff003c' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              background: btnHover && !loading ? 'rgba(255, 0, 60, 0.1)' : 'transparent',
              border: '1px solid #ff003c',
              borderRadius: '4px',
              color: loading ? '#484f58' : '#ff003c',
              fontFamily: 'inherit',
              fontSize: '13px',
              padding: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              textShadow: btnHover && !loading ? '0 0 20px #ff003c' : loading ? 'none' : '0 0 10px #ff003c',
              boxShadow: btnHover && !loading ? '0 0 20px rgba(255, 0, 60, 0.4)' : 'none',
              transform: btnHover && !loading ? 'translateY(-1px)' : 'none',
              transition: 'all 0.15s ease',
              letterSpacing: btnHover ? '2px' : '0px',
            }}
          >
            {loading ? '...' : isSignUp ? 'CREATE →' : 'LOGIN →'}
          </button>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            onMouseEnter={() => setSwitchHover(true)}
            onMouseLeave={() => setSwitchHover(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: switchHover ? '#e6edf3' : '#484f58',
              fontFamily: 'inherit',
              fontSize: '13px',
              cursor: 'pointer',
              padding: '4px',
              transition: 'color 0.15s ease',
            }}
          >
            {isSignUp ? 'already have account? login' : 'no account? sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}

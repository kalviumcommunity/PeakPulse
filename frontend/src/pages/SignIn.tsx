import { useState, type FormEvent } from 'react'

interface Props {
  onSignIn: () => void
  navigate: (p: string) => void
}

export default function SignIn({ onSignIn, navigate }: Props) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Email and password required.'); return }
    setError('')
    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store token for API calls
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      onSignIn();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1119',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Logo link */}
      <button
        onClick={() => navigate('landing')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 40,
        }}
      >
        <div style={{
          width: 22,
          height: 22,
          background: '#F5A623',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{ width: 8, height: 8, background: '#0D1119', borderRadius: 1 }} />
        </div>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: 17,
          letterSpacing: '0.08em',
          color: '#E8EBF2',
        }}>
          PULSE
        </span>
      </button>

      {/* Card */}
      <div style={{
        width: 360,
        background: '#141B27',
        border: '1px solid #1A2336',
        borderRadius: 6,
        padding: '32px',
      }}>
        <h1 style={{
          fontFamily: "'Barlow', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: '#E8EBF2',
          margin: '0 0 6px',
        }}>
          Sign in to Pulse
        </h1>
        <p style={{ fontSize: 12, color: '#7A8499', margin: '0 0 28px' }}>
          Internal access — authorized ops personnel only.
        </p>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{
              display: 'block',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#7A8499',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ops@company.com"
              style={{
                width: '100%',
                padding: '9px 12px',
                background: '#0D1119',
                border: '1px solid #242E40',
                borderRadius: 4,
                color: '#E8EBF2',
                fontSize: 13,
              }}
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: 6 }}>
            <label style={{
              display: 'block',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#7A8499',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '9px 12px',
                background: '#0D1119',
                border: '1px solid #242E40',
                borderRadius: 4,
                color: '#E8EBF2',
                fontSize: 13,
              }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#F5A623',
              marginTop: 10,
            }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 22,
              padding: '11px',
              background: loading ? 'rgba(245,166,35,0.4)' : '#F5A623',
              border: 'none',
              borderRadius: 4,
              color: '#0D1119',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.1em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            {loading ? 'VERIFYING…' : 'SIGN IN →'}
          </button>
        </form>

        <div style={{
          marginTop: 20,
          paddingTop: 18,
          borderTop: '1px solid #1A2336',
          fontSize: 12,
          color: '#7A8499',
          textAlign: 'center',
        }}>
          Not authorized?{' '}
          <span style={{ color: '#38A89D', cursor: 'pointer' }}>
            Contact your ops admin
          </span>
        </div>
      </div>

      <button
        onClick={() => navigate('landing')}
        style={{
          marginTop: 24,
          background: 'none',
          border: 'none',
          color: '#3D4A5F',
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        ← Back to overview
      </button>
    </div>
  )
}

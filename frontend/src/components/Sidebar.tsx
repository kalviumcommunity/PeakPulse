interface Props {
  page: string
  navigate: (p: string) => void
  onSignOut: () => void
}

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'operations', label: 'Analytics' },
  { id: 'zones',     label: 'Zones'     },
  { id: 'incidents', label: 'Incidents' },
  { id: 'reports',   label: 'Reports'   },
]

const BREACH_RATES: Record<string, number> = {
  A: 8.2, B: 10.4, C: 34.1, D: 6.3, E: 11.7, F: 9.1,
}

export default function Sidebar({ page, navigate, onSignOut }: Props) {
  return (
    <aside style={{
      width: 200,
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: '#0D1119',
      borderRight: '1px solid #1A2336',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 20, borderBottom: '1px solid #1A2336' }}>
          <div style={{
            width: 22,
            height: 22,
            background: '#F5A623',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
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
          {/* Live dot */}
          <div style={{
            marginLeft: 'auto',
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#38A89D',
            animation: 'liveDot 2.2s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 12px 0', flex: 1 }}>
        {NAV.map(item => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '8px 10px',
                border: 'none',
                background: active ? '#141B27' : 'transparent',
                color: active ? '#E8EBF2' : '#7A8499',
                fontSize: 13,
                fontFamily: "'Inter', sans-serif",
                fontWeight: active ? 500 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 1,
                transition: 'color 0.12s, background 0.12s',
                borderLeft: `2px solid ${active ? '#F5A623' : 'transparent'}`,
                borderRadius: active ? '0 4px 4px 0' : '4px',
              }}
            >
              {item.label}
            </button>
          )
        })}

        {/* Zone list */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #1A2336' }}>
          <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.12em', padding: '0 10px', marginBottom: 6 }}>
            ZONES
          </div>
          {Object.entries(BREACH_RATES).map(([z, rate]) => (
            <button
              key={z}
              onClick={() => navigate('zones')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                padding: '5px 10px',
                border: 'none',
                background: 'transparent',
                color: '#7A8499',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                borderRadius: 3,
              }}
            >
              <span style={{ color: '#C4CAD9' }}>{z}</span>
              <span style={{ color: rate > 15 ? '#F5A623' : '#38A89D' }}>
                {rate}%
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* User */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid #1A2336' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: '#1A2336',
            border: '1px solid #242E40',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 600,
            color: '#7A8499',
            flexShrink: 0,
            fontFamily: "'Inter', sans-serif",
          }}>
            JK
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#C4CAD9', fontWeight: 500 }}>Jordan Kim</div>
            <div style={{ fontSize: 9, color: '#3D4A5F', fontFamily: "'JetBrains Mono', monospace" }}>ops admin</div>
          </div>
        </div>
        <button
          onClick={onSignOut}
          style={{
            width: '100%',
            padding: '6px',
            borderRadius: 3,
            border: '1px solid #1A2336',
            background: 'transparent',
            color: '#3D4A5F',
            fontSize: 11,
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            transition: 'color 0.12s, border-color 0.12s',
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}

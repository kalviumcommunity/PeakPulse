import PulseStrip from '../components/PulseStrip'

interface Props { navigate: (p: string) => void }

const FINDINGS = [
  {
    zone: 'Zone C · East Suburbs',
    window: '19:00 – 21:00',
    stat: '34.1%',
    context: 'of orders breach the 30-min SLA during evening peak',
    tag: 'CRITICAL',
    tc: '#F5A623',
  },
  {
    zone: 'All Zones',
    window: '12:00 – 13:00',
    stat: '+19 min',
    context: 'average overrun beyond target at lunch rush, network-wide',
    tag: 'ELEVATED',
    tc: '#F5A623',
  },
  {
    zone: 'Zone E · South Bay',
    window: '19:00 – 21:00',
    stat: '28.0%',
    context: 'breach rate in the same window — Zone D is 4.9% for the same hours',
    tag: 'ELEVATED',
    tc: '#F5A623',
  },
]

export default function Landing({ navigate }: Props) {
  return (
    <div style={{ background: '#0D1119', minHeight: '100vh', color: '#E8EBF2' }}>

      {/* ── Nav ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        height: 56,
        borderBottom: '1px solid #1A2336',
        position: 'sticky',
        top: 0,
        background: '#0D1119',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            fontSize: 16,
            letterSpacing: '0.08em',
            color: '#E8EBF2',
          }}>
            PULSE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontSize: 13, color: '#7A8499', cursor: 'pointer' }}>Docs</span>
          <button
            onClick={() => navigate('signin')}
            style={{
              padding: '7px 18px',
              background: 'transparent',
              border: '1px solid #242E40',
              borderRadius: 4,
              color: '#C4CAD9',
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              transition: 'border-color 0.12s, color 0.12s',
            }}
          >
            Sign in
          </button>
        </div>
      </header>

      {/* ── Hero: asymmetric split ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 3fr',
        minHeight: 'calc(100vh - 56px)',
      }}>

        {/* Left — copy */}
        <div style={{
          padding: '80px 48px 80px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderRight: '1px solid #1A2336',
        }}>
          <div style={{
            fontSize: 9,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#38A89D',
            letterSpacing: '0.14em',
            marginBottom: 24,
          }}>
            ● INTERNAL OPS · FOOD DELIVERY
          </div>

          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(52px, 5.8vw, 76px)',
            lineHeight: 0.96,
            letterSpacing: '-0.01em',
            color: '#E8EBF2',
            margin: '0 0 24px',
          }}>
            SEE WHERE<br />
            SLA IS<br />
            <span style={{ color: '#F5A623' }}>BLEEDING</span><br />
            BEFORE<br />
            THEY DO.
          </h1>

          <p style={{
            fontSize: 14,
            color: '#7A8499',
            lineHeight: 1.65,
            margin: '0 0 40px',
            maxWidth: 320,
          }}>
            Pulse unifies delivery logs, rider assignments, complaints, and refunds
            so your ops team can spot which zone-hour combinations are quietly failing
            — before the complaints pile up.
          </p>

          <button
            onClick={() => navigate('signin')}
            style={{
              alignSelf: 'flex-start',
              padding: '11px 28px',
              background: '#F5A623',
              border: 'none',
              borderRadius: 4,
              color: '#0D1119',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.1em',
              cursor: 'pointer',
              transition: 'opacity 0.12s',
            }}
          >
            ACCESS PLATFORM →
          </button>

          {/* Micro stats */}
          <div style={{
            marginTop: 48,
            paddingTop: 28,
            borderTop: '1px solid #1A2336',
            display: 'flex',
            gap: 36,
          }}>
            {[
              ['4,821', 'orders today'],
              ['177',   'active riders'],
              ['61',    'breaches flagged'],
            ].map(([n, l]) => (
              <div key={l}>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: '#E8EBF2',
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                }}>
                  {n}
                </div>
                <div style={{
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#7A8499',
                  marginTop: 4,
                }}>
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — pulse strip */}
        <div style={{
          background: '#0A0F18',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '56px 44px',
        }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 9,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#3D4A5F',
              letterSpacing: '0.12em',
              marginBottom: 6,
            }}>
              24H SLA PULSE MATRIX · LIVE · JAN 15 2024
            </div>
            <div style={{
              fontSize: 13,
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600,
              color: '#C4CAD9',
            }}>
              Zone × Hour violation intensity
            </div>
          </div>

          {/* Zone labels + strip */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['A','B','C','D','E','F'].map(z => (
                <div key={z} style={{
                  height: 26,
                  width: 16,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 9,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#3D4A5F',
                }}>
                  {z}
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <PulseStrip compact cellH={26} />
            </div>
          </div>

          {/* Hour ticks */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
            paddingLeft: 26,
            fontSize: 9,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#3D4A5F',
          }}>
            {['00','06','12','18','23'].map(t => <span key={t}>{t}h</span>)}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 20, paddingLeft: 26 }}>
            {[
              { bg: 'rgba(56,168,157,0.8)', l: 'ON-TIME' },
              { bg: 'rgba(245,166,35,0.9)', l: 'BREACH'  },
            ].map(({ bg, l }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F' }}>
                <div style={{ width: 16, height: 4, borderRadius: 1, background: bg }} />
                {l}
              </div>
            ))}
            <div style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 9,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#F5A623',
            }}>
              <div style={{ width: 1, height: 12, background: '#F5A623' }} />
              NOW · 17:30
            </div>
          </div>
        </div>
      </div>

      {/* ── Findings ── */}
      <section style={{ padding: '80px 48px', borderTop: '1px solid #1A2336' }}>
        <div style={{
          fontSize: 9,
          fontFamily: "'JetBrains Mono', monospace",
          color: '#3D4A5F',
          letterSpacing: '0.14em',
          marginBottom: 36,
        }}>
          SIGNAL FROM THE DATA
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          maxWidth: 1000,
        }}>
          {FINDINGS.map((f, i) => (
            <div key={i} style={{
              background: '#0A0F18',
              border: '1px solid #1A2336',
              borderRadius: 6,
              padding: '24px',
            }}>
              {/* zone + window */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#C4CAD9', marginBottom: 3 }}>
                  {f.zone}
                </div>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F' }}>
                  {f.window}
                </div>
              </div>

              {/* Big number */}
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: 48,
                letterSpacing: '-0.01em',
                color: f.tc,
                lineHeight: 1,
                marginBottom: 10,
              }}>
                {f.stat}
              </div>

              <div style={{ fontSize: 12, color: '#7A8499', lineHeight: 1.5, marginBottom: 16 }}>
                {f.context}
              </div>

              {/* Tag */}
              <span style={{
                fontSize: 9,
                fontFamily: "'JetBrains Mono', monospace",
                color: f.tc,
                background: `${f.tc}14`,
                border: `1px solid ${f.tc}30`,
                borderRadius: 2,
                padding: '2px 6px',
                letterSpacing: '0.08em',
              }}>
                {f.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: '56px 48px',
        borderTop: '1px solid #1A2336',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 32,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 26,
            color: '#E8EBF2',
            letterSpacing: '-0.01em',
            marginBottom: 6,
          }}>
            Built for ops teams who need signal, not noise.
          </div>
          <div style={{ fontSize: 13, color: '#7A8499' }}>
            Real-time SLA tracking across every zone, every hour.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('signin')}
            style={{
              padding: '11px 28px',
              background: '#F5A623',
              border: 'none',
              borderRadius: 4,
              color: '#0D1119',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            SIGN IN →
          </button>
          <button
            style={{
              padding: '11px 20px',
              background: 'transparent',
              border: '1px solid #1A2336',
              borderRadius: 4,
              color: '#7A8499',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Request access
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '18px 48px',
        borderTop: '1px solid #141B27',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 10,
        fontFamily: "'JetBrains Mono', monospace",
        color: '#3D4A5F',
      }}>
        <span>PULSE · SLA OPS PLATFORM · INTERNAL</span>
        <span>v2.4.1 · JAN 2024</span>
      </footer>
    </div>
  )
}

import PulseStrip from '../components/PulseStrip'
import { ZONES, incidents, metrics } from '../data'

interface Props { navigate: (p: string) => void }

function tag(rate: number) {
  if (rate > 0.2)  return { l: 'CRITICAL', c: '#F5A623' }
  if (rate > 0.09) return { l: 'ELEVATED', c: '#F5A623' }
  return               { l: 'HEALTHY',  c: '#38A89D' }
}

export default function Dashboard({ navigate }: Props) {
  return (
    <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.12em', marginBottom: 6 }}>
            OPERATIONS CENTER
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 24, color: '#E8EBF2', margin: 0 }}>
            Dashboard
          </h1>
        </div>
        <div style={{ textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
          <div style={{ fontSize: 10, color: '#3D4A5F', marginBottom: 3 }}>MON 15 JAN 2024</div>
          <div style={{ fontSize: 17, color: '#C4CAD9' }}>17:32</div>
        </div>
      </div>

      {/* Metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { l: 'TOTAL ORDERS',    v: '4,821',   s: '↑ 4.2% vs. yesterday',   c: undefined    },
          { l: 'BREACH RATE',     v: '12.7%',   s: `${metrics.breachCount} breaches today`, c: '#F5A623' },
          { l: 'AVG DELIVERY',    v: '26.4 min', s: 'SLA target: 30 min',    c: '#38A89D' },
          { l: 'ACTIVE RIDERS',   v: '177',      s: 'across 6 zones',        c: undefined    },
        ].map(({ l, v, s, c }) => (
          <div key={l} style={{
            background: '#141B27',
            border: '1px solid #1A2336',
            borderRadius: 5,
            padding: '18px 20px',
          }}>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 10 }}>
              {l}
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: 30,
              color: c ?? '#E8EBF2',
              lineHeight: 1,
              marginBottom: 6,
            }}>
              {v}
            </div>
            <div style={{ fontSize: 10, color: '#3D4A5F', fontFamily: "'JetBrains Mono', monospace" }}>
              {s}
            </div>
          </div>
        ))}
      </div>

      {/* SLA Pulse Matrix */}
      <div style={{
        background: '#141B27',
        border: '1px solid #1A2336',
        borderRadius: 5,
        padding: '22px 24px 18px',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 4 }}>
              24H SLA PULSE MATRIX
            </div>
            <div style={{ fontSize: 14, fontFamily: "'Barlow', sans-serif", fontWeight: 600, color: '#C4CAD9' }}>
              Zone × Hour violation intensity · Today
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['TODAY', '7D AVG'].map((t, i) => (
              <span key={t} style={{
                padding: '4px 10px',
                border: '1px solid',
                borderColor: i === 0 ? '#242E40' : '#1A2336',
                borderRadius: 3,
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                color: i === 0 ? '#C4CAD9' : '#3D4A5F',
                cursor: 'pointer',
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <PulseStrip />
      </div>

      {/* Zone table + recent incidents */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>

        {/* Zone table */}
        <div style={{ background: '#141B27', border: '1px solid #1A2336', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1A2336' }}>
            <div style={{ fontSize: 13, fontFamily: "'Barlow', sans-serif", fontWeight: 600, color: '#C4CAD9' }}>
              Zone Performance
            </div>
            <button
              onClick={() => navigate('zones')}
              style={{ background: 'none', border: 'none', color: '#38A89D', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', letterSpacing: '0.06em' }}
            >
              ALL ZONES →
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['ZONE', 'AREA', 'RIDERS', 'ORDERS', 'BREACH', 'STATUS'].map(h => (
                  <th key={h} style={{ padding: '8px 20px', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', textAlign: 'left', fontWeight: 500, borderBottom: '1px solid #1A2336' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ZONES.map((z, i) => {
                const { l, c } = tag(z.breachRate)
                return (
                  <tr
                    key={z.id}
                    onClick={() => navigate('zones')}
                    style={{
                      borderBottom: i < ZONES.length - 1 ? '1px solid #141B27' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <td style={{ padding: '9px 20px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#C4CAD9', fontWeight: 500 }}>{z.id}</td>
                    <td style={{ padding: '9px 20px', fontSize: 12, color: '#7A8499' }}>{z.area}</td>
                    <td style={{ padding: '9px 20px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#C4CAD9' }}>{z.riders}</td>
                    <td style={{ padding: '9px 20px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#C4CAD9' }}>{z.totalOrders.toLocaleString()}</td>
                    <td style={{ padding: '9px 20px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: c, fontWeight: 500 }}>
                      {(z.breachRate * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '9px 20px' }}>
                      <span style={{
                        fontSize: 9,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: c,
                        background: `${c}14`,
                        border: `1px solid ${c}2A`,
                        borderRadius: 2,
                        padding: '2px 6px',
                        letterSpacing: '0.07em',
                      }}>
                        {l}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Recent incidents */}
        <div style={{ background: '#141B27', border: '1px solid #1A2336', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1A2336' }}>
            <div style={{ fontSize: 13, fontFamily: "'Barlow', sans-serif", fontWeight: 600, color: '#C4CAD9' }}>
              Recent Incidents
            </div>
            <button
              onClick={() => navigate('incidents')}
              style={{ background: 'none', border: 'none', color: '#38A89D', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer', letterSpacing: '0.06em' }}
            >
              ALL →
            </button>
          </div>
          {incidents.slice(0, 8).map((inc, i) => (
            <div key={inc.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '11px 20px',
              borderBottom: i < 7 ? '1px solid #1A2336' : 'none',
            }}>
              <div style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                marginTop: 5,
                flexShrink: 0,
                background: inc.breach
                  ? inc.severity === 'high' ? '#F5A623' : 'rgba(245,166,35,0.5)'
                  : '#38A89D',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#C4CAD9' }}>
                    {inc.id}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: inc.breach ? '#F5A623' : '#38A89D', flexShrink: 0 }}>
                    {inc.breach ? `+${inc.actualTime - inc.slaTarget}m` : '✓'}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#3D4A5F', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                  {inc.zone} · {inc.timestamp.split(' ')[1]} · {inc.riderId}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

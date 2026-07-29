import { ZONES, slaMatrix, heatColor } from '../data'

function seeded(n: number): number {
  const x = Math.sin(n * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function weeklyRates(zi: number): number[] {
  const mults = [0.62, 0.77, 1.21, 0.52, 0.88, 0.70]
  return [0.09, 0.11, 0.13, 0.08, 0.16, 0.21, 0.14].map((r, d) =>
    Math.min(0.98, r * mults[zi] * (1 + (seeded(d * 7 + zi * 3) - 0.5) * 0.2))
  )
}

export default function Reports() {
  const avgByHour = Array.from({ length: 24 }, (_, h) => {
    const sum = slaMatrix.reduce((acc, row) => acc + row[h], 0)
    return sum / slaMatrix.length
  })
  const peakH = avgByHour.indexOf(Math.max(...avgByHour))

  return (
    <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.12em', marginBottom: 6 }}>ANALYTICS</div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 24, color: '#E8EBF2', margin: 0 }}>Reports</h1>
      </div>

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
        {['Today', 'Last 7d', 'Last 30d', 'Custom'].map((p, i) => (
          <button key={p} style={{
            padding: '6px 14px',
            borderRadius: 3,
            border: '1px solid',
            borderColor: i === 1 ? 'rgba(245,166,35,0.3)' : '#1A2336',
            background: i === 1 ? 'rgba(245,166,35,0.06)' : 'transparent',
            color: i === 1 ? '#F5A623' : '#7A8499',
            fontSize: 12,
            cursor: 'pointer',
          }}>
            {p}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { l: 'TOTAL ORDERS',    v: '33,748',  d: '↑ 6.1% WoW',      c: undefined  },
          { l: 'AVG BREACH RATE', v: '11.4%',   d: '↑ 1.3 pts WoW',   c: '#F5A623' },
          { l: 'AVG DELIVERY',    v: '25.8 min', d: '↓ 0.6 min WoW',  c: '#38A89D' },
          { l: 'TOTAL RIDERS',    v: '177',      d: '↑ 4 vs. last week', c: undefined },
        ].map(({ l, v, d, c }) => (
          <div key={l} style={{ background: '#141B27', border: '1px solid #1A2336', borderRadius: 5, padding: '18px 20px' }}>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 10 }}>{l}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 28, color: c ?? '#E8EBF2', lineHeight: 1, marginBottom: 6 }}>{v}</div>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F' }}>{d}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Hourly breach */}
        <div style={{ background: '#141B27', border: '1px solid #1A2336', borderRadius: 5, padding: '22px 24px' }}>
          <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 4 }}>FLEET-WIDE BREACH BY HOUR</div>
          <div style={{ fontSize: 13, fontFamily: "'Barlow', sans-serif", fontWeight: 600, color: '#C4CAD9', marginBottom: 20 }}>7-day average, all zones</div>

          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 72 }}>
            {avgByHour.map((v, h) => (
              <div key={h} title={`${String(h).padStart(2,'0')}:00 · ${Math.round(v*100)}%`} style={{
                flex: 1,
                height: `${Math.max(4, v * 100)}%`,
                background: heatColor(v),
                borderRadius: '2px 2px 0 0',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 8, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F' }}>
            <span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span>
          </div>

          <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(245,166,35,0.04)', border: '1px solid rgba(245,166,35,0.12)', borderRadius: 3, fontSize: 10, color: '#7A8499', fontFamily: "'JetBrains Mono', monospace" }}>
            Peak: <span style={{ color: '#F5A623' }}>{String(peakH).padStart(2,'0')}:00</span>
            {'  ·  '}avg breach <span style={{ color: '#F5A623' }}>{Math.round(avgByHour[peakH] * 100)}%</span>
          </div>
        </div>

        {/* Zone ranking */}
        <div style={{ background: '#141B27', border: '1px solid #1A2336', borderRadius: 5, padding: '22px 24px' }}>
          <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 4 }}>ZONE BREACH RANKING</div>
          <div style={{ fontSize: 13, fontFamily: "'Barlow', sans-serif", fontWeight: 600, color: '#C4CAD9', marginBottom: 20 }}>Last 7 days</div>

          {[...ZONES].sort((a, b) => b.breachRate - a.breachRate).map((z, i) => {
            const c = z.breachRate > 0.2 ? '#F5A623' : z.breachRate > 0.1 ? '#F5A623' : '#38A89D'
            return (
              <div key={z.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < ZONES.length - 1 ? 12 : 0 }}>
                <div style={{ fontSize: 9, color: '#3D4A5F', fontFamily: "'JetBrains Mono', monospace", width: 14 }}>{i + 1}</div>
                <div style={{ fontSize: 11, color: '#C4CAD9', fontFamily: "'JetBrains Mono', monospace", width: 14 }}>{z.id}</div>
                <div style={{ flex: 1, height: 4, background: '#1A2336', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(z.breachRate / 0.35) * 100}%`, background: c, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: c, width: 36, textAlign: 'right' }}>
                  {(z.breachRate * 100).toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly by zone */}
      <div style={{ background: '#141B27', border: '1px solid #1A2336', borderRadius: 5, padding: '22px 24px' }}>
        <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 4 }}>WEEKLY BREACH TREND BY ZONE</div>
        <div style={{ fontSize: 13, fontFamily: "'Barlow', sans-serif", fontWeight: 600, color: '#C4CAD9', marginBottom: 20 }}>Mon–Sun · Last 7 days</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
          {ZONES.map((z, zi) => {
            const rates = weeklyRates(zi)
            return (
              <div key={z.id}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#C4CAD9', marginBottom: 4 }}>{z.id}</div>
                <div style={{ fontSize: 9, color: '#3D4A5F', marginBottom: 10 }}>{z.area.split(' ')[0]}</div>
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 36 }}>
                  {rates.map((r, d) => (
                    <div key={d} style={{ flex: 1, height: `${Math.max(8, r * 100)}%`, background: heatColor(r), borderRadius: '1px 1px 0 0' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 7, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F' }}>
                  {['M','T','W','T','F','S','S'].map((d, i) => <span key={i}>{d}</span>)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

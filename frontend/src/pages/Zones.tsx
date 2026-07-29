import { useState } from 'react'
import { ZONES, slaMatrix, heatColor, Zone } from '../data'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function MiniSpark({ values }: { values: number[] }) {
  return (
    <div style={{ display: 'flex', gap: 1, alignItems: 'flex-end', height: 24 }}>
      {values.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${Math.max(8, v * 100)}%`,
          background: heatColor(v),
          borderRadius: '1px 1px 0 0',
        }} />
      ))}
    </div>
  )
}

function statusFor(r: number) {
  if (r > 0.2)  return { l: 'CRITICAL', c: '#F5A623' }
  if (r > 0.09) return { l: 'ELEVATED', c: '#F5A623' }
  return               { l: 'HEALTHY',  c: '#38A89D' }
}

function ZoneCard({ zone, zi, onSelect }: { zone: Zone; zi: number; onSelect: () => void }) {
  const { l, c } = statusFor(zone.breachRate)
  return (
    <div
      onClick={onSelect}
      style={{
        background: '#141B27',
        border: '1px solid #1A2336',
        borderRadius: 5,
        padding: '20px',
        cursor: 'pointer',
        transition: 'border-color 0.12s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#E8EBF2', letterSpacing: '0.02em' }}>
            {zone.name}
          </div>
          <div style={{ fontSize: 11, color: '#7A8499', marginTop: 2 }}>{zone.area}</div>
        </div>
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
      </div>

      <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
        {[
          { l: 'BREACH',  v: `${(zone.breachRate*100).toFixed(1)}%`, c },
          { l: 'RIDERS',  v: String(zone.riders),                   c: '#C4CAD9' },
          { l: 'AVG',     v: `${zone.avgDelivery}m`,                c: zone.avgDelivery > 30 ? '#F5A623' : '#38A89D' },
        ].map(({ l: lbl, v, c: vc }) => (
          <div key={lbl}>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 4 }}>{lbl}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, color: vc, lineHeight: 1 }}>{v}</div>
          </div>
        ))}
      </div>

      <MiniSpark values={slaMatrix[zi]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 8, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F' }}>
        <span>00h</span><span>12h</span><span>23h</span>
      </div>
    </div>
  )
}

function ZoneModal({ zone, zi, onClose }: { zone: Zone; zi: number; onClose: () => void }) {
  const data = slaMatrix[zi]
  const peakH = data.indexOf(Math.max(...data))

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,15,24,0.88)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#141B27',
        border: '1px solid #1A2336',
        borderRadius: 6,
        padding: '32px',
        width: '90%',
        maxWidth: 700,
        maxHeight: '88vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 26, color: '#E8EBF2' }}>
              {zone.name}
            </div>
            <div style={{ fontSize: 12, color: '#7A8499', marginTop: 2 }}>{zone.area}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#7A8499', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
          {[
            { l: 'BREACH RATE',   v: `${(zone.breachRate*100).toFixed(1)}%`, c: zone.breachRate > 0.2 ? '#F5A623' : '#38A89D' },
            { l: 'TOTAL ORDERS',  v: zone.totalOrders.toLocaleString(),        c: '#C4CAD9' },
            { l: 'AVG DELIVERY',  v: `${zone.avgDelivery} min`,                c: zone.avgDelivery > 30 ? '#F5A623' : '#38A89D' },
            { l: 'ACTIVE RIDERS', v: String(zone.riders),                      c: '#C4CAD9' },
            { l: 'PEAK HOUR',     v: `${String(peakH).padStart(2,'0')}:00`,    c: '#F5A623' },
            { l: 'PEAK BREACH',   v: `${Math.round(data[peakH]*100)}%`,        c: '#F5A623' },
          ].map(({ l: lbl, v, c }) => (
            <div key={lbl} style={{ background: '#0D1119', borderRadius: 4, padding: '14px 16px' }}>
              <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 8 }}>{lbl}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, color: c, lineHeight: 1 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Hour breakdown */}
        <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 10 }}>
          HOUR-BY-HOUR BREACH RATE
        </div>
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 72, marginBottom: 6 }}>
          {data.map((v, h) => (
            <div key={h} title={`${String(h).padStart(2,'0')}:00 · ${Math.round(v*100)}%`} style={{
              flex: 1,
              height: `${Math.max(4, v * 100)}%`,
              background: heatColor(v),
              borderRadius: '2px 2px 0 0',
              cursor: 'default',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F' }}>
          {HOURS.filter(h => h % 6 === 0 || h === 23).map(h => (
            <span key={h}>{String(h).padStart(2,'0')}h</span>
          ))}
        </div>

        {zone.breachRate > 0.1 && (
          <div style={{ marginTop: 18, padding: '12px 14px', background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.15)', borderRadius: 4, fontSize: 12, color: '#7A8499', lineHeight: 1.5 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#F5A623', letterSpacing: '0.08em' }}>SIGNAL · </span>
            Peak window{' '}
            <strong style={{ color: '#C4CAD9' }}>{String(peakH).padStart(2,'0')}:00–{String(Math.min(23, peakH + 2)).padStart(2,'0')}:00</strong>
            {' '}shows a {Math.round(data[peakH] * 100)}% breach rate.
            {zone.breachRate > 0.25 ? ' Immediate rider reallocation recommended.' : ' Monitor for further escalation.'}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Zones() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.12em', marginBottom: 6 }}>
          DELIVERY NETWORK
        </div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 24, color: '#E8EBF2', margin: 0 }}>
          Zone Management
        </h1>
      </div>

      {/* Summary bar */}
      <div style={{ background: '#141B27', border: '1px solid #1A2336', borderRadius: 5, padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 36, flexWrap: 'wrap' }}>
        {[
          { l: 'TOTAL ZONES', v: '6',    c: undefined },
          { l: 'CRITICAL',    v: '1',    c: '#F5A623' },
          { l: 'ELEVATED',    v: '2',    c: '#F5A623' },
          { l: 'HEALTHY',     v: '3',    c: '#38A89D' },
          { l: 'TOTAL RIDERS',v: '177',  c: undefined },
          { l: 'FLEET UTIL',  v: '84%',  c: '#38A89D' },
        ].map(({ l, v, c }) => (
          <div key={l}>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 4 }}>{l}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 19, color: c ?? '#C4CAD9' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {ZONES.map((zone, zi) => (
          <ZoneCard key={zone.id} zone={zone} zi={zi} onSelect={() => setSelected(zi)} />
        ))}
      </div>

      {selected !== null && (
        <ZoneModal zone={ZONES[selected]} zi={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  )
}

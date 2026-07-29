import { useState, useMemo, type CSSProperties } from 'react'
import { incidents, Incident } from '../data'

type Sort = 'timestamp' | 'zone' | 'actualTime' | 'severity'
const SEV = { high: 0, medium: 1, low: 2 }

function Badge({ inc }: { inc: Incident }) {
  if (!inc.breach) return (
    <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#38A89D', background: 'rgba(56,168,157,0.1)', border: '1px solid rgba(56,168,157,0.2)', borderRadius: 2, padding: '2px 6px', letterSpacing: '0.07em' }}>
      ON-TIME
    </span>
  )
  const cfg = {
    high:   { c: '#F5A623', bg: 'rgba(245,166,35,0.1)',  bo: 'rgba(245,166,35,0.25)', l: 'HIGH'   },
    medium: { c: '#F5A623', bg: 'rgba(245,166,35,0.06)', bo: 'rgba(245,166,35,0.15)', l: 'MEDIUM' },
    low:    { c: '#7A8499', bg: 'rgba(122,132,153,0.06)',bo: 'rgba(122,132,153,0.15)',l: 'LOW'    },
  }[inc.severity]
  return (
    <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: cfg.c, background: cfg.bg, border: `1px solid ${cfg.bo}`, borderRadius: 2, padding: '2px 6px', letterSpacing: '0.07em' }}>
      {cfg.l}
    </span>
  )
}

export default function Incidents() {
  const [zone, setZone]         = useState('ALL')
  const [breach, setBreach]     = useState<'all'|'breach'|'ok'>('all')
  const [sev, setSev]           = useState<'all'|'high'|'medium'|'low'>('all')
  const [sortKey, setSortKey]   = useState<Sort>('timestamp')
  const [asc, setAsc]           = useState(false)
  const [q, setQ]               = useState('')

  const zones = ['ALL', ...Array.from(new Set(incidents.map(i => i.zone))).sort()]

  const filtered = useMemo(() => {
    let d = incidents.filter(inc => {
      if (zone !== 'ALL' && inc.zone !== zone) return false
      if (breach === 'breach' && !inc.breach) return false
      if (breach === 'ok' && inc.breach) return false
      if (sev !== 'all' && inc.severity !== sev) return false
      if (q) {
        const ql = q.toLowerCase()
        if (!inc.id.toLowerCase().includes(ql) &&
            !inc.orderId.toLowerCase().includes(ql) &&
            !inc.riderId.toLowerCase().includes(ql) &&
            !inc.zone.toLowerCase().includes(ql)) return false
      }
      return true
    })
    return [...d].sort((a, b) => {
      let c = 0
      if (sortKey === 'timestamp')  c = a.timestamp.localeCompare(b.timestamp)
      if (sortKey === 'zone')       c = a.zone.localeCompare(b.zone)
      if (sortKey === 'actualTime') c = a.actualTime - b.actualTime
      if (sortKey === 'severity')   c = SEV[a.severity] - SEV[b.severity]
      return asc ? c : -c
    })
  }, [zone, breach, sev, sortKey, asc, q])

  const sort = (k: Sort) => { if (sortKey === k) setAsc(p => !p); else { setSortKey(k); setAsc(false) } }

  const selStyle: CSSProperties = {
    background: '#0D1119',
    border: '1px solid #1A2336',
    borderRadius: 3,
    color: '#C4CAD9',
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    padding: '7px 10px',
    cursor: 'pointer',
  }

  const TH = ({ label, k }: { label: string; k?: Sort }) => (
    <th
      onClick={k ? () => sort(k) : undefined}
      style={{
        padding: '8px 16px',
        fontSize: 9,
        fontFamily: "'JetBrains Mono', monospace",
        color: sortKey === k ? '#C4CAD9' : '#3D4A5F',
        letterSpacing: '0.1em',
        textAlign: 'left',
        fontWeight: 500,
        cursor: k ? 'pointer' : 'default',
        userSelect: 'none',
        borderBottom: '1px solid #1A2336',
        whiteSpace: 'nowrap',
      }}
    >
      {label}{k && sortKey === k ? (asc ? ' ↑' : ' ↓') : ''}
    </th>
  )

  return (
    <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.12em', marginBottom: 6 }}>INCIDENT REGISTRY</div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 24, color: '#E8EBF2', margin: 0 }}>Incidents</h1>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", textAlign: 'right' }}>
          <div style={{ fontSize: 13, color: '#C4CAD9' }}>{filtered.length} records</div>
          <div style={{ fontSize: 10, color: filtered.filter(i => i.breach).length > 0 ? '#F5A623' : '#38A89D', marginTop: 2 }}>
            {filtered.filter(i => i.breach).length} breaches
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#141B27', border: '1px solid #1A2336', borderRadius: 5, padding: '12px 16px', marginBottom: 14, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search ID, order, rider…"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{ ...selStyle, flex: '1 1 180px' }}
        />
        <select value={zone} onChange={e => setZone(e.target.value)} style={selStyle}>
          {zones.map(z => <option key={z}>{z}</option>)}
        </select>
        <select value={breach} onChange={e => setBreach(e.target.value as typeof breach)} style={selStyle}>
          <option value="all">All status</option>
          <option value="breach">Breach only</option>
          <option value="ok">On-time only</option>
        </select>
        <select value={sev} onChange={e => setSev(e.target.value as typeof sev)} style={selStyle}>
          <option value="all">All severity</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {(zone !== 'ALL' || breach !== 'all' || sev !== 'all' || q) && (
          <button
            onClick={() => { setZone('ALL'); setBreach('all'); setSev('all'); setQ('') }}
            style={{ ...selStyle, color: '#7A8499', padding: '7px 8px' }}
          >
            Clear ×
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#141B27', border: '1px solid #1A2336', borderRadius: 5, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <TH label="TIMESTAMP"  k="timestamp"  />
              <TH label="ZONE"       k="zone"        />
              <TH label="INC ID"                     />
              <TH label="ORDER"                       />
              <TH label="RIDER"                       />
              <TH label="TARGET"                      />
              <TH label="ACTUAL"     k="actualTime"  />
              <TH label="OVERRUN"                     />
              <TH label="STATUS"     k="severity"    />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: '36px', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#3D4A5F' }}>
                  No incidents match the current filters.
                </td>
              </tr>
            )}
            {filtered.map((inc, i) => (
              <tr key={inc.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1A2336' : 'none' }}>
                <td style={{ padding: '9px 16px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499', whiteSpace: 'nowrap' }}>{inc.timestamp}</td>
                <td style={{ padding: '9px 16px', fontSize: 12, color: '#C4CAD9' }}>{inc.zone}</td>
                <td style={{ padding: '9px 16px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#C4CAD9', whiteSpace: 'nowrap' }}>{inc.id}</td>
                <td style={{ padding: '9px 16px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499', whiteSpace: 'nowrap' }}>{inc.orderId}</td>
                <td style={{ padding: '9px 16px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499', whiteSpace: 'nowrap' }}>{inc.riderId}</td>
                <td style={{ padding: '9px 16px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499', textAlign: 'right' }}>{inc.slaTarget}m</td>
                <td style={{ padding: '9px 16px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: inc.breach ? '#F5A623' : '#38A89D', textAlign: 'right', fontWeight: inc.breach ? 500 : 400 }}>{inc.actualTime}m</td>
                <td style={{ padding: '9px 16px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: inc.breach ? '#F5A623' : '#3D4A5F', textAlign: 'right' }}>
                  {inc.breach ? `+${inc.actualTime - inc.slaTarget}m` : '—'}
                </td>
                <td style={{ padding: '9px 16px' }}><Badge inc={inc} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 10, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', textAlign: 'right' }}>
        {filtered.length} of {incidents.length} incidents · Jan 13–15, 2024
      </div>
    </main>
  )
}

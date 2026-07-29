import { useState, useEffect, type CSSProperties } from 'react'
import { ZONES, slaMatrix, heatColor } from '../data'

interface Tip { zone: string; hour: number; v: number; x: number; y: number }

interface PulseStripProps {
  compact?: boolean
  cellH?: number
}

// Scan line settles at hour 17.5 (5:30 PM) = 72.9 % of 24h
const NOW_PCT = (17.5 / 24) * 100

export default function PulseStrip({ compact = false, cellH }: PulseStripProps) {
  const [settled, setSettled] = useState(false)
  const [tip, setTip] = useState<Tip | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 3400)
    return () => clearTimeout(t)
  }, [])

  const rowH  = cellH ?? (compact ? 20 : 32)
  const gap   = compact ? 1 : 2
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const lineStyle: CSSProperties = settled
    ? { left: `${NOW_PCT}%`, animation: 'scanSettle 2.4s ease-in-out infinite' }
    : { left: 0, animation: 'scanSweep 3.2s cubic-bezier(0.16,1,0.3,1) forwards' }

  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      {/* Hour axis */}
      {!compact && (
        <div style={{ display: 'flex', paddingLeft: 44, marginBottom: 6 }}>
          {hours.map(h => (
            <div key={h} style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 9,
              fontFamily: "'JetBrains Mono', monospace",
              color: h % 6 === 0 ? '#7A8499' : 'transparent',
              letterSpacing: '0.04em',
            }}>
              {String(h).padStart(2, '0')}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex' }}>
        {/* Zone labels */}
        {!compact && (
          <div style={{ width: 44, flexShrink: 0, display: 'flex', flexDirection: 'column', gap }}>
            {ZONES.map(z => (
              <div key={z.id} style={{
                height: rowH,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 8,
                fontSize: 9,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#7A8499',
                letterSpacing: '0.06em',
              }}>
                {z.id}
              </div>
            ))}
          </div>
        )}

        {/* Grid + scan-line */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap }}>
            {ZONES.map((zone, zi) => (
              <div key={zone.id} style={{ display: 'flex', gap: 1 }}>
                {hours.map(h => {
                  const v = slaMatrix[zi][h]
                  return (
                    <div
                      key={h}
                      style={{
                        flex: 1,
                        height: rowH,
                        backgroundColor: heatColor(v),
                        borderRadius: 1,
                        cursor: compact ? 'default' : 'crosshair',
                      }}
                      onMouseEnter={e => {
                        if (compact) return
                        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                        setTip({ zone: zone.name, hour: h, v, x: r.left + r.width / 2, y: r.top })
                      }}
                      onMouseLeave={() => setTip(null)}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Scan line */}
          <div style={{
            position: 'absolute',
            inset: '0 auto 0 0',
            width: 1,
            background: '#F5A623',
            boxShadow: '0 0 6px rgba(245,166,35,0.6)',
            pointerEvents: 'none',
            ...lineStyle,
          }} />

          {/* NOW label */}
          {settled && !compact && (
            <div style={{
              position: 'absolute',
              top: -18,
              left: `${NOW_PCT}%`,
              transform: 'translateX(-50%)',
              fontSize: 8,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#F5A623',
              letterSpacing: '0.1em',
              opacity: 0.8,
              pointerEvents: 'none',
            }}>
              NOW
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {!compact && (
        <div style={{ display: 'flex', gap: 20, marginTop: 12, paddingLeft: 44 }}>
          {[
            { bg: 'rgba(56,168,157,0.8)', label: 'ON-TIME' },
            { bg: 'rgba(245,166,35,0.9)', label: 'SLA BREACH' },
          ].map(({ bg, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499', letterSpacing: '0.08em' }}>
              <div style={{ width: 20, height: 5, borderRadius: 1, background: bg }} />
              {label}
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499' }}>
            hover for detail
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tip && (
        <div style={{
          position: 'fixed',
          left: tip.x,
          top: tip.y - 44,
          transform: 'translateX(-50%)',
          zIndex: 200,
          background: '#1A2336',
          border: '1px solid #242E40',
          borderRadius: 4,
          padding: '6px 10px',
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          <span style={{ color: '#7A8499' }}>{tip.zone} · {String(tip.hour).padStart(2,'0')}:00</span>
          <span style={{ marginLeft: 10, color: tip.v > 0.5 ? '#F5A623' : '#38A89D', fontWeight: 500 }}>
            {Math.round(tip.v * 100)}%
          </span>
        </div>
      )}
    </div>
  )
}

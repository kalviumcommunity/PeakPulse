import { useState, useEffect } from 'react';
import { analyticsAPI, type OverviewStats, type HourlyAnalytics, type PeakComparison, type RiskPattern } from '../lib/api';

interface Props { navigate: (p: string) => void }

export default function OperationsDashboard({ navigate }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [zone, setZone] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [riderId, setRiderId] = useState('');
  const [peakFilter, setPeakFilter] = useState<'all' | 'peak' | 'nonpeak'>('all');
  
  // Data state
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyAnalytics[]>([]);
  const [peakComparison, setPeakComparison] = useState<PeakComparison | null>(null);
  const [riskPatterns, setRiskPatterns] = useState<RiskPattern[]>([]);

  // Fetch data
  useEffect(() => {
    fetchDashboardData();
  }, [startDate, endDate, zone, restaurantId, riderId, peakFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateFilter = {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      };

      const peakHourFilter = {
        ...dateFilter,
        ...(zone && { zone }),
        ...(restaurantId && { restaurantId }),
        ...(riderId && { riderId }),
      };

      const [overviewData, hourlyAnalytics, comparison, patterns] = await Promise.all([
        analyticsAPI.getOverview(dateFilter),
        analyticsAPI.getHourlyAnalytics(peakHourFilter),
        analyticsAPI.getPeakComparison(peakHourFilter),
        analyticsAPI.getRiskPatterns(peakHourFilter),
      ]);

      setOverview(overviewData);
      
      // Filter hourly data based on peak filter
      let filteredHourly = hourlyAnalytics;
      if (peakFilter === 'peak') {
        filteredHourly = hourlyAnalytics.filter(h => h.peakHour);
      } else if (peakFilter === 'nonpeak') {
        filteredHourly = hourlyAnalytics.filter(h => !h.peakHour);
      }
      setHourlyData(filteredHourly);
      
      setPeakComparison(comparison);
      setRiskPatterns(patterns);
      
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setZone('');
    setRestaurantId('');
    setRiderId('');
    setPeakFilter('all');
  };

  if (loading && !overview) {
    return (
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 36px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#7A8499', fontFamily: "'JetBrains Mono', monospace" }}>
            Loading dashboard...
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ flex: 1, padding: '32px 36px' }}>
        <div style={{
          background: '#141B27',
          border: '1px solid #F5A623',
          borderRadius: 5,
          padding: '20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: '#F5A623', marginBottom: 8 }}>Error Loading Dashboard</div>
          <div style={{ fontSize: 12, color: '#7A8499', marginBottom: 16 }}>{error}</div>
          <button
            onClick={fetchDashboardData}
            style={{
              padding: '8px 16px',
              background: '#141B27',
              border: '1px solid #242E40',
              borderRadius: 4,
              color: '#C4CAD9',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.12em', marginBottom: 6 }}>
            OPERATIONS CENTER
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 24, color: '#E8EBF2', margin: 0 }}>
            Analytics Dashboard
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: '#141B27',
        border: '1px solid #1A2336',
        borderRadius: 5,
        padding: '16px 20px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 140px' }}>
            <label style={{ display: 'block', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499', marginBottom: 4, letterSpacing: '0.08em' }}>
              START DATE
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label style={{ display: 'block', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499', marginBottom: 4, letterSpacing: '0.08em' }}>
              END DATE
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ display: 'block', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499', marginBottom: 4, letterSpacing: '0.08em' }}>
              ZONE
            </label>
            <input
              type="text"
              placeholder="A, B, C..."
              value={zone}
              onChange={e => setZone(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label style={{ display: 'block', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499', marginBottom: 4, letterSpacing: '0.08em' }}>
              RESTAURANT ID
            </label>
            <input
              type="text"
              placeholder="ID"
              value={restaurantId}
              onChange={e => setRestaurantId(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ display: 'block', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499', marginBottom: 4, letterSpacing: '0.08em' }}>
              RIDER ID
            </label>
            <input
              type="text"
              placeholder="ID"
              value={riderId}
              onChange={e => setRiderId(e.target.value)}
              style={{ width: '100%', padding: '6px 8px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label style={{ display: 'block', fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499', marginBottom: 4, letterSpacing: '0.08em' }}>
              TIME PERIOD
            </label>
            <select
              value={peakFilter}
              onChange={e => setPeakFilter(e.target.value as any)}
              style={{ width: '100%', padding: '6px 8px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
            >
              <option value="all">All Hours</option>
              <option value="peak">Peak Only</option>
              <option value="nonpeak">Non-Peak</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #242E40',
              borderRadius: 4,
              color: '#7A8499',
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
              letterSpacing: '0.06em',
            }}
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {overview && [
          { l: 'TOTAL DELIVERIES', v: overview.totalDeliveries.toLocaleString(), s: `${overview.deliveredDeliveries} completed` },
          { l: 'SLA BREACH RATE', v: `${overview.slaBreachPercentage.toFixed(1)}%`, s: `${overview.slaBreaches} breaches`, c: overview.slaBreachPercentage > 15 ? '#F5A623' : '#38A89D' },
          { l: 'AVERAGE DELAY', v: `${overview.averageDelay.toFixed(1)} min`, s: 'for breached orders', c: overview.averageDelay > 10 ? '#F5A623' : '#38A89D' },
          { l: 'COMPLAINT RATE', v: `${overview.complaintRate.toFixed(1)}%`, s: `${overview.complaintCount} complaints`, c: overview.complaintRate > 5 ? '#F5A623' : '#7A8499' },
          { l: 'REFUND RATE', v: `${overview.refundRate.toFixed(1)}%`, s: `${overview.refundCount} refunds`, c: overview.refundRate > 3 ? '#F5A623' : '#7A8499' },
        ].map(({ l, v, s, c }) => (
          <div key={l} style={{
            background: '#141B27',
            border: '1px solid #1A2336',
            borderRadius: 5,
            padding: '16px 18px',
          }}>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 8 }}>
              {l}
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: 26,
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

      {/* SLA Performance Trend (Hourly) */}
      <div style={{
        background: '#141B27',
        border: '1px solid #1A2336',
        borderRadius: 5,
        padding: '20px 24px',
        marginBottom: 20,
      }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 4 }}>
            SLA PERFORMANCE TREND
          </div>
          <div style={{ fontSize: 14, fontFamily: "'Barlow', sans-serif", fontWeight: 600, color: '#C4CAD9' }}>
            Hourly breach rate distribution
          </div>
        </div>
        
        {hourlyData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#3D4A5F', fontSize: 12 }}>
            No hourly data available for the selected filters
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 180 }}>
            {hourlyData.map(h => {
              const maxRate = Math.max(...hourlyData.map(d => d.slaBreachRate), 20);
              const heightPct = (h.slaBreachRate / maxRate) * 100;
              const color = h.peakHour ? '#F5A623' : '#38A89D';
              
              return (
                <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%',
                    height: `${heightPct}%`,
                    minHeight: h.totalDeliveries > 0 ? 4 : 0,
                    background: h.totalDeliveries > 0 ? color : '#1A2336',
                    borderRadius: '2px 2px 0 0',
                    opacity: h.totalDeliveries > 0 ? 0.85 : 0.2,
                    position: 'relative',
                  }} title={`Hour ${h.hour}: ${h.slaBreachRate.toFixed(1)}% breach (${h.totalDeliveries} orders)`} />
                  <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: h.peakHour ? '#F5A623' : '#3D4A5F' }}>
                    {h.hour}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 12, borderTop: '1px solid #1A2336' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499' }}>
            <div style={{ width: 12, height: 4, background: '#F5A623', borderRadius: 1 }} />
            PEAK HOURS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499' }}>
            <div style={{ width: 12, height: 4, background: '#38A89D', borderRadius: 1 }} />
            NON-PEAK
          </div>
        </div>
      </div>

      {/* Peak vs Non-Peak Comparison */}
      {peakComparison && (
        <div style={{
          background: '#141B27',
          border: '1px solid #1A2336',
          borderRadius: 5,
          padding: '20px 24px',
          marginBottom: 20,
        }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 4 }}>
              PEAK vs NON-PEAK ANALYSIS
            </div>
            <div style={{ fontSize: 14, fontFamily: "'Barlow', sans-serif", fontWeight: 600, color: '#C4CAD9' }}>
              Performance comparison by time period
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { label: 'PEAK HOURS', data: peakComparison.peak, color: '#F5A623' },
              { label: 'NON-PEAK', data: peakComparison.nonPeak, color: '#38A89D' },
            ].map(({ label, data, color }) => (
              <div key={label} style={{
                background: '#0D1119',
                border: `1px solid ${color}33`,
                borderRadius: 4,
                padding: '16px',
              }}>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color, letterSpacing: '0.1em', marginBottom: 12 }}>
                  {label}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#3D4A5F', marginBottom: 4 }}>Deliveries</div>
                    <div style={{ fontSize: 18, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#C4CAD9' }}>
                      {data.totalDeliveries.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#3D4A5F', marginBottom: 4 }}>Breaches</div>
                    <div style={{ fontSize: 18, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color }}>
                      {data.slaBreaches}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#3D4A5F', marginBottom: 4 }}>Breach Rate</div>
                    <div style={{ fontSize: 18, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color }}>
                      {data.slaBreachRate.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#3D4A5F', marginBottom: 4 }}>Avg Delay</div>
                    <div style={{ fontSize: 18, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: '#C4CAD9' }}>
                      {data.averageDelay.toFixed(1)}m
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, textAlign: 'center', padding: '12px', background: '#0D1119', borderRadius: 4 }}>
            <span style={{ fontSize: 11, color: '#7A8499', fontFamily: "'JetBrains Mono', monospace" }}>
              Breach Rate Difference: 
            </span>
            <span style={{
              marginLeft: 8,
              fontSize: 16,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              color: peakComparison.breachRateDifference > 5 ? '#F5A623' : '#38A89D',
            }}>
              {peakComparison.breachRateDifference > 0 ? '+' : ''}{peakComparison.breachRateDifference.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* High-Risk Patterns Table */}
      <div style={{
        background: '#141B27',
        border: '1px solid #1A2336',
        borderRadius: 5,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1A2336' }}>
          <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#3D4A5F', letterSpacing: '0.1em', marginBottom: 4 }}>
            HIGH-RISK PATTERNS
          </div>
          <div style={{ fontSize: 14, fontFamily: "'Barlow', sans-serif", fontWeight: 600, color: '#C4CAD9' }}>
            Critical combinations requiring attention
          </div>
        </div>

        {riskPatterns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#3D4A5F', fontSize: 12 }}>
            No risk patterns identified for the selected filters
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['PATTERN', 'DELIVERIES', 'BREACHES', 'BREACH RATE', 'RISK'].map(h => (
                  <th key={h} style={{
                    padding: '10px 20px',
                    fontSize: 9,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#3D4A5F',
                    letterSpacing: '0.1em',
                    textAlign: 'left',
                    fontWeight: 500,
                    borderBottom: '1px solid #1A2336',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riskPatterns.slice(0, 10).map((pattern, i) => {
                const riskLevel = pattern.slaBreachRate > 30 ? 'HIGH' : pattern.slaBreachRate > 15 ? 'MEDIUM' : 'LOW';
                const riskColor = riskLevel === 'HIGH' ? '#F5A623' : riskLevel === 'MEDIUM' ? '#F5A623' : '#38A89D';
                
                return (
                  <tr key={i} style={{ borderBottom: i < riskPatterns.length - 1 ? '1px solid #0D1119' : 'none' }}>
                    <td style={{ padding: '12px 20px', fontSize: 12, color: '#C4CAD9' }}>
                      {pattern.pattern}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499' }}>
                      {pattern.totalDeliveries}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#7A8499' }}>
                      {pattern.slaBreaches}
                    </td>
                    <td style={{ padding: '12px 20px', fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: riskColor, fontWeight: 500 }}>
                      {pattern.slaBreachRate.toFixed(1)}%
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        fontSize: 9,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: riskColor,
                        background: `${riskColor}14`,
                        border: `1px solid ${riskColor}2A`,
                        borderRadius: 2,
                        padding: '2px 6px',
                        letterSpacing: '0.07em',
                      }}>
                        {riskLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

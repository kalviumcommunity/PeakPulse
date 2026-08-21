import { useState, useEffect } from 'react';
import {
  riskAPI,
  DeliveryRiskAssessment,
  RiskSummary,
  RiskLevel
} from '../lib/api';

interface Props {
  navigate?: (page: string) => void;
}

export default function RiskMonitor({ navigate }: Props) {
  const [deliveries, setDeliveries] = useState<DeliveryRiskAssessment[]>([]);
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRiskAssessment | null>(null);
  const [activeTab, setActiveTab] = useState<'monitor' | 'simulator'>('monitor');

  // Simulation State
  const [simDistance, setSimDistance] = useState<number>(4.5);
  const [simZone, setSimZone] = useState<string>('Downtown Zone A');
  const [simVehicle, setSimVehicle] = useState<string>('BIKE');
  const [simHour, setSimHour] = useState<number>(20);
  const [simDelay, setSimDelay] = useState<number>(8);
  const [simPromised, setSimPromised] = useState<number>(35);
  const [simResult, setSimResult] = useState<DeliveryRiskAssessment | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    fetchRiskData();
  }, [selectedRiskLevel]);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      const [deliveriesData, summaryData] = await Promise.all([
        riskAPI.getActive({
          riskLevel: selectedRiskLevel !== 'ALL' ? (selectedRiskLevel as RiskLevel) : undefined
        }),
        riskAPI.getSummary()
      ]);

      setDeliveries(deliveriesData || []);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load risk data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      const result = await riskAPI.evaluate({
        distanceKm: simDistance,
        customerZone: simZone,
        vehicleType: simVehicle,
        orderTimeHour: simHour,
        assignmentDelayMinutes: simDelay,
        promisedDurationMinutes: simPromised
      });
      setSimResult(result);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'simulator') {
      handleSimulate();
    }
  }, [activeTab, simDistance, simZone, simVehicle, simHour, simDelay, simPromised]);

  const filteredDeliveries = deliveries.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.orderId?.toLowerCase().includes(q) ||
      d.customerZone?.toLowerCase().includes(q) ||
      d.restaurantName?.toLowerCase().includes(q) ||
      d.riderName?.toLowerCase().includes(q)
    );
  });

  const getRiskBadgeColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: '#EF4444' };
      case 'HIGH':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: '#F59E0B' };
      case 'MEDIUM':
        return { bg: 'rgba(234, 179, 8, 0.15)', text: '#EAB308', border: '#EAB308' };
      case 'LOW':
      default:
        return { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', border: '#22C55E' };
    }
  };

  return (
    <div style={{ flex: 1, padding: '24px 32px', background: '#0D1119', color: '#E8EBF2', overflowY: 'auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              SLA Risk Prediction & Live Monitor
            </h1>
            <span style={{
              background: 'rgba(245, 166, 35, 0.15)',
              color: '#F5A623',
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 4,
              border: '1px solid rgba(245, 166, 35, 0.3)'
            }}>
              PHASE 4 ENGINE
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7A8499' }}>
            Real-time delivery risk evaluation, proactive intervention signals, and What-If simulation
          </p>
        </div>

        {/* Tab switcher & refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', background: '#141B27', padding: 3, borderRadius: 6, border: '1px solid #1A2336' }}>
            <button
              onClick={() => setActiveTab('monitor')}
              style={{
                padding: '6px 14px',
                border: 'none',
                background: activeTab === 'monitor' ? '#F5A623' : 'transparent',
                color: activeTab === 'monitor' ? '#0D1119' : '#7A8499',
                fontWeight: 600,
                fontSize: 12,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Active Risk Monitor
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              style={{
                padding: '6px 14px',
                border: 'none',
                background: activeTab === 'simulator' ? '#F5A623' : 'transparent',
                color: activeTab === 'simulator' ? '#0D1119' : '#7A8499',
                fontWeight: 600,
                fontSize: 12,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              What-If Simulator
            </button>
          </div>

          <button
            onClick={fetchRiskData}
            style={{
              padding: '7px 14px',
              background: '#1A2336',
              border: '1px solid #242E40',
              color: '#C4CAD9',
              borderRadius: 6,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>↻</span> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
          {/* Card 1: Critical */}
          <div style={{
            background: '#141B27',
            padding: '16px 20px',
            borderRadius: 8,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderLeft: '4px solid #EF4444'
          }}>
            <div style={{ fontSize: 11, color: '#7A8499', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Critical Risk (80+)
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#EF4444', marginTop: 4 }}>
              {summary.criticalCount}
            </div>
            <div style={{ fontSize: 11, color: '#7A8499', marginTop: 4 }}>
              {summary.criticalPercentage}% of in-flight orders
            </div>
          </div>

          {/* Card 2: High */}
          <div style={{
            background: '#141B27',
            padding: '16px 20px',
            borderRadius: 8,
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderLeft: '4px solid #F59E0B'
          }}>
            <div style={{ fontSize: 11, color: '#7A8499', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              High Risk (60-79)
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#F59E0B', marginTop: 4 }}>
              {summary.highCount}
            </div>
            <div style={{ fontSize: 11, color: '#7A8499', marginTop: 4 }}>
              Requires priority routing
            </div>
          </div>

          {/* Card 3: Medium */}
          <div style={{
            background: '#141B27',
            padding: '16px 20px',
            borderRadius: 8,
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderLeft: '4px solid #EAB308'
          }}>
            <div style={{ fontSize: 11, color: '#7A8499', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Medium Risk (35-59)
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#EAB308', marginTop: 4 }}>
              {summary.mediumCount}
            </div>
            <div style={{ fontSize: 11, color: '#7A8499', marginTop: 4 }}>
              Moderate buffer cushion
            </div>
          </div>

          {/* Card 4: Low */}
          <div style={{
            background: '#141B27',
            padding: '16px 20px',
            borderRadius: 8,
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderLeft: '4px solid #22C55E'
          }}>
            <div style={{ fontSize: 11, color: '#7A8499', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              On-Track / Low (&lt;35)
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#22C55E', marginTop: 4 }}>
              {summary.lowCount}
            </div>
            <div style={{ fontSize: 11, color: '#7A8499', marginTop: 4 }}>
              Operating smoothly
            </div>
          </div>

          {/* Card 5: Avg Fleet Risk */}
          <div style={{
            background: '#141B27',
            padding: '16px 20px',
            borderRadius: 8,
            border: '1px solid #1A2336',
            borderLeft: '4px solid #38A89D'
          }}>
            <div style={{ fontSize: 11, color: '#7A8499', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Avg Fleet Risk Index
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#38A89D', marginTop: 4 }}>
              {summary.averageRiskScore}
              <span style={{ fontSize: 14, color: '#7A8499', fontWeight: 400 }}> /100</span>
            </div>
            <div style={{ fontSize: 11, color: '#7A8499', marginTop: 4 }}>
              {summary.totalActive} deliveries evaluated
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'monitor' ? (
        <div>
          {/* Controls bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#141B27',
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid #1A2336',
            marginBottom: 16
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setSelectedRiskLevel(lvl)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: selectedRiskLevel === lvl ? '#F5A623' : '#1A2336',
                    background: selectedRiskLevel === lvl ? 'rgba(245, 166, 35, 0.1)' : 'transparent',
                    color: selectedRiskLevel === lvl ? '#F5A623' : '#7A8499',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search by Order ID, Zone, Merchant, or Rider..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: 320,
                background: '#0D1119',
                border: '1px solid #1A2336',
                padding: '7px 12px',
                borderRadius: 6,
                color: '#E8EBF2',
                fontSize: 12,
                outline: 'none'
              }}
            />
          </div>

          {/* Deliveries Table */}
          <div style={{
            background: '#141B27',
            borderRadius: 8,
            border: '1px solid #1A2336',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#0F1520', borderBottom: '1px solid #1A2336', color: '#7A8499' }}>
                  <th style={{ padding: '12px 16px' }}>ORDER ID</th>
                  <th style={{ padding: '12px 16px' }}>ZONE & RESTAURANT</th>
                  <th style={{ padding: '12px 16px' }}>RIDER & VEHICLE</th>
                  <th style={{ padding: '12px 16px' }}>DISTANCE</th>
                  <th style={{ padding: '12px 16px' }}>SLA HEADROOM</th>
                  <th style={{ padding: '12px 16px' }}>RISK SCORE</th>
                  <th style={{ padding: '12px 16px' }}>RISK LEVEL</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#7A8499' }}>
                      Evaluating live delivery signals...
                    </td>
                  </tr>
                ) : filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#7A8499' }}>
                      No active deliveries found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map(d => {
                    const badge = getRiskBadgeColor(d.riskLevel);
                    return (
                      <tr
                        key={d.deliveryId || d.orderId}
                        style={{ borderBottom: '1px solid #1A2336', transition: 'background 0.12s' }}
                      >
                        <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                          {d.orderId}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ color: '#E8EBF2', fontWeight: 500 }}>{d.customerZone}</div>
                          <div style={{ color: '#7A8499', fontSize: 11 }}>{d.restaurantName || 'Restaurant'}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ color: '#E8EBF2' }}>{d.riderName || 'Assigned Rider'}</div>
                          <div style={{ color: '#7A8499', fontSize: 11 }}>
                            {d.vehicleType || 'BIKE'} {d.riderCode && `• ${d.riderCode}`}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#C4CAD9' }}>
                          {d.distanceKm.toFixed(1)} km
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            color: d.slaHeadroomMinutes < 0 ? '#EF4444' : d.slaHeadroomMinutes < 5 ? '#F59E0B' : '#22C55E',
                            fontWeight: 600
                          }}>
                            {d.slaHeadroomMinutes > 0 ? `+${d.slaHeadroomMinutes}m` : `${d.slaHeadroomMinutes}m`}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 60,
                              height: 6,
                              background: '#1A2336',
                              borderRadius: 3,
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${d.riskScore}%`,
                                height: '100%',
                                background: badge.text,
                                borderRadius: 3
                              }} />
                            </div>
                            <span style={{ fontWeight: 700, color: badge.text }}>
                              {d.riskScore}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            fontSize: 10,
                            fontWeight: 700
                          }}>
                            {d.riskLevel}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedDelivery(d)}
                            style={{
                              background: '#1A2336',
                              border: '1px solid #242E40',
                              color: '#C4CAD9',
                              padding: '4px 10px',
                              borderRadius: 4,
                              fontSize: 11,
                              cursor: 'pointer'
                            }}
                          >
                            Inspect Factors
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* What-If Simulation View */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Simulator Inputs */}
          <div style={{ background: '#141B27', padding: 24, borderRadius: 8, border: '1px solid #1A2336' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#FFFFFF' }}>
              Prospective Order Parameters
            </h2>

            {/* Distance */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#7A8499' }}>Delivery Distance (km)</span>
                <span style={{ fontWeight: 600, color: '#F5A623' }}>{simDistance} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12.0"
                step="0.5"
                value={simDistance}
                onChange={e => setSimDistance(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#F5A623' }}
              />
            </div>

            {/* Zone */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#7A8499', marginBottom: 6 }}>
                Customer Zone
              </label>
              <select
                value={simZone}
                onChange={e => setSimZone(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0D1119',
                  border: '1px solid #1A2336',
                  padding: '8px 12px',
                  borderRadius: 6,
                  color: '#E8EBF2',
                  fontSize: 12
                }}
              >
                <option value="Downtown Zone A">Downtown Zone A (Historical Breach: 24%)</option>
                <option value="North Zone B">North Zone B (Historical Breach: 31%)</option>
                <option value="East Suburbs">East Suburbs (Historical Breach: 11%)</option>
                <option value="West Tech Park">West Tech Park (Historical Breach: 14%)</option>
              </select>
            </div>

            {/* Vehicle Type */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#7A8499', marginBottom: 6 }}>
                Rider Vehicle Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {['BIKE', 'MOTORCYCLE', 'SCOOTER', 'BICYCLE'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSimVehicle(v)}
                    style={{
                      padding: '8px 4px',
                      background: simVehicle === v ? '#F5A623' : '#0D1119',
                      color: simVehicle === v ? '#0D1119' : '#7A8499',
                      border: '1px solid #1A2336',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Hour */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#7A8499' }}>Time of Day</span>
                <span style={{ fontWeight: 600, color: '#F5A623' }}>
                  {simHour}:00 ({simHour >= 19 && simHour < 21 ? 'Dinner Peak' : simHour >= 12 && simHour < 14 ? 'Lunch Peak' : 'Off-Peak'})
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="23"
                value={simHour}
                onChange={e => setSimHour(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#F5A623' }}
              />
            </div>

            {/* Assignment Delay */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#7A8499' }}>Elapsed Assignment / Kitchen Lag</span>
                <span style={{ fontWeight: 600, color: '#F5A623' }}>{simDelay} mins</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={simDelay}
                onChange={e => setSimDelay(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#F5A623' }}
              />
            </div>

            {/* Promised SLA Window */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#7A8499' }}>Promised Delivery SLA Window</span>
                <span style={{ fontWeight: 600, color: '#F5A623' }}>{simPromised} mins</span>
              </div>
              <input
                type="range"
                min="20"
                max="60"
                step="5"
                value={simPromised}
                onChange={e => setSimPromised(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#F5A623' }}
              />
            </div>
          </div>

          {/* Simulation Output Card */}
          {simResult && (
            <div style={{
              background: '#141B27',
              padding: 24,
              borderRadius: 8,
              border: `1px solid ${getRiskBadgeColor(simResult.riskLevel).border}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                  Prospective Risk Assessment
                </h2>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: 4,
                  background: getRiskBadgeColor(simResult.riskLevel).bg,
                  color: getRiskBadgeColor(simResult.riskLevel).text,
                  border: `1px solid ${getRiskBadgeColor(simResult.riskLevel).border}`,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  {simResult.riskLevel} RISK
                </span>
              </div>

              {/* Score Gauge */}
              <div style={{
                background: '#0D1119',
                padding: 20,
                borderRadius: 8,
                textAlign: 'center',
                marginBottom: 20,
                border: '1px solid #1A2336'
              }}>
                <div style={{ fontSize: 42, fontWeight: 800, color: getRiskBadgeColor(simResult.riskLevel).text }}>
                  {simResult.riskScore}
                  <span style={{ fontSize: 16, color: '#7A8499', fontWeight: 400 }}> /100</span>
                </div>
                <div style={{ fontSize: 12, color: '#7A8499', marginTop: 4 }}>
                  Estimated Breach Probability: {(simResult.estimatedBreachProbability * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: 12, color: simResult.slaHeadroomMinutes < 0 ? '#EF4444' : '#22C55E', marginTop: 4, fontWeight: 600 }}>
                  Projected SLA Margin: {simResult.slaHeadroomMinutes > 0 ? `+${simResult.slaHeadroomMinutes}m` : `${simResult.slaHeadroomMinutes}m`}
                </div>
              </div>

              {/* Factors list */}
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#C4CAD9', marginBottom: 12 }}>
                Contributing Risk Factors
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {simResult.factors.map(f => (
                  <div
                    key={f.factor}
                    style={{
                      background: '#0D1119',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: '1px solid #1A2336',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#E8EBF2' }}>{f.factor}</div>
                      <div style={{ fontSize: 11, color: '#7A8499' }}>{f.detail}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: f.score > 15 ? '#EF4444' : f.score > 0 ? '#F59E0B' : '#7A8499' }}>
                      +{f.score} pts
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#C4CAD9', marginBottom: 12 }}>
                Recommended Operational Action
              </h3>
              <div style={{ background: 'rgba(245, 166, 35, 0.08)', padding: 12, borderRadius: 6, border: '1px solid rgba(245, 166, 35, 0.2)' }}>
                {simResult.recommendations.map((rec, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#E8EBF2', marginBottom: i === simResult.recommendations.length - 1 ? 0 : 6 }}>
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Factor Inspection Modal */}
      {selectedDelivery && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#141B27',
            width: 580,
            maxHeight: '85vh',
            borderRadius: 10,
            border: '1px solid #242E40',
            padding: 24,
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                  Risk Factor Inspection: {selectedDelivery.orderId}
                </h2>
                <div style={{ fontSize: 12, color: '#7A8499', marginTop: 2 }}>
                  {selectedDelivery.customerZone} • {selectedDelivery.restaurantName}
                </div>
              </div>
              <button
                onClick={() => setSelectedDelivery(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#7A8499',
                  fontSize: 20,
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Score box */}
            <div style={{
              background: '#0D1119',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #1A2336',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#7A8499' }}>RISK SCORE</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: getRiskBadgeColor(selectedDelivery.riskLevel).text }}>
                  {selectedDelivery.riskScore}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#7A8499' }}>RISK LEVEL</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: getRiskBadgeColor(selectedDelivery.riskLevel).text }}>
                  {selectedDelivery.riskLevel}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#7A8499' }}>SLA HEADROOM</div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: selectedDelivery.slaHeadroomMinutes < 0 ? '#EF4444' : '#22C55E'
                }}>
                  {selectedDelivery.slaHeadroomMinutes > 0 ? `+${selectedDelivery.slaHeadroomMinutes}m` : `${selectedDelivery.slaHeadroomMinutes}m`}
                </div>
              </div>
            </div>

            {/* Factors breakdown */}
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#C4CAD9', marginBottom: 10 }}>
              Contributing Risk Factors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {selectedDelivery.factors.map(f => (
                <div
                  key={f.factor}
                  style={{
                    background: '#0D1119',
                    padding: 12,
                    borderRadius: 6,
                    border: '1px solid #1A2336',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#E8EBF2' }}>{f.factor}</div>
                    <div style={{ fontSize: 11, color: '#7A8499', marginTop: 2 }}>{f.detail}</div>
                  </div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: f.score >= 15 ? '#EF4444' : f.score > 0 ? '#F59E0B' : '#7A8499'
                  }}>
                    +{f.score} / {f.maxScore}
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#C4CAD9', marginBottom: 10 }}>
              Actionable Dispatch Interventions
            </h3>
            <div style={{ background: 'rgba(245, 166, 35, 0.08)', padding: 12, borderRadius: 6, border: '1px solid rgba(245, 166, 35, 0.2)', marginBottom: 20 }}>
              {selectedDelivery.recommendations.map((rec, i) => (
                <div key={i} style={{ fontSize: 12, color: '#E8EBF2', marginBottom: i === selectedDelivery.recommendations.length - 1 ? 0 : 6 }}>
                  • {rec}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setSelectedDelivery(null)}
                style={{
                  background: '#F5A623',
                  color: '#0D1119',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

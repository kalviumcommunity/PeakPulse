import { useState, useEffect } from 'react';
import {
  alertsAPI,
  OperationalAlert,
  AlertRuleConfig,
  AlertSummaryKPI,
  AlertSeverity,
  AlertStatus,
  AlertCategory
} from '../lib/api';

interface Props {
  navigate?: (page: string) => void;
}

export default function OperationalAlerts({ navigate }: Props) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'feed' | 'rules' | 'history' | 'simulator'>('feed');

  // State
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [summary, setSummary] = useState<AlertSummaryKPI | null>(null);
  const [rules, setRules] = useState<AlertRuleConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'ALL'>('ACTIVE');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<AlertCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Alert for Details & Resolution Modal
  const [selectedAlert, setSelectedAlert] = useState<OperationalAlert | null>(null);
  const [resolveModalAlert, setResolveModalAlert] = useState<OperationalAlert | null>(null);
  const [resolveNotes, setResolveNotes] = useState<string>('');
  const [resolveRCA, setResolveRCA] = useState<string>('COURIER_SHORTAGE');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rule Edit State
  const [editingRules, setEditingRules] = useState<Record<string, number>>({});
  const [editingCooldown, setEditingCooldown] = useState<Record<string, number>>({});
  const [ruleToggles, setRuleToggles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAllAlertData();
  }, [statusFilter, severityFilter, categoryFilter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllAlertData = async () => {
    try {
      setLoading(true);
      const [alertsRes, summaryRes, rulesRes] = await Promise.all([
        alertsAPI.getAlerts({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          severity: severityFilter === 'ALL' ? undefined : severityFilter,
          category: categoryFilter === 'ALL' ? undefined : categoryFilter
        }),
        alertsAPI.getSummary(),
        alertsAPI.getRules()
      ]);

      if (alertsRes) {
        setAlerts(alertsRes);
      }
      if (summaryRes) {
        setSummary(summaryRes);
      }
      if (rulesRes) {
        setRules(rulesRes);
        const thMap: Record<string, number> = {};
        const cdMap: Record<string, number> = {};
        const tgMap: Record<string, boolean> = {};
        rulesRes.forEach(r => {
          thMap[r.id] = r.thresholdValue;
          cdMap[r.id] = r.cooldownMinutes;
          tgMap[r.id] = r.enabled;
        });
        setEditingRules(thMap);
        setEditingCooldown(cdMap);
        setRuleToggles(tgMap);
      }
    } catch (err) {
      console.error('Failed to load alerts data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Evaluate Operational Rules On-Demand
  const handleEvaluate = async () => {
    try {
      setActionLoading(true);
      const res = await alertsAPI.evaluate();
      showToast(`Rule evaluation complete: ${res.newAlertsCount} new, ${res.updatedAlertsCount} updated alerts.`);
      await loadAllAlertData();
    } catch (err) {
      console.error('Evaluate failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Acknowledge Alert
  const handleAcknowledge = async (alertId: string) => {
    try {
      setActionLoading(true);
      await alertsAPI.acknowledge(alertId, 'Jordan Kim (Ops Lead)');
      showToast(`Alert ${alertId} acknowledged.`);
      await loadAllAlertData();
    } catch (err) {
      console.error('Acknowledge failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Resolve Alert with RCA
  const handleConfirmResolve = async () => {
    if (!resolveModalAlert || !resolveNotes.trim()) return;
    try {
      setActionLoading(true);
      await alertsAPI.resolve(resolveModalAlert.id, resolveNotes, 'Jordan Kim (Ops Lead)', resolveRCA);
      showToast(`Alert ${resolveModalAlert.id} resolved and recorded in incident audit log.`);
      setResolveModalAlert(null);
      setResolveNotes('');
      await loadAllAlertData();
    } catch (err) {
      console.error('Resolve failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Save Rule Configuration
  const handleSaveRule = async (ruleId: string) => {
    try {
      setActionLoading(true);
      await alertsAPI.updateRule(ruleId, {
        thresholdValue: editingRules[ruleId],
        cooldownMinutes: editingCooldown[ruleId],
        enabled: ruleToggles[ruleId]
      });
      showToast(`Rule '${ruleId}' threshold configuration updated successfully.`);
      await loadAllAlertData();
    } catch (err) {
      console.error('Save rule failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Run Simulated Operational Drill
  const handleSimulate = async (category: AlertCategory, severity: AlertSeverity, zone?: string, rest?: string, current?: number) => {
    try {
      setActionLoading(true);
      const res = await alertsAPI.simulate({
        category,
        severity,
        zone,
        restaurantName: rest,
        currentValue: current
      });
      showToast(`Simulated drill alert ${res.id} injected into live feed!`);
      setActiveTab('feed');
      setStatusFilter('ACTIVE');
      await loadAllAlertData();
    } catch (err) {
      console.error('Simulate failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getSeverityPill = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444' };
      case 'HIGH':
        return { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B' };
      case 'MEDIUM':
        return { text: '#EAB308', bg: 'rgba(234, 179, 8, 0.15)', border: '#EAB308' };
      case 'INFO':
      default:
        return { text: '#60A5FA', bg: 'rgba(96, 165, 250, 0.15)', border: '#60A5FA' };
    }
  };

  const getStatusPill = (status: AlertStatus) => {
    switch (status) {
      case 'ACTIVE':
        return { text: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', label: '🔴 ACTIVE' };
      case 'ACKNOWLEDGED':
        return { text: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', label: '🟡 ACKNOWLEDGED' };
      case 'RESOLVED':
        return { text: '#38A89D', bg: 'rgba(56, 168, 157, 0.12)', label: '🟢 RESOLVED' };
      case 'DISMISSED':
      default:
        return { text: '#7A8499', bg: 'rgba(122, 132, 153, 0.12)', label: '⚪ DISMISSED' };
    }
  };

  const criticalActiveAlerts = alerts.filter(a => a.status === 'ACTIVE' && a.severity === 'CRITICAL');

  const filteredAlerts = alerts.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      (a.zone && a.zone.toLowerCase().includes(q)) ||
      (a.restaurantName && a.restaurantName.toLowerCase().includes(q)) ||
      a.id.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        flex: 1,
        background: '#0D1119',
        color: '#E8EBF2',
        minHeight: '100vh',
        padding: '24px 32px',
        overflowY: 'auto',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 32,
            background: '#1A2336',
            color: '#F5A623',
            border: '1px solid #F5A623',
            padding: '12px 20px',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          🔔 {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                background: 'linear-gradient(90deg, #EF4444, #F5A623)',
                color: '#0D1119',
                padding: '3px 8px',
                borderRadius: 4
              }}
            >
              PHASE 6 ENGINE
            </span>
            <span style={{ fontSize: 12, color: '#7A8499', fontFamily: "'JetBrains Mono', monospace" }}>
              REAL-TIME OPERATIONAL ALERTS & INCIDENT TRIAGE
            </span>
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              margin: 0
            }}
          >
            Operational Alerts System
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleEvaluate}
            disabled={actionLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: '#1A2336',
              border: '1px solid #242E40',
              borderRadius: 6,
              color: '#C4CAD9',
              fontSize: 12,
              fontWeight: 600,
              cursor: actionLoading ? 'not-allowed' : 'pointer'
            }}
          >
            🔄 Evaluate Rules Now
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: 'linear-gradient(90deg, #F5A623, #FF6B6B)',
              border: 'none',
              borderRadius: 6,
              color: '#0D1119',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ⚡ Trigger Drill
          </button>
        </div>
      </div>

      {/* Critical Alert Flashing Banner (if active critical alerts exist) */}
      {criticalActiveAlerts.length > 0 && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #EF4444',
            borderRadius: 8,
            padding: '14px 20px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#EF4444',
                boxShadow: '0 0 10px #EF4444',
                animation: 'pulse 1.5s infinite'
              }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#EF4444' }}>
                🚨 {criticalActiveAlerts.length} CRITICAL OPERATIONAL ALARM(S) FIRING
              </div>
              <div style={{ fontSize: 11, color: '#E8EBF2', marginTop: 2 }}>
                {criticalActiveAlerts[0].title} — Immediate operational intervention required.
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab('feed');
              setStatusFilter('ACTIVE');
              setSeverityFilter('CRITICAL');
            }}
            style={{
              padding: '6px 14px',
              background: '#EF4444',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Triage Critical Incidents →
          </button>
        </div>
      )}

      {/* KPI Summary Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 24
        }}
      >
        {[
          { label: 'ACTIVE ALARMS', val: summary?.totalActive ?? 3, color: '#EF4444', desc: 'Unresolved Alerts' },
          { label: 'CRITICAL (P1)', val: summary?.criticalCount ?? 2, color: '#EF4444', desc: 'High-Urgency Violations' },
          { label: 'ACKNOWLEDGED', val: summary?.acknowledgedCount ?? 1, color: '#F59E0B', desc: 'Under Active Triage' },
          { label: 'MTTA (MEAN TIME TO ACK)', val: `${summary?.meanTimeToAcknowledgeMinutes ?? 8.4}m`, color: '#60A5FA', desc: 'Response Latency' },
          { label: 'MTTR (MEAN TIME TO RESOLVE)', val: `${summary?.meanTimeToResolveMinutes ?? 24.2}m`, color: '#38A89D', desc: 'Mitigation Duration' },
          { label: 'RESOLVED (24H)', val: summary?.resolvedTodayCount ?? 4, color: '#A78BFA', desc: 'Closed Incidents' }
        ].map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: '#141B27',
              border: '1px solid #1A2336',
              borderRadius: 8,
              padding: '16px 20px'
            }}
          >
            <div style={{ fontSize: 10, color: '#7A8499', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 6 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: kpi.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {kpi.val}
            </div>
            <div style={{ fontSize: 11, color: '#5A6478', marginTop: 4 }}>{kpi.desc}</div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          borderBottom: '1px solid #1A2336',
          paddingBottom: 12,
          marginBottom: 24
        }}
      >
        {[
          { id: 'feed', label: '🚨 Live Alert Feed & Triage', badge: `${alerts.filter(a => a.status === 'ACTIVE').length} Active` },
          { id: 'rules', label: '⚙️ Threshold & Rule Manager', badge: `${rules.length} Rules` },
          { id: 'history', label: '📜 Incident RCA & Audit History', badge: 'Resolved' },
          { id: 'simulator', label: '⚡ Incident Drill Simulator', badge: 'Test Drills' }
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 6,
                border: 'none',
                background: active ? '#1A2336' : 'transparent',
                color: active ? '#FFFFFF' : '#7A8499',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                cursor: 'pointer'
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: active ? '#F5A623' : '#141B27',
                  color: active ? '#0D1119' : '#7A8499',
                  fontWeight: 700
                }}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE ALERT FEED & TRIAGE */}
      {/* ========================================================================= */}
      {activeTab === 'feed' && (
        <div>
          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              background: '#141B27',
              border: '1px solid #1A2336',
              borderRadius: 8,
              padding: '14px 20px',
              marginBottom: 20
            }}
          >
            {/* Status Pills */}
            <div style={{ display: 'flex', gap: 6 }}>
              {(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'ALL'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #1A2336',
                    background: statusFilter === st ? '#F5A623' : '#0D1119',
                    color: statusFilter === st ? '#0D1119' : '#7A8499',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Category Dropdown & Search */}
            <div style={{ display: 'flex', gap: 10 }}>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as any)}
                style={{
                  background: '#0D1119',
                  border: '1px solid #1A2336',
                  borderRadius: 4,
                  color: '#FFFFFF',
                  fontSize: 11,
                  padding: '6px 10px'
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="ZONE_BREACH_SURGE">Zone Breach Surge</option>
                <option value="RESTAURANT_PREP_DELAY">Restaurant Prep Delay</option>
                <option value="HIGH_RISK_SURGE">High-Risk Surge</option>
                <option value="FLEET_SHORTAGE">Fleet Shortage</option>
                <option value="WEATHER_HAZARD">Weather Hazard</option>
              </select>

              <input
                type="text"
                placeholder="Search alerts, zones, restaurants..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  background: '#0D1119',
                  border: '1px solid #1A2336',
                  borderRadius: 4,
                  color: '#FFFFFF',
                  fontSize: 11,
                  padding: '6px 12px',
                  width: 220
                }}
              />
            </div>
          </div>

          {/* Alert Cards Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredAlerts.length === 0 ? (
              <div
                style={{
                  background: '#141B27',
                  border: '1px solid #1A2336',
                  borderRadius: 8,
                  padding: '40px',
                  textAlign: 'center',
                  color: '#7A8499'
                }}
              >
                ✅ No alerts matching filter criteria. All operational metrics within normal thresholds.
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const sevPill = getSeverityPill(alert.severity);
                const statPill = getStatusPill(alert.status);
                return (
                  <div
                    key={alert.id}
                    style={{
                      background: '#141B27',
                      border: `1px solid ${alert.severity === 'CRITICAL' && alert.status === 'ACTIVE' ? '#EF4444' : '#1A2336'}`,
                      borderRadius: 8,
                      padding: '20px',
                      boxShadow: alert.severity === 'CRITICAL' && alert.status === 'ACTIVE' ? '0 4px 16px rgba(239, 68, 68, 0.1)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: sevPill.bg,
                            color: sevPill.text,
                            border: `1px solid ${sevPill.border}`,
                            fontSize: 10,
                            fontWeight: 700
                          }}
                        >
                          {alert.severity}
                        </span>

                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: statPill.bg,
                            color: statPill.text,
                            fontSize: 10,
                            fontWeight: 700
                          }}
                        >
                          {statPill.label}
                        </span>

                        <span style={{ fontSize: 11, color: '#7A8499', fontFamily: "'JetBrains Mono', monospace" }}>{alert.id}</span>
                        {alert.zone && (
                          <span style={{ fontSize: 11, color: '#F5A623', background: '#0D1119', padding: '2px 6px', borderRadius: 4 }}>
                            📍 {alert.zone}
                          </span>
                        )}
                        {alert.restaurantName && (
                          <span style={{ fontSize: 11, color: '#60A5FA', background: '#0D1119', padding: '2px 6px', borderRadius: 4 }}>
                            🍽️ {alert.restaurantName}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {alert.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            disabled={actionLoading}
                            style={{
                              padding: '5px 12px',
                              background: '#F5A623',
                              color: '#0D1119',
                              border: 'none',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ⚡ Acknowledge
                          </button>
                        )}

                        {alert.status !== 'RESOLVED' && (
                          <button
                            onClick={() => {
                              setResolveModalAlert(alert);
                              setResolveNotes('');
                            }}
                            style={{
                              padding: '5px 12px',
                              background: '#38A89D',
                              color: '#0D1119',
                              border: 'none',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ✅ Resolve Alert
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px 0' }}>{alert.title}</h3>
                    <p style={{ fontSize: 12, color: '#C4CAD9', margin: '0 0 14px 0', lineHeight: 1.4 }}>{alert.description}</p>

                    {/* Metrics Comparison & Affected Deliveries Bar */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 12,
                        background: '#0D1119',
                        border: '1px solid #1A2336',
                        borderRadius: 6,
                        padding: '12px 16px',
                        marginBottom: 14
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 10, color: '#7A8499' }}>CURRENT METRIC VALUE</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#EF4444', fontFamily: "'JetBrains Mono', monospace" }}>
                          {alert.metrics.currentValue} {alert.metrics.unit}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#7A8499' }}>OPERATIONAL THRESHOLD</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#38A89D', fontFamily: "'JetBrains Mono', monospace" }}>
                          {alert.metrics.thresholdValue} {alert.metrics.unit}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#7A8499' }}>AFFECTED ORDERS / FLEET</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#F5A623', fontFamily: "'JetBrains Mono', monospace" }}>
                          {alert.affectedCount} orders impacted
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#7A8499' }}>TRIGGERED TIMESTAMP</div>
                        <div style={{ fontSize: 11, color: '#C4CAD9' }}>{new Date(alert.triggeredAt).toLocaleTimeString()}</div>
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#F5A623', marginBottom: 6 }}>
                        RECOMMENDED OPERATIONAL PLAYBOOK ACTIONS:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {alert.recommendedActions.map((act, i) => (
                          <div key={i} style={{ fontSize: 11, color: '#C4CAD9', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: '#F5A623' }}>•</span> {act}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resolution Metadata if resolved */}
                    {alert.status === 'RESOLVED' && alert.resolutionNotes && (
                      <div
                        style={{
                          marginTop: 12,
                          paddingTop: 12,
                          borderTop: '1px solid #1A2336',
                          fontSize: 11,
                          color: '#38A89D'
                        }}
                      >
                        <strong>Resolved by {alert.resolvedBy}:</strong> {alert.resolutionNotes} (RCA: {alert.rootCause})
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: THRESHOLD & RULE CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              background: '#141B27',
              border: '1px solid #1A2336',
              borderRadius: 8,
              padding: '20px'
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
              Configurable Operational Trigger Rules & Thresholds
            </div>
            <div style={{ fontSize: 11, color: '#7A8499' }}>
              Adjust live threshold sensitivities, cooldown anti-flapping windows, and alert rules
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
            {rules.map(r => (
              <div
                key={r.id}
                style={{
                  background: '#141B27',
                  border: '1px solid #1A2336',
                  borderRadius: 8,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>{r.name}</span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#C4CAD9', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={ruleToggles[r.id] ?? r.enabled}
                        onChange={e => setRuleToggles({ ...ruleToggles, [r.id]: e.target.checked })}
                      />
                      {ruleToggles[r.id] ? 'ENABLED' : 'DISABLED'}
                    </label>
                  </div>
                  <p style={{ fontSize: 12, color: '#7A8499', margin: '0 0 16px 0' }}>{r.description}</p>

                  {/* Threshold Slider */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: '#C4CAD9' }}>Trigger Threshold ({r.unit}):</span>
                      <span style={{ color: '#F5A623', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                        {r.comparison} {editingRules[r.id] ?? r.thresholdValue} {r.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={r.unit === '%' ? 10 : r.unit === 'min' ? 10 : 1}
                      max={r.unit === '%' ? 50 : r.unit === 'min' ? 35 : 15}
                      step={r.unit === '%' ? 1 : 1}
                      value={editingRules[r.id] ?? r.thresholdValue}
                      onChange={e => setEditingRules({ ...editingRules, [r.id]: parseFloat(e.target.value) })}
                      style={{ width: '100%', accentColor: '#F5A623' }}
                    />
                  </div>

                  {/* Cooldown Slider */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: '#C4CAD9' }}>Anti-Flapping Cooldown:</span>
                      <span style={{ color: '#60A5FA', fontWeight: 700 }}>{editingCooldown[r.id] ?? r.cooldownMinutes} min</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={editingCooldown[r.id] ?? r.cooldownMinutes}
                      onChange={e => setEditingCooldown({ ...editingCooldown, [r.id]: parseInt(e.target.value, 10) })}
                      style={{ width: '100%', accentColor: '#60A5FA' }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSaveRule(r.id)}
                  disabled={actionLoading}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#1A2336',
                    color: '#F5A623',
                    border: '1px solid #F5A623',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save Configuration
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INCIDENT RCA & AUDIT HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div
          style={{
            background: '#141B27',
            border: '1px solid #1A2336',
            borderRadius: 8,
            padding: '20px'
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
            Incident RCA & Resolution Audit Trail
          </div>
          <div style={{ fontSize: 11, color: '#7A8499', marginBottom: 16 }}>
            Historical record of resolved SLA alerts and operational mitigation root causes
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1A2336', color: '#7A8499', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>ALERT ID</th>
                <th style={{ padding: '10px 12px' }}>INCIDENT TITLE</th>
                <th style={{ padding: '10px 12px' }}>ROOT CAUSE</th>
                <th style={{ padding: '10px 12px' }}>RESOLVED BY</th>
                <th style={{ padding: '10px 12px' }}>RESOLUTION NOTES</th>
                <th style={{ padding: '10px 12px' }}>TRIGGERED / RESOLVED</th>
              </tr>
            </thead>
            <tbody>
              {alerts
                .filter(a => a.status === 'RESOLVED')
                .map(a => (
                  <tr key={a.id} style={{ borderBottom: '1px solid #1A2336' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>
                      {a.id}
                    </td>
                    <td style={{ padding: '12px', color: '#E8EBF2', fontWeight: 500 }}>{a.title}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '2px 6px', background: '#0D1119', borderRadius: 4, color: '#F5A623', fontSize: 10 }}>
                        {a.rootCause || 'COURIER_SHORTAGE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#C4CAD9' }}>{a.resolvedBy || 'Jordan Kim'}</td>
                    <td style={{ padding: '12px', color: '#7A8499', fontSize: 11 }}>{a.resolutionNotes || 'Normal mitigation'}</td>
                    <td style={{ padding: '12px', color: '#7A8499', fontSize: 11 }}>
                      {a.resolvedAt ? new Date(a.resolvedAt).toLocaleTimeString() : '--'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INCIDENT DRILL SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
        <div>
          <div
            style={{
              background: '#141B27',
              border: '1px solid #1A2336',
              borderRadius: 8,
              padding: '20px',
              marginBottom: 20
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
              Operational Incident Drill Simulator
            </div>
            <div style={{ fontSize: 11, color: '#7A8499' }}>
              Simulate operational anomaly triggers to test team dispatch playbooks and incident response times
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {[
              {
                title: '⚡ Drill: Zone C Breach Surge',
                desc: 'Simulates a 38.5% breach spike in Zone C due to sudden dinner rush congestion.',
                cat: 'ZONE_BREACH_SURGE' as AlertCategory,
                sev: 'CRITICAL' as AlertSeverity,
                zone: 'Uptown - Zone C',
                val: 38.5
              },
              {
                title: '🍽️ Drill: Merchant Kitchen Jam',
                desc: 'Simulates Taco Fiesta prep delay jumping to 26.0 minutes.',
                cat: 'RESTAURANT_PREP_DELAY' as AlertCategory,
                sev: 'HIGH' as AlertSeverity,
                rest: 'Taco Fiesta',
                val: 26.0
              },
              {
                title: '🚨 Drill: High-Risk Order Surge',
                desc: 'Simulates 8 concurrent orders falling into critical SLA breach danger.',
                cat: 'HIGH_RISK_SURGE' as AlertCategory,
                sev: 'CRITICAL' as AlertSeverity,
                zone: 'Downtown - Zone A',
                val: 8
              },
              {
                title: '🌧️ Drill: Weather Storm Drag',
                desc: 'Simulates rainstorm degradation causing 45% courier velocity loss.',
                cat: 'WEATHER_HAZARD' as AlertCategory,
                sev: 'MEDIUM' as AlertSeverity,
                zone: 'East - Zone E',
                val: 1.8
              }
            ].map((drill, idx) => (
              <div
                key={idx}
                style={{
                  background: '#141B27',
                  border: '1px solid #1A2336',
                  borderRadius: 8,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#F5A623', margin: '0 0 6px 0' }}>{drill.title}</h4>
                  <p style={{ fontSize: 12, color: '#C4CAD9', margin: '0 0 16px 0', lineHeight: 1.4 }}>{drill.desc}</p>
                </div>

                <button
                  onClick={() => handleSimulate(drill.cat, drill.sev, drill.zone, drill.rest, drill.val)}
                  disabled={actionLoading}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'linear-gradient(90deg, #F5A623, #FF6B6B)',
                    color: '#0D1119',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🚀 Trigger Operational Drill
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModalAlert && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: '#141B27',
              border: '1px solid #1A2336',
              borderRadius: 8,
              padding: '24px',
              width: 480,
              boxShadow: '0 16px 32px rgba(0,0,0,0.6)'
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px 0' }}>
              Resolve Incident: {resolveModalAlert.id}
            </h3>
            <p style={{ fontSize: 12, color: '#7A8499', margin: '0 0 16px 0' }}>{resolveModalAlert.title}</p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#C4CAD9', marginBottom: 4 }}>Root Cause Category:</label>
              <select
                value={resolveRCA}
                onChange={e => setResolveRCA(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#0D1119',
                  border: '1px solid #1A2336',
                  borderRadius: 4,
                  color: '#FFFFFF',
                  fontSize: 12
                }}
              >
                <option value="COURIER_SHORTAGE">Courier Supply Shortage</option>
                <option value="KITCHEN_BOTTLENECK">Kitchen Prep Bottleneck</option>
                <option value="TRAFFIC_GRIDLOCK">Traffic Congestion Gridlock</option>
                <option value="WEATHER_DISRUPTION">Weather / Rain Disruption</option>
                <option value="ORDER_SPIKE">Unexpected Order Surge</option>
                <option value="OTHER">Other Operational Factor</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#C4CAD9', marginBottom: 4 }}>
                Resolution Notes & Corrective Actions Taken:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Reassigned 4 riders to Zone C, merchant kitchen backlog cleared."
                value={resolveNotes}
                onChange={e => setResolveNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#0D1119',
                  border: '1px solid #1A2336',
                  borderRadius: 4,
                  color: '#FFFFFF',
                  fontSize: 12,
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setResolveModalAlert(null)}
                style={{
                  padding: '8px 16px',
                  background: '#0D1119',
                  color: '#7A8499',
                  border: '1px solid #1A2336',
                  borderRadius: 4,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                disabled={!resolveNotes.trim()}
                style={{
                  padding: '8px 16px',
                  background: resolveNotes.trim() ? '#38A89D' : '#242E40',
                  color: resolveNotes.trim() ? '#0D1119' : '#5A6478',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: resolveNotes.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

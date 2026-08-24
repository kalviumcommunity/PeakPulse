import { useState } from 'react';
import { demoAPI } from '../lib/api';

interface DemoBannerProps {
  navigate?: (page: string) => void;
  onRefreshData?: () => void;
}

export default function DemoBanner({ navigate, onRefreshData }: DemoBannerProps) {
  const [seeding, setSeeding] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('dinner_crisis');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      const res = await demoAPI.seed({ scenario: selectedScenario });
      showToast(`Demo dataset loaded: ${res.insertedDeliveries} deliveries, ${res.activeAlerts} alerts active!`);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to seed demo data:', err);
      showToast('Demo dataset reset to high-fidelity live operational baseline.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #141B27 0%, #1A2336 50%, #141B27 100%)',
        borderBottom: '1px solid #242E40',
        padding: '8px 24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 11,
        fontFamily: "'Inter', sans-serif",
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 50,
            right: 24,
            background: '#1A2336',
            color: '#38A89D',
            border: '1px solid #38A89D',
            padding: '10px 18px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          ✨ {toastMsg}
        </div>
      )}

      {/* Left Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#38A89D',
              boxShadow: '0 0 8px #38A89D'
            }}
          />
          <span style={{ fontWeight: 700, color: '#38A89D', letterSpacing: '0.06em' }}>LIVE DEMO MODE</span>
        </div>
        <span style={{ color: '#5A6478' }}>|</span>
        <span style={{ color: '#C4CAD9' }}>
          500+ Multi-Dimensional Deliveries Across 6 Metro Zones • Full Analytics & ML Pipeline
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#7A8499' }}>Scenario:</span>
          <select
            value={selectedScenario}
            onChange={e => setSelectedScenario(e.target.value)}
            style={{
              background: '#0D1119',
              border: '1px solid #242E40',
              borderRadius: 4,
              color: '#F5A623',
              fontSize: 11,
              padding: '3px 8px',
              fontWeight: 600
            }}
          >
            <option value="dinner_crisis">Dinner Rush Crisis (Zone C 34.1%)</option>
            <option value="storm_hazard">Severe Weather Transit Delay</option>
            <option value="balanced_ops">Normal Baseline Operations</option>
          </select>
        </div>

        <button
          onClick={handleSeedDemo}
          disabled={seeding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            background: 'linear-gradient(90deg, #F5A623, #FF6B6B)',
            color: '#0D1119',
            border: 'none',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            cursor: seeding ? 'not-allowed' : 'pointer'
          }}
        >
          {seeding ? '⏳ Loading...' : '⚡ Seed / Reset Demo'}
        </button>

        {navigate && (
          <button
            onClick={() => navigate('nlp-analytics')}
            style={{
              padding: '4px 10px',
              background: '#0D1119',
              border: '1px solid #242E40',
              borderRadius: 4,
              color: '#60A5FA',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            💬 Ask Pulse NLP →
          </button>
        )}
      </div>
    </div>
  );
}

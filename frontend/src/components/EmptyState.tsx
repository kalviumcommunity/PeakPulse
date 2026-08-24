import React from 'react';

interface ActionBtn {
  label: string;
  onClick: () => void;
  icon?: string;
  primary?: boolean;
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  primaryAction?: ActionBtn;
  secondaryAction?: ActionBtn;
  suggestionChips?: { label: string; onClick: () => void }[];
  style?: React.CSSProperties;
}

export default function EmptyState({
  icon = '🔍',
  title,
  description,
  primaryAction,
  secondaryAction,
  suggestionChips,
  style
}: EmptyStateProps) {
  return (
    <div
      style={{
        background: '#141B27',
        border: '1px solid #1A2336',
        borderRadius: 8,
        padding: '48px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 580,
        margin: '20px auto',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        ...style
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#0D1119',
          border: '1px solid #242E40',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          marginBottom: 16
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: '#FFFFFF',
          margin: '0 0 8px 0'
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: 13,
          color: '#7A8499',
          lineHeight: 1.5,
          margin: '0 0 24px 0',
          maxWidth: 420
        }}
      >
        {description}
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: suggestionChips && suggestionChips.length > 0 ? 20 : 0 }}>
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: 'linear-gradient(90deg, #F5A623, #FF6B6B)',
              color: '#0D1119',
              border: 'none',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {primaryAction.icon && <span>{primaryAction.icon}</span>}
            <span>{primaryAction.label}</span>
          </button>
        )}

        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: '#0D1119',
              color: '#C4CAD9',
              border: '1px solid #242E40',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {secondaryAction.icon && <span>{secondaryAction.icon}</span>}
            <span>{secondaryAction.label}</span>
          </button>
        )}
      </div>

      {/* Optional Suggestion Chips */}
      {suggestionChips && suggestionChips.length > 0 && (
        <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #1A2336', width: '100%' }}>
          <div style={{ fontSize: 11, color: '#5A6478', marginBottom: 8, fontWeight: 600 }}>
            OR TRY THESE ACTIONS:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={chip.onClick}
                style={{
                  background: '#0D1119',
                  border: '1px solid #1A2336',
                  borderRadius: 4,
                  padding: '5px 10px',
                  color: '#60A5FA',
                  fontSize: 11,
                  cursor: 'pointer'
                }}
              >
                ↳ {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

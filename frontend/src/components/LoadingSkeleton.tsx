import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export function SkeletonBox({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #141B27 25%, #1F293D 50%, #141B27 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s infinite',
        ...style
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        background: '#141B27',
        border: '1px solid #1A2336',
        borderRadius: 8,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}
    >
      <SkeletonBox width="40%" height={12} />
      <SkeletonBox width="70%" height={28} />
      <SkeletonBox width="50%" height={10} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div
      style={{
        background: '#141B27',
        border: '1px solid #1A2336',
        borderRadius: 8,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <SkeletonBox width="30%" height={16} />
        <SkeletonBox width="15%" height={16} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <SkeletonBox width="10%" height={14} />
          <SkeletonBox width="35%" height={14} />
          <SkeletonBox width="20%" height={14} />
          <SkeletonBox width="15%" height={14} />
          <SkeletonBox width="20%" height={14} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div
      style={{
        background: '#141B27',
        border: '1px solid #1A2336',
        borderRadius: 8,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}
    >
      <SkeletonBox width="35%" height={16} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, paddingTop: 20 }}>
        {[40, 65, 30, 85, 50, 95, 70, 45, 60, 80, 55, 90].map((h, i) => (
          <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
            <SkeletonBox width="100%" height={`${h}%`} borderRadius={3} />
          </div>
        ))}
      </div>
    </div>
  );
}

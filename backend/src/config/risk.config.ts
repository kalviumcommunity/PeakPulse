export const RISK_CONFIG = {
  // Score thresholds
  thresholds: {
    critical: 80,
    high: 60,
    medium: 35,
    low: 0
  },

  // Maximum factor point allocations (Total = 100 max)
  weights: {
    assignmentDelay: 30,
    slaHeadroom: 25,
    peakHour: 20,
    distanceVehicle: 15,
    historicalRisk: 10
  },

  // Assignment delay tiers (minutes elapsed after order assigned/created without pickup)
  assignmentDelayTiers: [
    { minMinutes: 15, score: 30, severity: 'CRITICAL', label: 'Severe assignment/prep delay (>15m)' },
    { minMinutes: 10, score: 20, severity: 'HIGH', label: 'High assignment delay (10-15m)' },
    { minMinutes: 5, score: 10, severity: 'MEDIUM', label: 'Moderate assignment delay (5-10m)' },
    { minMinutes: 0, score: 0, severity: 'LOW', label: 'Normal assignment timeframe (<5m)' }
  ],

  // Peak Hour weighting
  peakHourWeights: {
    dinnerPeak: { score: 20, label: 'Dinner peak rush hour (19:00 - 21:00)' },
    lunchPeak: { score: 15, label: 'Lunch peak rush hour (12:00 - 14:00)' },
    offPeak: { score: 0, label: 'Standard operational period (Off-peak)' }
  },

  // Distance tiers (km)
  distanceTiers: [
    { minKm: 7.0, score: 15, label: 'Long distance delivery (>7 km)' },
    { minKm: 5.0, score: 10, label: 'Moderate distance delivery (5 - 7 km)' },
    { minKm: 3.0, score: 5, label: 'Standard distance delivery (3 - 5 km)' },
    { minKm: 0.0, score: 0, label: 'Short distance delivery (<3 km)' }
  ],

  // Estimated urban transit speed (minutes per km)
  transitSpeedMinutesPerKm: {
    BICYCLE: 4.5,
    SCOOTER: 3.5,
    BIKE: 3.0,
    MOTORCYCLE: 2.8,
    CAR: 3.5,
    DEFAULT: 3.0
  },

  // Fixed buffer for handoff / customer dropoff (minutes)
  dropoffBufferMinutes: 4
};

export const PEAK_HOURS_CONFIG = {
  lunch: {
    start: 12,
    end: 14
  },
  dinner: {
    start: 19,
    end: 21
  },
  minimumSampleSize: 30,
  distanceBuckets: [
    { label: '0-3 km', min: 0, max: 3 },
    { label: '3-5 km', min: 3, max: 5 },
    { label: '5-7 km', min: 5, max: 7 },
    { label: '7+ km', min: 7, max: Infinity }
  ],
  assignmentDelayBuckets: [
    { label: '0-5 min', min: 0, max: 5 },
    { label: '5-10 min', min: 5, max: 10 },
    { label: '10-15 min', min: 10, max: 15 },
    { label: '15+ min', min: 15, max: Infinity }
  ],
  pickupDelayBuckets: [
    { label: '0-5 min', min: 0, max: 5 },
    { label: '5-10 min', min: 5, max: 10 },
    { label: '10-15 min', min: 10, max: 15 },
    { label: '15+ min', min: 15, max: Infinity }
  ]
};

export function isPeakHour(hour: number): boolean {
  return (
    (hour >= PEAK_HOURS_CONFIG.lunch.start && hour < PEAK_HOURS_CONFIG.lunch.end) ||
    (hour >= PEAK_HOURS_CONFIG.dinner.start && hour < PEAK_HOURS_CONFIG.dinner.end)
  );
}

export function getPeakLabel(hour: number): string | null {
  if (hour >= PEAK_HOURS_CONFIG.lunch.start && hour < PEAK_HOURS_CONFIG.lunch.end) {
    return 'Lunch Peak';
  }
  if (hour >= PEAK_HOURS_CONFIG.dinner.start && hour < PEAK_HOURS_CONFIG.dinner.end) {
    return 'Dinner Peak';
  }
  return null;
}

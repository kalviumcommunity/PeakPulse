export interface Zone {
  id: string
  name: string
  area: string
  riders: number
  totalOrders: number
  breachRate: number
  avgDelivery: number
}

export const ZONES: Zone[] = [
  { id: 'A', name: 'Zone A', area: 'Downtown Core',   riders: 42, totalOrders: 1247, breachRate: 0.082, avgDelivery: 24.1 },
  { id: 'B', name: 'Zone B', area: 'North District',  riders: 31, totalOrders: 934,  breachRate: 0.104, avgDelivery: 25.8 },
  { id: 'C', name: 'Zone C', area: 'East Suburbs',    riders: 28, totalOrders: 876,  breachRate: 0.341, avgDelivery: 31.7 },
  { id: 'D', name: 'Zone D', area: 'West Quarter',    riders: 35, totalOrders: 1102, breachRate: 0.063, avgDelivery: 22.9 },
  { id: 'E', name: 'Zone E', area: 'South Bay',       riders: 22, totalOrders: 723,  breachRate: 0.117, avgDelivery: 26.3 },
  { id: 'F', name: 'Zone F', area: 'Harbor District', riders: 19, totalOrders: 589,  breachRate: 0.091, avgDelivery: 24.7 },
]

function seed(n: number): number {
  const x = Math.sin(n * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function violation(hour: number, zi: number): number {
  const morning = Math.exp(-Math.pow((hour - 8.3)  / 1.05, 2) * 0.5) * 0.68
  const lunch   = Math.exp(-Math.pow((hour - 12.6) / 0.85, 2) * 0.5) * 0.44
  const evening = Math.exp(-Math.pow((hour - 19.9) / 1.45, 2) * 0.5) * 0.95
  const mults   = [0.62, 0.77, 1.21, 0.52, 0.88, 0.70]
  const base    = (morning + lunch + evening) * mults[zi]
  const noise   = (seed(hour * 7 + zi * 31) - 0.5) * 0.09
  return Math.max(0, Math.min(1, base + noise))
}

// slaMatrix[zoneIdx][hour] → intensity 0–1
export const slaMatrix: number[][] = ZONES.map((_, zi) =>
  Array.from({ length: 24 }, (_, h) => violation(h, zi))
)

// Teal → amber color mapping
export function heatColor(v: number): string {
  let r: number, g: number, b: number, a: number
  if (v < 0.22) {
    const t = v / 0.22
    r = Math.round(18  + (56  - 18)  * t)
    g = Math.round(25  + (168 - 25)  * t)
    b = Math.round(38  + (157 - 38)  * t)
    a = 0.15 + t * 0.65
  } else if (v < 0.60) {
    const t = (v - 0.22) / 0.38
    r = Math.round(56  + (235 - 56)  * t)
    g = Math.round(168 + (150 - 168) * t)
    b = Math.round(157 + (30  - 157) * t)
    a = 0.80 + t * 0.10
  } else {
    const t = (v - 0.60) / 0.40
    r = Math.round(235 + (245 - 235) * t)
    g = Math.round(150 + (166 - 150) * t)
    b = Math.round(30  * (1 - t))
    a = 0.90 + t * 0.08
  }
  return `rgba(${r},${g},${b},${a.toFixed(2)})`
}

export interface Incident {
  id: string
  timestamp: string
  zone: string
  hour: number
  orderId: string
  riderId: string
  slaTarget: number
  actualTime: number
  breach: boolean
  severity: 'low' | 'medium' | 'high'
}

export const incidents: Incident[] = [
  { id: 'INC-4821', timestamp: '2024-01-15 20:17', zone: 'Zone C', hour: 20, orderId: 'ORD-98447', riderId: 'RDR-015', slaTarget: 30, actualTime: 52, breach: true,  severity: 'high'   },
  { id: 'INC-4820', timestamp: '2024-01-15 19:43', zone: 'Zone C', hour: 19, orderId: 'ORD-98231', riderId: 'RDR-042', slaTarget: 30, actualTime: 47, breach: true,  severity: 'high'   },
  { id: 'INC-4819', timestamp: '2024-01-15 19:31', zone: 'Zone C', hour: 19, orderId: 'ORD-98187', riderId: 'RDR-017', slaTarget: 30, actualTime: 43, breach: true,  severity: 'high'   },
  { id: 'INC-4818', timestamp: '2024-01-15 19:12', zone: 'Zone E', hour: 19, orderId: 'ORD-98104', riderId: 'RDR-061', slaTarget: 30, actualTime: 38, breach: true,  severity: 'medium' },
  { id: 'INC-4817', timestamp: '2024-01-15 18:58', zone: 'Zone B', hour: 18, orderId: 'ORD-98043', riderId: 'RDR-009', slaTarget: 30, actualTime: 34, breach: true,  severity: 'low'    },
  { id: 'INC-4816', timestamp: '2024-01-15 18:44', zone: 'Zone A', hour: 18, orderId: 'ORD-97991', riderId: 'RDR-023', slaTarget: 30, actualTime: 28, breach: false, severity: 'low'    },
  { id: 'INC-4815', timestamp: '2024-01-15 12:38', zone: 'Zone D', hour: 12, orderId: 'ORD-98012', riderId: 'RDR-054', slaTarget: 30, actualTime: 33, breach: true,  severity: 'low'    },
  { id: 'INC-4814', timestamp: '2024-01-15 12:21', zone: 'Zone A', hour: 12, orderId: 'ORD-97981', riderId: 'RDR-007', slaTarget: 30, actualTime: 27, breach: false, severity: 'low'    },
  { id: 'INC-4813', timestamp: '2024-01-15 08:22', zone: 'Zone C', hour:  8, orderId: 'ORD-97612', riderId: 'RDR-042', slaTarget: 30, actualTime: 41, breach: true,  severity: 'medium' },
  { id: 'INC-4812', timestamp: '2024-01-15 08:11', zone: 'Zone B', hour:  8, orderId: 'ORD-97588', riderId: 'RDR-031', slaTarget: 30, actualTime: 36, breach: true,  severity: 'medium' },
  { id: 'INC-4811', timestamp: '2024-01-15 07:55', zone: 'Zone F', hour:  7, orderId: 'ORD-97521', riderId: 'RDR-077', slaTarget: 30, actualTime: 29, breach: false, severity: 'low'    },
  { id: 'INC-4810', timestamp: '2024-01-15 20:03', zone: 'Zone E', hour: 20, orderId: 'ORD-98401', riderId: 'RDR-088', slaTarget: 30, actualTime: 44, breach: true,  severity: 'high'   },
  { id: 'INC-4809', timestamp: '2024-01-14 19:52', zone: 'Zone C', hour: 19, orderId: 'ORD-97844', riderId: 'RDR-015', slaTarget: 30, actualTime: 49, breach: true,  severity: 'high'   },
  { id: 'INC-4808', timestamp: '2024-01-14 19:38', zone: 'Zone F', hour: 19, orderId: 'ORD-97799', riderId: 'RDR-092', slaTarget: 30, actualTime: 35, breach: true,  severity: 'medium' },
  { id: 'INC-4807', timestamp: '2024-01-14 13:07', zone: 'Zone D', hour: 13, orderId: 'ORD-97601', riderId: 'RDR-028', slaTarget: 30, actualTime: 26, breach: false, severity: 'low'    },
  { id: 'INC-4806', timestamp: '2024-01-14 08:34', zone: 'Zone C', hour:  8, orderId: 'ORD-97412', riderId: 'RDR-042', slaTarget: 30, actualTime: 45, breach: true,  severity: 'high'   },
  { id: 'INC-4805', timestamp: '2024-01-13 21:02', zone: 'Zone C', hour: 21, orderId: 'ORD-97198', riderId: 'RDR-017', slaTarget: 30, actualTime: 39, breach: true,  severity: 'medium' },
  { id: 'INC-4804', timestamp: '2024-01-13 20:48', zone: 'Zone E', hour: 20, orderId: 'ORD-97154', riderId: 'RDR-061', slaTarget: 30, actualTime: 33, breach: true,  severity: 'low'    },
]

export const metrics = {
  totalOrders: 4821,
  breachRate: 0.127,
  avgDelivery: 26.4,
  activeRiders: 177,
  breachCount: 61,
}

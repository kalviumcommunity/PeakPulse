from schemas import Zone, Incident, MetricsSummary

# Mock data directly reflecting the frontend static data
ZONES = [
    Zone(id='A', name='Zone A', area='Downtown Core', riders=42, totalOrders=1247, breachRate=0.082, avgDelivery=24.1),
    Zone(id='B', name='Zone B', area='North District', riders=31, totalOrders=934, breachRate=0.104, avgDelivery=25.8),
    Zone(id='C', name='Zone C', area='East Suburbs', riders=28, totalOrders=876, breachRate=0.341, avgDelivery=31.7),
    Zone(id='D', name='Zone D', area='West Quarter', riders=35, totalOrders=1102, breachRate=0.063, avgDelivery=22.9),
    Zone(id='E', name='Zone E', area='South Bay', riders=22, totalOrders=723, breachRate=0.117, avgDelivery=26.3),
    Zone(id='F', name='Zone F', area='Harbor District', riders=19, totalOrders=589, breachRate=0.091, avgDelivery=24.7),
]

INCIDENTS = [
    Incident(id='INC-4821', timestamp='2024-01-15 20:17', zone='Zone C', hour=20, orderId='ORD-98447', riderId='RDR-015', slaTarget=30, actualTime=52, breach=True, severity='high'),
    Incident(id='INC-4820', timestamp='2024-01-15 19:43', zone='Zone C', hour=19, orderId='ORD-98231', riderId='RDR-042', slaTarget=30, actualTime=47, breach=True, severity='high'),
    Incident(id='INC-4818', timestamp='2024-01-15 19:12', zone='Zone E', hour=19, orderId='ORD-98104', riderId='RDR-061', slaTarget=30, actualTime=38, breach=True, severity='medium'),
    Incident(id='INC-4817', timestamp='2024-01-15 18:58', zone='Zone B', hour=18, orderId='ORD-98043', riderId='RDR-009', slaTarget=30, actualTime=34, breach=True, severity='low'),
    Incident(id='INC-4816', timestamp='2024-01-15 18:44', zone='Zone A', hour=18, orderId='ORD-97991', riderId='RDR-023', slaTarget=30, actualTime=28, breach=False, severity='low'),
]

METRICS = MetricsSummary(
    totalOrders=4821,
    breachRate=0.127,
    avgDelivery=26.4,
    activeRiders=177,
    breachCount=61,
)

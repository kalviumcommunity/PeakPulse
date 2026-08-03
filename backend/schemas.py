from pydantic import BaseModel


class Zone(BaseModel):
    id: str
    name: str
    area: str
    riders: int
    totalOrders: int
    breachRate: float
    avgDelivery: float


class Incident(BaseModel):
    id: str
    timestamp: str
    zone: str
    hour: int
    orderId: str
    riderId: str
    slaTarget: int
    actualTime: int
    breach: bool
    severity: str


class MetricsSummary(BaseModel):
    totalOrders: int
    breachRate: float
    avgDelivery: float
    activeRiders: int
    breachCount: int

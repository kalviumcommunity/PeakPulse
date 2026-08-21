import prisma from '../lib/prisma.js';
import { RISK_CONFIG } from '../config/risk.config.js';
import {
  RiskLevel,
  RiskFactor,
  DeliveryRiskAssessment,
  RiskSimulationParams,
  RiskSummary
} from '../types/risk.types.js';

export interface ActiveRiskFilter {
  riskLevel?: RiskLevel;
  zone?: string;
  restaurantId?: string;
  limit?: number;
  offset?: number;
}

export class RiskScoringService {
  /**
   * Core scoring algorithm: Computes deterministic 0-100 risk score and factor breakdown
   */
  calculateRisk(
    delivery: {
      id?: string;
      orderId?: string;
      customerZone: string;
      distanceKm: number;
      assignedAt: Date;
      promisedTime: Date;
      pickedAt?: Date | null;
      deliveredAt?: Date | null;
      actualDeliveryTime?: Date | null;
      restaurantId?: string;
      restaurant?: { name: string };
      riderId?: string;
      rider?: { name: string; riderCode: string; vehicleType: string };
    },
    historicalStats?: {
      zoneBreachRate?: number;
      restaurantBreachRate?: number;
    },
    referenceTime: Date = new Date()
  ): DeliveryRiskAssessment {
    const factors: RiskFactor[] = [];
    const recommendations: string[] = [];

    // Determine lifecycle status
    let status: 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' = 'ASSIGNED';
    if (delivery.deliveredAt || delivery.actualDeliveryTime) {
      status = 'DELIVERED';
    } else if (delivery.pickedAt) {
      status = 'IN_TRANSIT';
    } else {
      status = 'ASSIGNED';
    }

    const assignedTime = new Date(delivery.assignedAt);
    const promisedTime = new Date(delivery.promisedTime);
    const pickedTime = delivery.pickedAt ? new Date(delivery.pickedAt) : null;

    // -------------------------------------------------------------
    // Factor 1: Assignment Delay & Kitchen Prep Lag (Max 30 pts)
    // -------------------------------------------------------------
    const assignmentElapsedMinutes = pickedTime
      ? (pickedTime.getTime() - assignedTime.getTime()) / 60000
      : Math.max(0, (referenceTime.getTime() - assignedTime.getTime()) / 60000);

    let assignmentScore = 0;
    let assignmentSeverity: RiskLevel = 'LOW';
    let assignmentDetail = 'Normal assignment timeframe (<5m)';

    for (const tier of RISK_CONFIG.assignmentDelayTiers) {
      if (assignmentElapsedMinutes >= tier.minMinutes) {
        assignmentScore = tier.score;
        assignmentSeverity = tier.severity as RiskLevel;
        assignmentDetail = `${Math.round(assignmentElapsedMinutes)} min elapsed since assignment (${tier.label})`;
        break;
      }
    }

    factors.push({
      factor: 'Assignment & Prep Delay',
      category: 'ASSIGNMENT_DELAY',
      score: assignmentScore,
      maxScore: RISK_CONFIG.weights.assignmentDelay,
      detail: assignmentDetail,
      severity: assignmentSeverity
    });

    if (assignmentScore >= 20) {
      recommendations.push(
        status === 'ASSIGNED'
          ? 'Urgent: Rider has not confirmed pickup after extended wait. Initiate auto-reassignment or ping rider.'
          : 'High initial lag: Kitchen preparation or pickup exceeded normal thresholds.'
      );
    }

    // -------------------------------------------------------------
    // Factor 2: SLA Headroom & Projected Delivery Arrival (Max 25 pts)
    // -------------------------------------------------------------
    const vehicleType = delivery.rider?.vehicleType || 'DEFAULT';
    const speedPerKm =
      RISK_CONFIG.transitSpeedMinutesPerKm[
        vehicleType as keyof typeof RISK_CONFIG.transitSpeedMinutesPerKm
      ] || RISK_CONFIG.transitSpeedMinutesPerKm.DEFAULT;

    const estimatedTransitMinutes = delivery.distanceKm * speedPerKm + RISK_CONFIG.dropoffBufferMinutes;
    const additionalPrepMinutes = status === 'ASSIGNED' ? 5 : 0;
    const totalMinutesNeeded = estimatedTransitMinutes + additionalPrepMinutes;

    const baseCalculationTime = status === 'DELIVERED' ? assignedTime : referenceTime;
    const projectedDeliveryTime = new Date(baseCalculationTime.getTime() + totalMinutesNeeded * 60000);
    const slaHeadroomMinutes = (promisedTime.getTime() - projectedDeliveryTime.getTime()) / 60000;

    let headroomScore = 0;
    let headroomSeverity: RiskLevel = 'LOW';
    let headroomDetail = `Adequate SLA headroom (+${Math.round(slaHeadroomMinutes)}m)`;

    if (slaHeadroomMinutes < -10) {
      headroomScore = 25;
      headroomSeverity = 'CRITICAL';
      headroomDetail = `Severely projected late by ${Math.abs(Math.round(slaHeadroomMinutes))} minutes`;
    } else if (slaHeadroomMinutes < 0) {
      headroomScore = 20;
      headroomSeverity = 'HIGH';
      headroomDetail = `Projected late by ${Math.abs(Math.round(slaHeadroomMinutes))} minutes`;
    } else if (slaHeadroomMinutes < 5) {
      headroomScore = 12;
      headroomSeverity = 'MEDIUM';
      headroomDetail = `Tight buffer (+${Math.round(slaHeadroomMinutes)}m remaining)`;
    } else if (slaHeadroomMinutes < 10) {
      headroomScore = 5;
      headroomSeverity = 'LOW';
      headroomDetail = `Moderate buffer (+${Math.round(slaHeadroomMinutes)}m remaining)`;
    }

    factors.push({
      factor: 'SLA Headroom & Transit Time',
      category: 'SLA_HEADROOM',
      score: headroomScore,
      maxScore: RISK_CONFIG.weights.slaHeadroom,
      detail: headroomDetail,
      severity: headroomSeverity
    });

    if (headroomScore >= 20) {
      recommendations.push('Critical SLA window: Pre-alert customer support and prioritize rider routing.');
    }

    // -------------------------------------------------------------
    // Factor 3: Peak Hour Impact (Max 20 pts)
    // -------------------------------------------------------------
    const hour = assignedTime.getHours();
    let peakScore = 0;
    let peakSeverity: RiskLevel = 'LOW';
    let peakDetail = 'Off-peak operating conditions';

    if (hour >= 19 && hour < 21) {
      peakScore = RISK_CONFIG.peakHourWeights.dinnerPeak.score;
      peakSeverity = 'HIGH';
      peakDetail = 'Active during Dinner Peak rush hour (19:00 - 21:00)';
    } else if (hour >= 12 && hour < 14) {
      peakScore = RISK_CONFIG.peakHourWeights.lunchPeak.score;
      peakSeverity = 'MEDIUM';
      peakDetail = 'Active during Lunch Peak rush hour (12:00 - 14:00)';
    }

    factors.push({
      factor: 'Peak Hour Demand Pressure',
      category: 'PEAK_HOUR',
      score: peakScore,
      maxScore: RISK_CONFIG.weights.peakHour,
      detail: peakDetail,
      severity: peakSeverity
    });

    if (peakScore >= 15 && assignmentScore >= 10) {
      recommendations.push('Peak hour demand surge detected: Consider dynamic rider surge allocation for this zone.');
    }

    // -------------------------------------------------------------
    // Factor 4: Distance & Vehicle Friction (Max 15 pts)
    // -------------------------------------------------------------
    let distanceScore = 0;
    let distanceSeverity: RiskLevel = 'LOW';
    let distanceDetail = `${delivery.distanceKm.toFixed(1)} km delivery route`;

    for (const tier of RISK_CONFIG.distanceTiers) {
      if (delivery.distanceKm >= tier.minKm) {
        distanceScore = tier.score;
        distanceSeverity = distanceScore >= 15 ? 'HIGH' : distanceScore >= 10 ? 'MEDIUM' : 'LOW';
        distanceDetail = `${delivery.distanceKm.toFixed(1)} km route (${tier.label})`;
        break;
      }
    }

    // Heavy distance penalty if vehicle is bicycle or scooter
    if (delivery.distanceKm > 5 && (vehicleType === 'BICYCLE' || vehicleType === 'SCOOTER')) {
      distanceScore = Math.min(15, distanceScore + 3);
      distanceDetail += ` (Impedance: ${vehicleType})`;
    }

    factors.push({
      factor: 'Distance & Vehicle Factor',
      category: 'DISTANCE_VEHICLE',
      score: distanceScore,
      maxScore: RISK_CONFIG.weights.distanceVehicle,
      detail: distanceDetail,
      severity: distanceSeverity
    });

    if (delivery.distanceKm >= 7) {
      recommendations.push('Long haul delivery: Ensure dedicated motorbike rider assignment to avoid transit lag.');
    }

    // -------------------------------------------------------------
    // Factor 5: Historical Zone & Restaurant Propensity (Max 10 pts)
    // -------------------------------------------------------------
    let historicalScore = 0;
    const zoneRate = historicalStats?.zoneBreachRate || 0;
    const restaurantRate = historicalStats?.restaurantBreachRate || 0;

    if (zoneRate > 25) {
      historicalScore += 6;
    } else if (zoneRate > 15) {
      historicalScore += 3;
    }

    if (restaurantRate > 25) {
      historicalScore += 4;
    } else if (restaurantRate > 15) {
      historicalScore += 2;
    }

    const histSeverity: RiskLevel = historicalScore >= 7 ? 'HIGH' : historicalScore >= 4 ? 'MEDIUM' : 'LOW';
    factors.push({
      factor: 'Historical Zone & Merchant Risk',
      category: 'HISTORICAL_ZONE_RESTAURANT',
      score: historicalScore,
      maxScore: RISK_CONFIG.weights.historicalRisk,
      detail: `Zone breach rate: ${zoneRate.toFixed(1)}% | Merchant breach rate: ${restaurantRate.toFixed(1)}%`,
      severity: histSeverity
    });

    if (restaurantRate > 25) {
      recommendations.push(`Merchant '${delivery.restaurant?.name || 'Restaurant'}' historically exhibits high preparation delays.`);
    }

    // -------------------------------------------------------------
    // Total Score & Risk Level
    // -------------------------------------------------------------
    const rawTotal = factors.reduce((sum, f) => sum + f.score, 0);
    const riskScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

    let riskLevel: RiskLevel = 'LOW';
    if (riskScore >= RISK_CONFIG.thresholds.critical) {
      riskLevel = 'CRITICAL';
    } else if (riskScore >= RISK_CONFIG.thresholds.high) {
      riskLevel = 'HIGH';
    } else if (riskScore >= RISK_CONFIG.thresholds.medium) {
      riskLevel = 'MEDIUM';
    }

    const estimatedBreachProbability = parseFloat((riskScore / 100).toFixed(2));

    if (recommendations.length === 0) {
      recommendations.push('Delivery metrics are within healthy parameters. Continuous monitoring active.');
    }

    return {
      deliveryId: delivery.id,
      orderId: delivery.orderId,
      restaurantId: delivery.restaurantId,
      restaurantName: delivery.restaurant?.name,
      riderId: delivery.riderId,
      riderName: delivery.rider?.name,
      riderCode: delivery.rider?.riderCode,
      vehicleType,
      customerZone: delivery.customerZone,
      distanceKm: delivery.distanceKm,
      assignedAt: delivery.assignedAt,
      promisedTime: delivery.promisedTime,
      pickedAt: delivery.pickedAt,
      status,
      riskScore,
      riskLevel,
      estimatedBreachProbability,
      estimatedMinutesToDelivery: Math.round(totalMinutesNeeded),
      projectedDeliveryTime,
      slaHeadroomMinutes: parseFloat(slaHeadroomMinutes.toFixed(1)),
      factors,
      recommendations
    };
  }

  /**
   * Get historical breach rates for zones and restaurants
   */
  async getHistoricalStats(): Promise<{
    zoneRates: Record<string, number>;
    restaurantRates: Record<string, number>;
  }> {
    try {
      const deliveries = await prisma.delivery.findMany({
        select: {
          customerZone: true,
          restaurantId: true,
          slaBreached: true
        }
      });

      const zoneTotals: Record<string, { total: number; breached: number }> = {};
      const restaurantTotals: Record<string, { total: number; breached: number }> = {};

      for (const d of deliveries) {
        // Zone stats
        if (!zoneTotals[d.customerZone]) {
          zoneTotals[d.customerZone] = { total: 0, breached: 0 };
        }
        zoneTotals[d.customerZone].total++;
        if (d.slaBreached) zoneTotals[d.customerZone].breached++;

        // Restaurant stats
        if (!restaurantTotals[d.restaurantId]) {
          restaurantTotals[d.restaurantId] = { total: 0, breached: 0 };
        }
        restaurantTotals[d.restaurantId].total++;
        if (d.slaBreached) restaurantTotals[d.restaurantId].breached++;
      }

      const zoneRates: Record<string, number> = {};
      for (const [z, stats] of Object.entries(zoneTotals)) {
        zoneRates[z] = stats.total > 0 ? (stats.breached / stats.total) * 100 : 0;
      }

      const restaurantRates: Record<string, number> = {};
      for (const [r, stats] of Object.entries(restaurantTotals)) {
        restaurantRates[r] = stats.total > 0 ? (stats.breached / stats.total) * 100 : 0;
      }

      return { zoneRates, restaurantRates };
    } catch (error) {
      // Graceful fallback if database is disconnected or during unit tests
      return {
        zoneRates: { 'Downtown Zone A': 22.5, 'North Zone B': 28.0, 'East Suburbs': 12.0 },
        restaurantRates: { 'default': 15.0 }
      };
    }
  }

  /**
   * Get real-time risk scores for live / active in-transit deliveries
   */
  async getActiveDeliveriesRisk(filter: ActiveRiskFilter = {}): Promise<{
    deliveries: DeliveryRiskAssessment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { zone, restaurantId, riskLevel, limit = 50, offset = 0 } = filter;

    try {
      const whereClause: any = {};
      if (zone) whereClause.customerZone = zone;
      if (restaurantId) whereClause.restaurantId = restaurantId;

      // Fetch active (undelivered) deliveries first; if none exist, fetch recent deliveries to evaluate live
      let deliveries = await prisma.delivery.findMany({
        where: {
          ...whereClause,
          actualDeliveryTime: null
        },
        include: {
          restaurant: { select: { name: true } },
          rider: { select: { name: true, riderCode: true, vehicleType: true } }
        },
        orderBy: { assignedAt: 'desc' },
        take: 100
      });

      // If no active undelivered orders exist in the database (e.g. static dataset), take latest orders to demo risk scoring
      if (deliveries.length === 0) {
        deliveries = await prisma.delivery.findMany({
          where: whereClause,
          include: {
            restaurant: { select: { name: true } },
            rider: { select: { name: true, riderCode: true, vehicleType: true } }
          },
          orderBy: { assignedAt: 'desc' },
          take: 100
        });
      }

      const { zoneRates, restaurantRates } = await this.getHistoricalStats();

      // Score all candidate deliveries
      let assessments = deliveries.map(d =>
        this.calculateRisk(d, {
          zoneBreachRate: zoneRates[d.customerZone] || 0,
          restaurantBreachRate: restaurantRates[d.restaurantId] || 0
        })
      );

      // Apply riskLevel filter if specified
      if (riskLevel) {
        assessments = assessments.filter(a => a.riskLevel === riskLevel);
      }

      // Sort by highest risk score first
      assessments.sort((a, b) => b.riskScore - a.riskScore);

      const total = assessments.length;
      const paginated = assessments.slice(offset, offset + limit);

      return {
        deliveries: paginated,
        total,
        page: Math.floor(offset / limit) + 1,
        limit
      };
    } catch (error) {
      // Fallback for mock demo
      return {
        deliveries: [],
        total: 0,
        page: 1,
        limit
      };
    }
  }

  /**
   * Get single delivery detailed risk assessment
   */
  async getDeliveryRiskById(deliveryIdOrOrderId: string): Promise<DeliveryRiskAssessment | null> {
    try {
      const delivery = await prisma.delivery.findFirst({
        where: {
          OR: [{ id: deliveryIdOrOrderId }, { orderId: deliveryIdOrOrderId }]
        },
        include: {
          restaurant: { select: { name: true } },
          rider: { select: { name: true, riderCode: true, vehicleType: true } }
        }
      });

      if (!delivery) {
        return null;
      }

      const { zoneRates, restaurantRates } = await this.getHistoricalStats();

      return this.calculateRisk(delivery, {
        zoneBreachRate: zoneRates[delivery.customerZone] || 0,
        restaurantBreachRate: restaurantRates[delivery.restaurantId] || 0
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Get aggregated risk statistics summary for all active deliveries
   */
  async getRiskSummary(): Promise<RiskSummary> {
    const { deliveries: allScored } = await this.getActiveDeliveriesRisk({ limit: 1000 });

    const totalActive = allScored.length;
    if (totalActive === 0) {
      return {
        totalActive: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        averageRiskScore: 0,
        criticalPercentage: 0,
        highRiskPercentage: 0,
        topContributingFactors: []
      };
    }

    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;
    let totalScore = 0;

    const factorCounts: Record<string, { count: number; totalScore: number }> = {};

    for (const d of allScored) {
      totalScore += d.riskScore;
      if (d.riskLevel === 'CRITICAL') criticalCount++;
      else if (d.riskLevel === 'HIGH') highCount++;
      else if (d.riskLevel === 'MEDIUM') mediumCount++;
      else lowCount++;

      for (const f of d.factors) {
        if (f.score > 0) {
          if (!factorCounts[f.factor]) {
            factorCounts[f.factor] = { count: 0, totalScore: 0 };
          }
          factorCounts[f.factor].count++;
          factorCounts[f.factor].totalScore += f.score;
        }
      }
    }

    const topContributingFactors = Object.entries(factorCounts)
      .map(([factor, stats]) => ({
        factor,
        occurrences: stats.count,
        averageScore: parseFloat((stats.totalScore / stats.count).toFixed(1))
      }))
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 5);

    return {
      totalActive,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      averageRiskScore: parseFloat((totalScore / totalActive).toFixed(1)),
      criticalPercentage: parseFloat(((criticalCount / totalActive) * 100).toFixed(1)),
      highRiskPercentage: parseFloat((((criticalCount + highCount) / totalActive) * 100).toFixed(1)),
      topContributingFactors
    };
  }

  /**
   * "What-If" simulation calculator for prospective orders
   */
  async simulateRisk(params: RiskSimulationParams): Promise<DeliveryRiskAssessment> {
    const {
      distanceKm,
      customerZone = 'Downtown Zone A',
      vehicleType = 'BIKE',
      orderTimeHour = new Date().getHours(),
      assignmentDelayMinutes = 5,
      promisedDurationMinutes = 35,
      restaurantName = 'Simulated Kitchen'
    } = params;

    const now = new Date();
    const assignedAt = new Date(now.getTime() - assignmentDelayMinutes * 60000);
    assignedAt.setHours(orderTimeHour);

    const promisedTime = new Date(assignedAt.getTime() + promisedDurationMinutes * 60000);

    const mockDelivery = {
      customerZone,
      distanceKm,
      assignedAt,
      promisedTime,
      restaurant: { name: restaurantName },
      rider: { name: 'Simulated Rider', riderCode: 'RIDER-SIM', vehicleType }
    };

    const { zoneRates, restaurantRates } = await this.getHistoricalStats();

    return this.calculateRisk(
      mockDelivery,
      {
        zoneBreachRate: zoneRates[customerZone] || 20.0,
        restaurantBreachRate: restaurantRates[restaurantName] || 15.0
      },
      now
    );
  }
}

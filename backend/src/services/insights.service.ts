import { AnalyticsService } from './analytics.service.js';
import { PeakHoursService } from './peak-hours.service.js';
import { PEAK_HOURS_CONFIG } from '../config/peak-hours.config.js';

export type InsightSeverity = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface Insight {
  type: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  metrics: Record<string, any>;
}

interface InsightFilter {
  startDate?: string;
  endDate?: string;
  zone?: string;
  restaurantId?: string;
  riderId?: string;
}

export class InsightsService {
  private analyticsService: AnalyticsService;
  private peakHoursService: PeakHoursService;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.peakHoursService = new PeakHoursService();
  }

  async generateInsights(filter: InsightFilter): Promise<Insight[]> {
    const insights: Insight[] = [];

    try {
      // Fetch all analytics data in parallel
      const [overview, peakComparison, deliveryAnalytics, hourlyAnalytics, riskPatterns] = await Promise.all([
        this.analyticsService.getOverview(filter),
        this.peakHoursService.getPeakComparison(filter),
        this.analyticsService.getDeliveryAnalytics(filter),
        this.peakHoursService.getHourlyAnalytics(filter),
        this.peakHoursService.getRiskPatterns(filter),
      ]);

      // Check minimum sample size
      const hasEnoughData = overview.totalDeliveries >= PEAK_HOURS_CONFIG.minimumSampleSize;

      if (!hasEnoughData) {
        return [{
          type: 'INSUFFICIENT_DATA',
          title: 'Insufficient data for insights',
          description: `Only ${overview.totalDeliveries} deliveries found. At least ${PEAK_HOURS_CONFIG.minimumSampleSize} deliveries are required for meaningful insights.`,
          severity: 'INFO',
          metrics: {
            totalDeliveries: overview.totalDeliveries,
            minimumRequired: PEAK_HOURS_CONFIG.minimumSampleSize
          }
        }];
      }

      // Generate Peak-Hour SLA Deterioration Insight
      const peakInsight = this.generatePeakHourInsight(peakComparison);
      if (peakInsight) insights.push(peakInsight);

      // Generate Hourly Peak Insights
      const hourlyInsights = this.generateHourlyPeakInsights(hourlyAnalytics);
      insights.push(...hourlyInsights);

      // Generate Zone Insights
      const zoneInsights = this.generateZoneInsights(deliveryAnalytics.zoneStats);
      insights.push(...zoneInsights);

      // Generate Restaurant Insights
      const restaurantInsights = this.generateRestaurantInsights(deliveryAnalytics.topRestaurants);
      insights.push(...restaurantInsights);

      // Generate Risk Pattern Insights
      const riskInsights = this.generateRiskPatternInsights(riskPatterns);
      insights.push(...riskInsights);

      // Generate Overall Performance Insight
      const overallInsight = this.generateOverallPerformanceInsight(overview);
      if (overallInsight) insights.push(overallInsight);

      // Sort by severity (HIGH > MEDIUM > LOW > INFO)
      const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2, INFO: 3 };
      insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  private generatePeakHourInsight(comparison: any): Insight | null {
    const { peak, nonPeak, breachRateDifference } = comparison;

    // Only generate if there's meaningful data
    if (peak.totalDeliveries < PEAK_HOURS_CONFIG.minimumSampleSize) {
      return null;
    }

    // Significant deterioration during peak hours
    if (breachRateDifference > 5) {
      const severity: InsightSeverity = breachRateDifference > 15 ? 'HIGH' : breachRateDifference > 10 ? 'MEDIUM' : 'LOW';
      
      return {
        type: 'PEAK_HOUR_DETERIORATION',
        title: 'Peak hours show elevated SLA breaches',
        description: `SLA breach rate is ${peak.slaBreachRate.toFixed(1)}% during peak hours, compared with ${nonPeak.slaBreachRate.toFixed(1)}% during non-peak hours. This ${breachRateDifference.toFixed(1)}% difference indicates capacity strain during high-demand periods.`,
        severity,
        metrics: {
          peakBreachRate: peak.slaBreachRate,
          nonPeakBreachRate: nonPeak.slaBreachRate,
          difference: breachRateDifference,
          peakDeliveries: peak.totalDeliveries,
          peakAverageDelay: peak.averageDelay
        }
      };
    }

    // Peak hours performing better (unusual but possible)
    if (breachRateDifference < -5) {
      return {
        type: 'PEAK_HOUR_PERFORMANCE',
        title: 'Peak hours outperforming non-peak',
        description: `Interestingly, peak hours have a ${Math.abs(breachRateDifference).toFixed(1)}% lower breach rate (${peak.slaBreachRate.toFixed(1)}%) than non-peak periods (${nonPeak.slaBreachRate.toFixed(1)}%). This may indicate effective peak-hour resource allocation.`,
        severity: 'INFO',
        metrics: {
          peakBreachRate: peak.slaBreachRate,
          nonPeakBreachRate: nonPeak.slaBreachRate,
          difference: breachRateDifference,
          peakDeliveries: peak.totalDeliveries
        }
      };
    }

    return null;
  }

  private generateHourlyPeakInsights(hourlyAnalytics: any[]): Insight[] {
    const insights: Insight[] = [];

    // Find worst performing peak hour
    const peakHours = hourlyAnalytics.filter(h => h.peakHour && h.totalDeliveries >= PEAK_HOURS_CONFIG.minimumSampleSize);
    
    if (peakHours.length === 0) return insights;

    const worstPeakHour = peakHours.reduce((worst, current) =>
      current.slaBreachRate > worst.slaBreachRate ? current : worst
    );

    if (worstPeakHour.slaBreachRate > 25) {
      const timeRange = this.getTimeRangeLabel(worstPeakHour.hour);
      const severity: InsightSeverity = worstPeakHour.slaBreachRate > 35 ? 'HIGH' : 'MEDIUM';

      insights.push({
        type: 'WORST_PEAK_HOUR',
        title: `${timeRange} shows critical SLA performance`,
        description: `Hour ${worstPeakHour.hour}:00 has the highest breach rate at ${worstPeakHour.slaBreachRate.toFixed(1)}% with ${worstPeakHour.totalDeliveries} deliveries. Average delay is ${worstPeakHour.averageDelay.toFixed(1)} minutes. Consider additional capacity during this period.`,
        severity,
        metrics: {
          hour: worstPeakHour.hour,
          breachRate: worstPeakHour.slaBreachRate,
          totalDeliveries: worstPeakHour.totalDeliveries,
          averageDelay: worstPeakHour.averageDelay
        }
      });
    }

    return insights;
  }

  private generateZoneInsights(zoneStats: any[]): Insight[] {
    const insights: Insight[] = [];

    // Filter zones with sufficient data
    const validZones = zoneStats.filter(z => z.totalDeliveries >= PEAK_HOURS_CONFIG.minimumSampleSize);

    if (validZones.length === 0) return insights;

    // Find highest risk zone
    const highestRiskZone = validZones.reduce((highest, current) =>
      current.breachRate > highest.breachRate ? current : highest
    );

    if (highestRiskZone.breachRate > 20) {
      const severity: InsightSeverity = highestRiskZone.breachRate > 30 ? 'HIGH' : highestRiskZone.breachRate > 25 ? 'MEDIUM' : 'LOW';

      insights.push({
        type: 'HIGH_RISK_ZONE',
        title: `Zone ${highestRiskZone.zone} requires attention`,
        description: `Zone ${highestRiskZone.zone} has a ${highestRiskZone.breachRate.toFixed(1)}% SLA breach rate with ${highestRiskZone.totalDeliveries} deliveries. This is significantly higher than other zones and indicates potential coverage or capacity issues.`,
        severity,
        metrics: {
          zone: highestRiskZone.zone,
          breachRate: highestRiskZone.breachRate,
          totalDeliveries: highestRiskZone.totalDeliveries,
          breachedDeliveries: highestRiskZone.breachedDeliveries
        }
      });
    }

    // Identify zones performing well
    const bestZone = validZones.reduce((best, current) =>
      current.breachRate < best.breachRate ? current : best
    );

    if (bestZone.breachRate < 10 && bestZone.totalDeliveries >= PEAK_HOURS_CONFIG.minimumSampleSize) {
      insights.push({
        type: 'BEST_PERFORMING_ZONE',
        title: `Zone ${bestZone.zone} showing excellent performance`,
        description: `Zone ${bestZone.zone} maintains a low ${bestZone.breachRate.toFixed(1)}% breach rate across ${bestZone.totalDeliveries} deliveries. Consider analyzing this zone's practices for replication in other areas.`,
        severity: 'INFO',
        metrics: {
          zone: bestZone.zone,
          breachRate: bestZone.breachRate,
          totalDeliveries: bestZone.totalDeliveries
        }
      });
    }

    return insights;
  }

  private generateRestaurantInsights(topRestaurants: any[]): Insight[] {
    const insights: Insight[] = [];

    // Filter restaurants with sufficient data
    const validRestaurants = topRestaurants.filter(r => r.totalDeliveries >= PEAK_HOURS_CONFIG.minimumSampleSize);

    if (validRestaurants.length === 0) return insights;

    // Find highest risk restaurant
    const highestRiskRestaurant = validRestaurants.reduce((highest, current) =>
      current.breachRate > highest.breachRate ? current : highest
    );

    if (highestRiskRestaurant.breachRate > 25) {
      const severity: InsightSeverity = highestRiskRestaurant.breachRate > 35 ? 'HIGH' : 'MEDIUM';

      insights.push({
        type: 'HIGH_RISK_RESTAURANT',
        title: `${highestRiskRestaurant.name} has elevated breach rate`,
        description: `Restaurant "${highestRiskRestaurant.name}" shows a ${highestRiskRestaurant.breachRate.toFixed(1)}% breach rate across ${highestRiskRestaurant.totalDeliveries} deliveries. Consider investigating preparation times or pickup coordination.`,
        severity,
        metrics: {
          restaurantId: highestRiskRestaurant.id,
          restaurantName: highestRiskRestaurant.name,
          breachRate: highestRiskRestaurant.breachRate,
          totalDeliveries: highestRiskRestaurant.totalDeliveries,
          breachedDeliveries: highestRiskRestaurant.breachedDeliveries
        }
      });
    }

    return insights;
  }

  private generateRiskPatternInsights(riskPatterns: any[]): Insight[] {
    const insights: Insight[] = [];

    if (riskPatterns.length === 0) return insights;

    // Top 3 risk patterns
    const topPatterns = riskPatterns.slice(0, 3).filter(p => p.slaBreachRate > 20);

    topPatterns.forEach((pattern, index) => {
      if (index === 0 && pattern.slaBreachRate > 30) {
        // Highest risk pattern gets special attention
        const severity: InsightSeverity = pattern.slaBreachRate > 40 ? 'HIGH' : 'MEDIUM';
        const patternType = this.categorizePattern(pattern.pattern);

        insights.push({
          type: patternType,
          title: `Critical pattern: ${pattern.pattern}`,
          description: `The combination "${pattern.pattern}" shows a ${pattern.slaBreachRate.toFixed(1)}% breach rate across ${pattern.totalDeliveries} deliveries. This specific pattern requires immediate operational review.`,
          severity,
          metrics: {
            pattern: pattern.pattern,
            breachRate: pattern.slaBreachRate,
            totalDeliveries: pattern.totalDeliveries,
            slaBreaches: pattern.slaBreaches
          }
        });
      }
    });

    // Check for distance-related patterns
    const distancePatterns = riskPatterns.filter(p => p.pattern.includes('km'));
    if (distancePatterns.length > 0 && distancePatterns[0].slaBreachRate > 25) {
      const topDistance = distancePatterns[0];
      insights.push({
        type: 'DISTANCE_RISK',
        title: 'Distance-related delivery challenges',
        description: `Deliveries in the "${topDistance.pattern}" category show ${topDistance.slaBreachRate.toFixed(1)}% breach rate. Long-distance deliveries may need route optimization or additional riders.`,
        severity: 'MEDIUM',
        metrics: {
          pattern: topDistance.pattern,
          breachRate: topDistance.slaBreachRate,
          totalDeliveries: topDistance.totalDeliveries
        }
      });
    }

    // Check for assignment delay patterns
    const assignmentPatterns = riskPatterns.filter(p => p.pattern.includes('Assignment'));
    if (assignmentPatterns.length > 0 && assignmentPatterns[0].slaBreachRate > 30) {
      const topAssignment = assignmentPatterns[0];
      insights.push({
        type: 'ASSIGNMENT_DELAY_RISK',
        title: 'Assignment delays impacting SLA',
        description: `Pattern "${topAssignment.pattern}" shows ${topAssignment.slaBreachRate.toFixed(1)}% breach rate. Slow order-to-rider assignment is a key contributor to SLA violations.`,
        severity: 'HIGH',
        metrics: {
          pattern: topAssignment.pattern,
          breachRate: topAssignment.slaBreachRate,
          totalDeliveries: topAssignment.totalDeliveries
        }
      });
    }

    // Check for pickup delay patterns
    const pickupPatterns = riskPatterns.filter(p => p.pattern.includes('Pickup'));
    if (pickupPatterns.length > 0 && pickupPatterns[0].slaBreachRate > 30) {
      const topPickup = pickupPatterns[0];
      insights.push({
        type: 'PICKUP_DELAY_RISK',
        title: 'Pickup delays affecting performance',
        description: `Pattern "${topPickup.pattern}" has ${topPickup.slaBreachRate.toFixed(1)}% breach rate. Extended pickup-to-delivery times suggest route efficiency issues or traffic congestion.`,
        severity: 'MEDIUM',
        metrics: {
          pattern: topPickup.pattern,
          breachRate: topPickup.slaBreachRate,
          totalDeliveries: topPickup.totalDeliveries
        }
      });
    }

    return insights;
  }

  private generateOverallPerformanceInsight(overview: any): Insight | null {
    // Overall system health check
    if (overview.totalDeliveries < PEAK_HOURS_CONFIG.minimumSampleSize) {
      return null;
    }

    if (overview.slaBreachPercentage < 10) {
      return {
        type: 'HEALTHY_SYSTEM',
        title: 'System operating within SLA targets',
        description: `Overall breach rate of ${overview.slaBreachPercentage.toFixed(1)}% is within acceptable thresholds across ${overview.totalDeliveries.toLocaleString()} deliveries. Continue monitoring for emerging patterns.`,
        severity: 'INFO',
        metrics: {
          slaBreachPercentage: overview.slaBreachPercentage,
          totalDeliveries: overview.totalDeliveries,
          averageDelay: overview.averageDelay,
          complaintRate: overview.complaintRate
        }
      };
    }

    if (overview.slaBreachPercentage > 20) {
      const severity: InsightSeverity = overview.slaBreachPercentage > 30 ? 'HIGH' : 'MEDIUM';
      return {
        type: 'SYSTEM_WIDE_ISSUE',
        title: 'System-wide SLA performance concern',
        description: `Overall breach rate of ${overview.slaBreachPercentage.toFixed(1)}% indicates system-wide challenges. ${overview.slaBreaches.toLocaleString()} deliveries breached SLA with an average delay of ${overview.averageDelay.toFixed(1)} minutes. Comprehensive operational review recommended.`,
        severity,
        metrics: {
          slaBreachPercentage: overview.slaBreachPercentage,
          slaBreaches: overview.slaBreaches,
          totalDeliveries: overview.totalDeliveries,
          averageDelay: overview.averageDelay,
          complaintRate: overview.complaintRate,
          refundRate: overview.refundRate
        }
      };
    }

    return null;
  }

  private categorizePattern(pattern: string): string {
    if (pattern.includes('Zone')) return 'ZONE_PEAK_RISK';
    if (pattern.includes('Assignment')) return 'ASSIGNMENT_DELAY_RISK';
    if (pattern.includes('Pickup')) return 'PICKUP_DELAY_RISK';
    if (pattern.includes('km')) return 'DISTANCE_RISK';
    if (pattern.toLowerCase().includes('restaurant')) return 'RESTAURANT_PEAK_RISK';
    return 'PATTERN_RISK';
  }

  private getTimeRangeLabel(hour: number): string {
    if (hour >= 12 && hour < 14) return 'Lunch period';
    if (hour >= 19 && hour < 21) return 'Dinner period';
    if (hour >= 6 && hour < 12) return 'Morning period';
    if (hour >= 14 && hour < 19) return 'Afternoon period';
    if (hour >= 21 || hour < 6) return 'Late night period';
    return `Hour ${hour}`;
  }
}

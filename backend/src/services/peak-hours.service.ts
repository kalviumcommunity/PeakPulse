import prisma from '../lib/prisma.js';
import { PEAK_HOURS_CONFIG, isPeakHour, getPeakLabel } from '../config/peak-hours.config.js';

interface PeakHourFilter {
  startDate?: string;
  endDate?: string;
  zone?: string;
  restaurantId?: string;
  riderId?: string;
}

export class PeakHoursService {
  async getHourlyAnalytics(filter: PeakHourFilter) {
    const whereClause: any = {};

    if (filter.startDate && filter.endDate) {
      whereClause.assignedAt = {
        gte: new Date(filter.startDate),
        lte: new Date(filter.endDate)
      };
    }

    if (filter.zone) {
      whereClause.customerZone = filter.zone;
    }

    if (filter.restaurantId) {
      whereClause.restaurantId = filter.restaurantId;
    }

    if (filter.riderId) {
      whereClause.riderId = filter.riderId;
    }

    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      select: {
        assignedAt: true,
        deliveredAt: true,
        actualDeliveryTime: true,
        promisedTime: true,
        slaBreached: true
      }
    });

    const hourlyStats: any = {};

    for (let hour = 0; hour < 24; hour++) {
      hourlyStats[hour] = {
        totalDeliveries: 0,
        slaBreaches: 0,
        deliveryTimes: [],
        delays: []
      };
    }

    deliveries.forEach((delivery: any) => {
      const hour = delivery.assignedAt.getHours();

      hourlyStats[hour].totalDeliveries++;

      if (delivery.slaBreached) {
        hourlyStats[hour].slaBreaches++;
      }

      if (delivery.actualDeliveryTime && delivery.assignedAt) {
        const deliveryTime = (delivery.actualDeliveryTime.getTime() - delivery.assignedAt.getTime()) / 60000;
        hourlyStats[hour].deliveryTimes.push(deliveryTime);
      }

      if (delivery.slaBreached && delivery.actualDeliveryTime && delivery.promisedTime) {
        const delay = Math.max(0, (delivery.actualDeliveryTime.getTime() - delivery.promisedTime.getTime()) / 60000);
        hourlyStats[hour].delays.push(delay);
      }
    });

    const result = Object.keys(hourlyStats).map((hourStr: string) => {
      const hour = parseInt(hourStr);
      const stats = hourlyStats[hour];

      const avgDeliveryTime = stats.deliveryTimes.length > 0
        ? stats.deliveryTimes.reduce((sum: number, t: number) => sum + t, 0) / stats.deliveryTimes.length
        : 0;

      const avgDelay = stats.delays.length > 0
        ? stats.delays.reduce((sum: number, d: number) => sum + d, 0) / stats.delays.length
        : 0;

      return {
        hour,
        peakHour: isPeakHour(hour),
        totalDeliveries: stats.totalDeliveries,
        slaBreaches: stats.slaBreaches,
        slaBreachRate: stats.totalDeliveries > 0
          ? parseFloat(((stats.slaBreaches / stats.totalDeliveries) * 100).toFixed(2))
          : 0,
        averageDeliveryTime: parseFloat(avgDeliveryTime.toFixed(2)),
        averageDelay: parseFloat(avgDelay.toFixed(2))
      };
    });

    return result;
  }

  async getPeakComparison(filter: PeakHourFilter) {
    const whereClause: any = {};

    if (filter.startDate && filter.endDate) {
      whereClause.assignedAt = {
        gte: new Date(filter.startDate),
        lte: new Date(filter.endDate)
      };
    }

    if (filter.zone) {
      whereClause.customerZone = filter.zone;
    }

    if (filter.restaurantId) {
      whereClause.restaurantId = filter.restaurantId;
    }

    if (filter.riderId) {
      whereClause.riderId = filter.riderId;
    }

    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      select: {
        assignedAt: true,
        deliveredAt: true,
        actualDeliveryTime: true,
        promisedTime: true,
        slaBreached: true
      }
    });

    const peakStats = {
      totalDeliveries: 0,
      slaBreaches: 0,
      delays: [] as number[]
    };

    const nonPeakStats = {
      totalDeliveries: 0,
      slaBreaches: 0,
      delays: [] as number[]
    };

    deliveries.forEach((delivery: any) => {
      const hour = delivery.assignedAt.getHours();
      const isPeak = isPeakHour(hour);

      const stats = isPeak ? peakStats : nonPeakStats;

      stats.totalDeliveries++;

      if (delivery.slaBreached) {
        stats.slaBreaches++;

        if (delivery.actualDeliveryTime && delivery.promisedTime) {
          const delay = Math.max(0, (delivery.actualDeliveryTime.getTime() - delivery.promisedTime.getTime()) / 60000);
          stats.delays.push(delay);
        }
      }
    });

    const peakAvgDelay = peakStats.delays.length > 0
      ? peakStats.delays.reduce((sum: number, d: number) => sum + d, 0) / peakStats.delays.length
      : 0;

    const nonPeakAvgDelay = nonPeakStats.delays.length > 0
      ? nonPeakStats.delays.reduce((sum: number, d: number) => sum + d, 0) / nonPeakStats.delays.length
      : 0;

    const peakBreachRate = peakStats.totalDeliveries > 0
      ? (peakStats.slaBreaches / peakStats.totalDeliveries) * 100
      : 0;

    const nonPeakBreachRate = nonPeakStats.totalDeliveries > 0
      ? (nonPeakStats.slaBreaches / nonPeakStats.totalDeliveries) * 100
      : 0;

    return {
      peak: {
        totalDeliveries: peakStats.totalDeliveries,
        slaBreaches: peakStats.slaBreaches,
        slaBreachRate: parseFloat(peakBreachRate.toFixed(2)),
        averageDelay: parseFloat(peakAvgDelay.toFixed(2))
      },
      nonPeak: {
        totalDeliveries: nonPeakStats.totalDeliveries,
        slaBreaches: nonPeakStats.slaBreaches,
        slaBreachRate: parseFloat(nonPeakBreachRate.toFixed(2)),
        averageDelay: parseFloat(nonPeakAvgDelay.toFixed(2))
      },
      breachRateDifference: parseFloat((peakBreachRate - nonPeakBreachRate).toFixed(2))
    };
  }

  async getRiskPatterns(filter: PeakHourFilter) {
    const whereClause: any = {};

    if (filter.startDate && filter.endDate) {
      whereClause.assignedAt = {
        gte: new Date(filter.startDate),
        lte: new Date(filter.endDate)
      };
    }

    if (filter.zone) {
      whereClause.customerZone = filter.zone;
    }

    if (filter.restaurantId) {
      whereClause.restaurantId = filter.restaurantId;
    }

    if (filter.riderId) {
      whereClause.riderId = filter.riderId;
    }

    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      select: {
        assignedAt: true,
        pickedAt: true,
        deliveredAt: true,
        actualDeliveryTime: true,
        promisedTime: true,
        slaBreached: true,
        customerZone: true,
        restaurantId: true,
        distanceKm: true,
        restaurant: {
          select: {
            name: true
          }
        }
      }
    });

    const patterns: Map<string, { total: number; breached: number }> = new Map();

    deliveries.forEach((delivery: any) => {
      const hour = delivery.assignedAt.getHours();
      const peakLabel = getPeakLabel(hour);

      if (peakLabel) {
        // Zone + Peak Hour
        const zonePattern = `${delivery.customerZone} + ${peakLabel}`;
        if (!patterns.has(zonePattern)) {
          patterns.set(zonePattern, { total: 0, breached: 0 });
        }
        const zoneStats = patterns.get(zonePattern)!;
        zoneStats.total++;
        if (delivery.slaBreached) zoneStats.breached++;

        // Restaurant + Peak Hour
        const restaurantPattern = `${delivery.restaurant.name} + ${peakLabel}`;
        if (!patterns.has(restaurantPattern)) {
          patterns.set(restaurantPattern, { total: 0, breached: 0 });
        }
        const restaurantStats = patterns.get(restaurantPattern)!;
        restaurantStats.total++;
        if (delivery.slaBreached) restaurantStats.breached++;

        // Distance + Peak Hour
        const distanceBucket = this.getDistanceBucket(delivery.distanceKm);
        const distancePattern = `${distanceBucket} + ${peakLabel}`;
        if (!patterns.has(distancePattern)) {
          patterns.set(distancePattern, { total: 0, breached: 0 });
        }
        const distanceStats = patterns.get(distancePattern)!;
        distanceStats.total++;
        if (delivery.slaBreached) distanceStats.breached++;

        // Assignment Delay + Peak Hour
        if (delivery.pickedAt) {
          const assignmentDelay = (delivery.pickedAt.getTime() - delivery.assignedAt.getTime()) / 60000;
          const assignmentBucket = this.getDelayBucket(assignmentDelay, PEAK_HOURS_CONFIG.assignmentDelayBuckets);
          const assignmentPattern = `Assignment ${assignmentBucket} + ${peakLabel}`;
          if (!patterns.has(assignmentPattern)) {
            patterns.set(assignmentPattern, { total: 0, breached: 0 });
          }
          const assignmentStats = patterns.get(assignmentPattern)!;
          assignmentStats.total++;
          if (delivery.slaBreached) assignmentStats.breached++;
        }

        // Pickup Delay + Peak Hour
        if (delivery.pickedAt && delivery.deliveredAt) {
          const pickupDelay = (delivery.deliveredAt.getTime() - delivery.pickedAt.getTime()) / 60000;
          const pickupBucket = this.getDelayBucket(pickupDelay, PEAK_HOURS_CONFIG.pickupDelayBuckets);
          const pickupPattern = `Pickup ${pickupBucket} + ${peakLabel}`;
          if (!patterns.has(pickupPattern)) {
            patterns.set(pickupPattern, { total: 0, breached: 0 });
          }
          const pickupStats = patterns.get(pickupPattern)!;
          pickupStats.total++;
          if (delivery.slaBreached) pickupStats.breached++;
        }
      }
    });

    const results: any[] = [];

    patterns.forEach((stats, pattern) => {
      if (stats.total >= PEAK_HOURS_CONFIG.minimumSampleSize) {
        const breachRate = (stats.breached / stats.total) * 100;
        results.push({
          pattern,
          totalDeliveries: stats.total,
          slaBreaches: stats.breached,
          slaBreachRate: parseFloat(breachRate.toFixed(2))
        });
      }
    });

    results.sort((a, b) => b.slaBreachRate - a.slaBreachRate);

    return results;
  }

  private getDistanceBucket(distance: number): string {
    for (const bucket of PEAK_HOURS_CONFIG.distanceBuckets) {
      if (distance >= bucket.min && distance < bucket.max) {
        return bucket.label;
      }
    }
    return '7+ km';
  }

  private getDelayBucket(delay: number, buckets: any[]): string {
    for (const bucket of buckets) {
      if (delay >= bucket.min && delay < bucket.max) {
        return bucket.label;
      }
    }
    return buckets[buckets.length - 1].label;
  }
}

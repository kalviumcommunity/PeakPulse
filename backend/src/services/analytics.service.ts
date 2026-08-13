import prisma from '../lib/prisma.js';

export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export interface OverviewStats {
  totalDeliveries: number;
  deliveredDeliveries: number;
  slaBreaches: number;
  slaBreachPercentage: number;
  averageDeliveryTime: number;
  averageDelay: number;
  complaintCount: number;
  complaintRate: number;
  refundCount: number;
  refundRate: number;
}

export interface SLAStats {
  totalDeliveries: number;
  breachedDeliveries: number;
  breachPercentage: number;
  averageDelay: number;
  onTimePercentage: number;
}

export class AnalyticsService {
  async getOverview(filter: DateFilter): Promise<OverviewStats> {
    const whereClause = this.buildDateFilter(filter);

    // Get total deliveries
    const totalDeliveries = await prisma.delivery.count({
      where: whereClause
    });

    // Get delivered deliveries (those with actualDeliveryTime)
    const deliveredDeliveries = await prisma.delivery.count({
      where: {
        ...whereClause,
        actualDeliveryTime: { not: null }
      }
    });

    // Get SLA breaches
    const slaBreaches = await prisma.delivery.count({
      where: {
        ...whereClause,
        slaBreached: true
      }
    });

    // Calculate SLA breach percentage
    const slaBreachPercentage = totalDeliveries > 0
      ? (slaBreaches / totalDeliveries) * 100
      : 0;

    // Get average delivery time (in minutes)
    const deliveriesWithTime = await prisma.delivery.findMany({
      where: {
        ...whereClause,
        actualDeliveryTime: { not: null }
      },
      select: {
        assignedAt: true,
        actualDeliveryTime: true
      }
    });

    const averageDeliveryTime = deliveriesWithTime.length > 0
      ? deliveriesWithTime.reduce((sum: number, delivery: any) => {
          const diffMs = delivery.actualDeliveryTime!.getTime() - delivery.assignedAt.getTime();
          return sum + (diffMs / 60000); // Convert to minutes
        }, 0) / deliveriesWithTime.length
      : 0;

    // Get average delay (for SLA breached deliveries)
    const breachedDeliveries = await prisma.delivery.findMany({
      where: {
        ...whereClause,
        slaBreached: true,
        actualDeliveryTime: { not: null }
      },
      select: {
        promisedTime: true,
        actualDeliveryTime: true
      }
    });

    const averageDelay = breachedDeliveries.length > 0
      ? breachedDeliveries.reduce((sum: number, delivery: any) => {
          const diffMs = delivery.actualDeliveryTime!.getTime() - delivery.promisedTime.getTime();
          return sum + Math.max(0, diffMs / 60000); // Only positive delays
        }, 0) / breachedDeliveries.length
      : 0;

    // Get complaint count
    const complaintCount = await prisma.complaint.count({
      where: {
        ...(filter.startDate && filter.endDate ? {
          createdAt: {
            gte: new Date(filter.startDate),
            lte: new Date(filter.endDate)
          }
        } : {})
      }
    });

    // Calculate complaint rate
    const complaintRate = totalDeliveries > 0
      ? (complaintCount / totalDeliveries) * 100
      : 0;

    // Get refund count
    const refundCount = await prisma.refund.count({
      where: {
        ...(filter.startDate && filter.endDate ? {
          createdAt: {
            gte: new Date(filter.startDate),
            lte: new Date(filter.endDate)
          }
        } : {})
      }
    });

    // Calculate refund rate
    const refundRate = totalDeliveries > 0
      ? (refundCount / totalDeliveries) * 100
      : 0;

    return {
      totalDeliveries,
      deliveredDeliveries,
      slaBreaches,
      slaBreachPercentage: parseFloat(slaBreachPercentage.toFixed(2)),
      averageDeliveryTime: parseFloat(averageDeliveryTime.toFixed(2)),
      averageDelay: parseFloat(averageDelay.toFixed(2)),
      complaintCount,
      complaintRate: parseFloat(complaintRate.toFixed(2)),
      refundCount,
      refundRate: parseFloat(refundRate.toFixed(2))
    };
  }

  async getSLAAnalytics(filter: DateFilter): Promise<SLAStats> {
    const whereClause = this.buildDateFilter(filter);

    const totalDeliveries = await prisma.delivery.count({
      where: whereClause
    });

    const breachedDeliveries = await prisma.delivery.count({
      where: {
        ...whereClause,
        slaBreached: true
      }
    });

    const breachPercentage = totalDeliveries > 0
      ? (breachedDeliveries / totalDeliveries) * 100
      : 0;

    const onTimePercentage = totalDeliveries > 0
      ? ((totalDeliveries - breachedDeliveries) / totalDeliveries) * 100
      : 0;

    // Calculate average delay
    const breached = await prisma.delivery.findMany({
      where: {
        ...whereClause,
        slaBreached: true,
        actualDeliveryTime: { not: null }
      },
      select: {
        promisedTime: true,
        actualDeliveryTime: true
      }
    });

    const averageDelay = breached.length > 0
      ? breached.reduce((sum: number, delivery: any) => {
          const diffMs = delivery.actualDeliveryTime!.getTime() - delivery.promisedTime.getTime();
          return sum + Math.max(0, diffMs / 60000);
        }, 0) / breached.length
      : 0;

    return {
      totalDeliveries,
      breachedDeliveries,
      breachPercentage: parseFloat(breachPercentage.toFixed(2)),
      averageDelay: parseFloat(averageDelay.toFixed(2)),
      onTimePercentage: parseFloat(onTimePercentage.toFixed(2))
    };
  }

  async getDeliveryAnalytics(filter: DateFilter) {
    const whereClause = this.buildDateFilter(filter);

    const deliveries = await prisma.delivery.findMany({
      where: whereClause,
      include: {
        restaurant: true,
        rider: true
      }
    });

    const totalDeliveries = deliveries.length;
    const completedDeliveries = deliveries.filter((d: any) => d.deliveredAt).length;
    const pendingDeliveries = totalDeliveries - completedDeliveries;

    // Group by zone
    const byZone = deliveries.reduce((acc: any, delivery: any) => {
      const zone = delivery.customerZone;
      if (!acc[zone]) {
        acc[zone] = { total: 0, breached: 0 };
      }
      acc[zone].total++;
      if (delivery.slaBreached) {
        acc[zone].breached++;
      }
      return acc;
    }, {} as Record<string, { total: number; breached: number }>);

    const zoneStats = Object.entries(byZone).map(([zone, stats]: [string, any]) => ({
      zone,
      totalDeliveries: stats.total,
      breachedDeliveries: stats.breached,
      breachRate: parseFloat(((stats.breached / stats.total) * 100).toFixed(2))
    }));

    // Top restaurants
    const restaurantStats = deliveries.reduce((acc: any, delivery: any) => {
      const id = delivery.restaurantId;
      if (!acc[id]) {
        acc[id] = {
          id,
          name: delivery.restaurant.name,
          totalDeliveries: 0,
          breachedDeliveries: 0
        };
      }
      acc[id].totalDeliveries++;
      if (delivery.slaBreached) {
        acc[id].breachedDeliveries++;
      }
      return acc;
    }, {} as Record<string, any>);

    const topRestaurants = Object.values(restaurantStats)
      .map((r: any) => ({
        ...r,
        breachRate: parseFloat(((r.breachedDeliveries / r.totalDeliveries) * 100).toFixed(2))
      }))
      .sort((a, b) => b.totalDeliveries - a.totalDeliveries)
      .slice(0, 10);

    return {
      totalDeliveries,
      completedDeliveries,
      pendingDeliveries,
      zoneStats: zoneStats.sort((a, b) => b.totalDeliveries - a.totalDeliveries),
      topRestaurants
    };
  }

  async getComplaintAnalytics(filter: DateFilter) {
    const whereClause = filter.startDate && filter.endDate ? {
      createdAt: {
        gte: new Date(filter.startDate),
        lte: new Date(filter.endDate)
      }
    } : {};

    const totalComplaints = await prisma.complaint.count({
      where: whereClause
    });

    // Group by type
    const byType = await prisma.complaint.groupBy({
      by: ['complaintType'],
      where: whereClause,
      _count: true
    });

    const complaintsByType = byType.map((item: any) => ({
      type: item.complaintType,
      count: item._count,
      percentage: totalComplaints > 0
        ? parseFloat(((item._count / totalComplaints) * 100).toFixed(2))
        : 0
    })).sort((a: any, b: any) => b.count - a.count);

    // Group by severity
    const bySeverity = await prisma.complaint.groupBy({
      by: ['severity'],
      where: whereClause,
      _count: true
    });

    const complaintsBySeverity = bySeverity.map((item: any) => ({
      severity: item.severity,
      count: item._count,
      percentage: totalComplaints > 0
        ? parseFloat(((item._count / totalComplaints) * 100).toFixed(2))
        : 0
    })).sort((a: any, b: any) => b.count - a.count);

    return {
      totalComplaints,
      complaintsByType,
      complaintsBySeverity
    };
  }

  async getRefundAnalytics(filter: DateFilter) {
    const whereClause = filter.startDate && filter.endDate ? {
      createdAt: {
        gte: new Date(filter.startDate),
        lte: new Date(filter.endDate)
      }
    } : {};

    const refunds = await prisma.refund.findMany({
      where: whereClause
    });

    const totalRefunds = refunds.length;
    const approvedRefunds = refunds.filter((r: any) => r.approved).length;
    const pendingRefunds = totalRefunds - approvedRefunds;

    const totalAmount = refunds.reduce((sum: number, r: any) => sum + r.refundAmount, 0);
    const approvedAmount = refunds
      .filter((r: any) => r.approved)
      .reduce((sum: number, r: any) => sum + r.refundAmount, 0);

    const averageRefundAmount = totalRefunds > 0
      ? totalAmount / totalRefunds
      : 0;

    // Group by reason
    const byReason = refunds.reduce((acc: any, refund: any) => {
      const reason = refund.refundReason;
      if (!acc[reason]) {
        acc[reason] = { count: 0, totalAmount: 0 };
      }
      acc[reason].count++;
      acc[reason].totalAmount += refund.refundAmount;
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);

    const refundsByReason = Object.entries(byReason).map(([reason, stats]: [string, any]) => ({
      reason,
      count: stats.count,
      totalAmount: parseFloat(stats.totalAmount.toFixed(2)),
      averageAmount: parseFloat((stats.totalAmount / stats.count).toFixed(2)),
      percentage: parseFloat(((stats.count / totalRefunds) * 100).toFixed(2))
    })).sort((a: any, b: any) => b.totalAmount - a.totalAmount);

    return {
      totalRefunds,
      approvedRefunds,
      pendingRefunds,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      approvedAmount: parseFloat(approvedAmount.toFixed(2)),
      averageRefundAmount: parseFloat(averageRefundAmount.toFixed(2)),
      refundsByReason
    };
  }

  private buildDateFilter(filter: DateFilter) {
    if (filter.startDate && filter.endDate) {
      return {
        assignedAt: {
          gte: new Date(filter.startDate),
          lte: new Date(filter.endDate)
        }
      };
    }
    return {};
  }
}

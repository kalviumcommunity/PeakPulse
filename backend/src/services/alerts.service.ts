import { DEFAULT_ALERT_RULES } from '../config/alerts.config.js';
import {
  OperationalAlert,
  AlertRuleConfig,
  AlertSummaryKPI,
  AlertFilter,
  AcknowledgeAlertDTO,
  ResolveAlertDTO,
  SimulateAlertDTO,
  AlertSeverity
} from '../types/alert.types.js';

export class AlertsService {
  private rules: AlertRuleConfig[] = [];
  private alerts: OperationalAlert[] = [];
  private alertIdCounter: number = 1000;

  constructor() {
    this.rules = JSON.parse(JSON.stringify(DEFAULT_ALERT_RULES));
    this.initializeDefaultAlerts();
  }

  /**
   * Initializes initial live operational alerts representing realistic active fleet state
   */
  private initializeDefaultAlerts(): void {
    const now = new Date();

    // 1. Critical Zone Breach Alert on Zone C
    this.alerts.push({
      id: `ALT-${++this.alertIdCounter}`,
      ruleId: 'RULE_ZONE_BREACH',
      category: 'ZONE_BREACH_SURGE',
      title: 'Critical Breach Surge: Uptown - Zone C (34.1%)',
      description: 'Zone C SLA breach rate reached 34.1%, exceeding the 20.0% operational threshold.',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      zone: 'Uptown - Zone C',
      metrics: {
        currentValue: 34.1,
        thresholdValue: 20.0,
        unit: '%',
        comparison: '>',
        deltaPercentage: 70.5
      },
      affectedCount: 14,
      recommendedActions: [
        'Activate dynamic +$2.50 per-drop zone surge bonus for couriers entering Zone C',
        'Auto-reassign 5 delayed bike deliveries to nearby motorized couriers',
        'Throttle order intake on top 2 congested merchant kitchens in Uptown'
      ],
      triggeredAt: new Date(now.getTime() - 18 * 60000).toISOString()
    });

    // 2. Severe Kitchen Prep Delay Alert on Taco Fiesta
    this.alerts.push({
      id: `ALT-${++this.alertIdCounter}`,
      ruleId: 'RULE_RESTAURANT_PREP',
      category: 'RESTAURANT_PREP_DELAY',
      title: 'Kitchen Prep Bottleneck: Taco Fiesta (22.5 min)',
      description: 'Average kitchen preparation latency reached 22.5 min, exceeding the 18.0 min SLA tolerance.',
      severity: 'HIGH',
      status: 'ACKNOWLEDGED',
      zone: 'Uptown - Zone C',
      restaurantId: 'rest-taco-01',
      restaurantName: 'Taco Fiesta',
      metrics: {
        currentValue: 22.5,
        thresholdValue: 18.0,
        unit: 'min',
        comparison: '>',
        deltaPercentage: 25.0
      },
      affectedCount: 8,
      recommendedActions: [
        'Dispatch merchant POS priority prep escalation alert',
        'Increase estimated pickup buffer by +8 minutes on incoming customer checkouts'
      ],
      triggeredAt: new Date(now.getTime() - 32 * 60000).toISOString(),
      acknowledgedAt: new Date(now.getTime() - 14 * 60000).toISOString(),
      acknowledgedBy: 'Jordan Kim (Ops Lead)'
    });

    // 3. High-Risk Delivery Surge Alert
    this.alerts.push({
      id: `ALT-${++this.alertIdCounter}`,
      ruleId: 'RULE_HIGH_RISK_SURGE',
      category: 'HIGH_RISK_SURGE',
      title: 'High-Risk Delivery Volume Surge (6 Critical Orders)',
      description: '6 concurrent active deliveries flagged in CRITICAL ML risk tier (>75% breach probability).',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      zone: 'Uptown - Zone C',
      metrics: {
        currentValue: 6,
        thresholdValue: 4,
        unit: 'orders',
        comparison: '>=',
        deltaPercentage: 50.0
      },
      affectedCount: 6,
      recommendedActions: [
        'Dispatch automated motorcycle rider reassignment sequence',
        'Send proactive dynamic ETA customer notification with courtesy compensation voucher'
      ],
      triggeredAt: new Date(now.getTime() - 8 * 60000).toISOString()
    });

    // 4. Past Resolved Weather Alert
    this.alerts.push({
      id: `ALT-${++this.alertIdCounter}`,
      ruleId: 'RULE_WEATHER_HAZARD',
      category: 'WEATHER_HAZARD',
      title: 'Rain Hazard Transit Delay: East - Zone E',
      description: 'Moderate rain reduced average courier speed by 35%.',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      zone: 'East - Zone E',
      metrics: {
        currentValue: 1.6,
        thresholdValue: 1.5,
        unit: 'drag factor',
        comparison: '>=',
        deltaPercentage: 6.7
      },
      affectedCount: 11,
      recommendedActions: ['Extend promised SLA window buffer by +10 minutes'],
      triggeredAt: new Date(now.getTime() - 140 * 60000).toISOString(),
      acknowledgedAt: new Date(now.getTime() - 125 * 60000).toISOString(),
      acknowledgedBy: 'Sarah Chen (Analyst)',
      resolvedAt: new Date(now.getTime() - 45 * 60000).toISOString(),
      resolvedBy: 'Sarah Chen (Analyst)',
      resolutionNotes: 'Weather cleared. Courier transit speeds normalized to standard operational baseline.',
      rootCause: 'WEATHER_DISRUPTION'
    });
  }

  // =========================================================================
  // 1. RULE EVALUATION ENGINE
  // =========================================================================

  /**
   * Evaluates live operational telemetry against configured threshold rules
   */
  public evaluateOperationalRules(): { newAlertsCount: number; updatedAlertsCount: number; evaluatedRules: number } {
    let newAlertsCount = 0;
    let updatedAlertsCount = 0;
    const now = new Date();

    // Data snapshots across zones
    const zoneTelemetry = [
      { zone: 'Downtown - Zone A', breachRate: 8.2, criticalCount: 1, activeDeliveries: 42, activeCouriers: 38, avgPrep: 14.2 },
      { zone: 'Midtown - Zone B', breachRate: 12.4, criticalCount: 2, activeDeliveries: 35, activeCouriers: 30, avgPrep: 15.5 },
      { zone: 'Uptown - Zone C', breachRate: 34.1, criticalCount: 6, activeDeliveries: 48, activeCouriers: 26, avgPrep: 22.5 },
      { zone: 'Suburb - Zone D', breachRate: 6.3, criticalCount: 0, activeDeliveries: 18, activeCouriers: 20, avgPrep: 12.0 },
      { zone: 'East - Zone E', breachRate: 18.5, criticalCount: 3, activeDeliveries: 28, activeCouriers: 22, avgPrep: 16.8 },
      { zone: 'West - Zone F', breachRate: 9.8, criticalCount: 1, activeDeliveries: 22, activeCouriers: 24, avgPrep: 13.5 }
    ];

    const restaurantTelemetry = [
      { id: 'rest-taco-01', name: 'Taco Fiesta', zone: 'Uptown - Zone C', avgPrep: 22.5, pendingCount: 8 },
      { id: 'rest-pizza-01', name: 'Pizza Palace', zone: 'Downtown - Zone A', avgPrep: 14.8, pendingCount: 5 },
      { id: 'rest-burger-01', name: 'Burger Kingdom', zone: 'Midtown - Zone B', avgPrep: 16.2, pendingCount: 6 },
      { id: 'rest-indian-01', name: 'Indian Spice', zone: 'Uptown - Zone C', avgPrep: 19.4, pendingCount: 7 }
    ];

    // Rule 1: Zone Breach Surge
    const zoneBreachRule = this.rules.find(r => r.id === 'RULE_ZONE_BREACH' && r.enabled);
    if (zoneBreachRule) {
      for (const z of zoneTelemetry) {
        if (z.breachRate > zoneBreachRule.thresholdValue) {
          const existing = this.findActiveAlert('RULE_ZONE_BREACH', z.zone);
          const severity: AlertSeverity = z.breachRate >= 30.0 ? 'CRITICAL' : 'HIGH';
          if (existing) {
            existing.metrics.currentValue = z.breachRate;
            existing.severity = severity;
            updatedAlertsCount++;
          } else if (!this.isInCooldown('RULE_ZONE_BREACH', z.zone)) {
            this.alerts.unshift({
              id: `ALT-${++this.alertIdCounter}`,
              ruleId: 'RULE_ZONE_BREACH',
              category: 'ZONE_BREACH_SURGE',
              title: `${severity === 'CRITICAL' ? 'Critical' : 'High'} Breach Surge: ${z.zone} (${z.breachRate}%)`,
              description: `${z.zone} SLA breach rate reached ${z.breachRate}%, exceeding the ${zoneBreachRule.thresholdValue}% threshold.`,
              severity,
              status: 'ACTIVE',
              zone: z.zone,
              metrics: {
                currentValue: z.breachRate,
                thresholdValue: zoneBreachRule.thresholdValue,
                unit: '%',
                comparison: '>',
                deltaPercentage: Math.round(((z.breachRate - zoneBreachRule.thresholdValue) / zoneBreachRule.thresholdValue) * 100)
              },
              affectedCount: Math.round((z.activeDeliveries * z.breachRate) / 100),
              recommendedActions: [
                `Activate zone surge incentive bonus for couriers entering ${z.zone}`,
                `Prioritize dispatch of motorized couriers in ${z.zone}`
              ],
              triggeredAt: now.toISOString()
            });
            newAlertsCount++;
          }
        }
      }
    }

    // Rule 2: Restaurant Severe Prep Delay
    const prepRule = this.rules.find(r => r.id === 'RULE_RESTAURANT_PREP' && r.enabled);
    if (prepRule) {
      for (const rest of restaurantTelemetry) {
        if (rest.avgPrep > prepRule.thresholdValue) {
          const existing = this.findActiveAlert('RULE_RESTAURANT_PREP', undefined, rest.name);
          if (existing) {
            existing.metrics.currentValue = rest.avgPrep;
            updatedAlertsCount++;
          } else if (!this.isInCooldown('RULE_RESTAURANT_PREP', undefined, rest.name)) {
            this.alerts.unshift({
              id: `ALT-${++this.alertIdCounter}`,
              ruleId: 'RULE_RESTAURANT_PREP',
              category: 'RESTAURANT_PREP_DELAY',
              title: `Kitchen Prep Bottleneck: ${rest.name} (${rest.avgPrep} min)`,
              description: `${rest.name} kitchen prep time reached ${rest.avgPrep} min, exceeding the ${prepRule.thresholdValue} min threshold.`,
              severity: 'HIGH',
              status: 'ACTIVE',
              zone: rest.zone,
              restaurantId: rest.id,
              restaurantName: rest.name,
              metrics: {
                currentValue: rest.avgPrep,
                thresholdValue: prepRule.thresholdValue,
                unit: 'min',
                comparison: '>',
                deltaPercentage: Math.round(((rest.avgPrep - prepRule.thresholdValue) / prepRule.thresholdValue) * 100)
              },
              affectedCount: rest.pendingCount,
              recommendedActions: [
                `Dispatch merchant POS priority prep escalation alert to ${rest.name}`,
                `Temporarily throttle order intake for ${rest.name} to clear kitchen backlog`
              ],
              triggeredAt: now.toISOString()
            });
            newAlertsCount++;
          }
        }
      }
    }

    // Rule 3: High-Risk Delivery Volume Surge
    const surgeRule = this.rules.find(r => r.id === 'RULE_HIGH_RISK_SURGE' && r.enabled);
    if (surgeRule) {
      for (const z of zoneTelemetry) {
        if (z.criticalCount >= surgeRule.thresholdValue) {
          const existing = this.findActiveAlert('RULE_HIGH_RISK_SURGE', z.zone);
          if (existing) {
            existing.metrics.currentValue = z.criticalCount;
            updatedAlertsCount++;
          } else if (!this.isInCooldown('RULE_HIGH_RISK_SURGE', z.zone)) {
            this.alerts.unshift({
              id: `ALT-${++this.alertIdCounter}`,
              ruleId: 'RULE_HIGH_RISK_SURGE',
              category: 'HIGH_RISK_SURGE',
              title: `High-Risk Delivery Volume Surge in ${z.zone} (${z.criticalCount} Orders)`,
              description: `${z.criticalCount} concurrent active deliveries in ${z.zone} are at critical risk of SLA breach.`,
              severity: 'CRITICAL',
              status: 'ACTIVE',
              zone: z.zone,
              metrics: {
                currentValue: z.criticalCount,
                thresholdValue: surgeRule.thresholdValue,
                unit: 'orders',
                comparison: '>=',
                deltaPercentage: Math.round(((z.criticalCount - surgeRule.thresholdValue) / surgeRule.thresholdValue) * 100)
              },
              affectedCount: z.criticalCount,
              recommendedActions: [
                `Auto-reassign pending orders in ${z.zone} to nearest motorized couriers`,
                `Send proactive ETA notifications to customers with delay compensation vouchers`
              ],
              triggeredAt: now.toISOString()
            });
            newAlertsCount++;
          }
        }
      }
    }

    return {
      newAlertsCount,
      updatedAlertsCount,
      evaluatedRules: this.rules.filter(r => r.enabled).length
    };
  }

  private findActiveAlert(ruleId: string, zone?: string, restaurantName?: string): OperationalAlert | undefined {
    return this.alerts.find(
      a =>
        a.ruleId === ruleId &&
        (a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED') &&
        (zone ? a.zone === zone : true) &&
        (restaurantName ? a.restaurantName === restaurantName : true)
    );
  }

  private isInCooldown(ruleId: string, zone?: string, restaurantName?: string): boolean {
    const recent = this.alerts.find(
      a =>
        a.ruleId === ruleId &&
        a.status === 'RESOLVED' &&
        (zone ? a.zone === zone : true) &&
        (restaurantName ? a.restaurantName === restaurantName : true) &&
        a.cooldownUntil &&
        new Date(a.cooldownUntil).getTime() > Date.now()
    );
    return !!recent;
  }

  // =========================================================================
  // 2. ALERT LIFECYCLE MANAGEMENT
  // =========================================================================

  public getAlerts(filter: AlertFilter = {}): { alerts: OperationalAlert[]; total: number; page: number; limit: number } {
    let list = [...this.alerts];

    if (filter.status) {
      list = list.filter(a => a.status === filter.status);
    }
    if (filter.severity) {
      list = list.filter(a => a.severity === filter.severity);
    }
    if (filter.category) {
      list = list.filter(a => a.category === filter.category);
    }
    if (filter.zone) {
      list = list.filter(a => a.zone === filter.zone);
    }
    if (filter.restaurantId) {
      list = list.filter(a => a.restaurantId === filter.restaurantId);
    }

    const page = Math.max(1, filter.page || 1);
    const limit = Math.min(100, Math.max(1, filter.limit || 50));
    const offset = (page - 1) * limit;

    const paged = list.slice(offset, offset + limit);

    return {
      alerts: paged,
      total: list.length,
      page,
      limit
    };
  }

  public getActiveAlerts(): OperationalAlert[] {
    return this.alerts.filter(a => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED');
  }

  public getAlertById(id: string): OperationalAlert | undefined {
    return this.alerts.find(a => a.id === id);
  }

  public acknowledgeAlert(id: string, dto: AcknowledgeAlertDTO): OperationalAlert | null {
    const alert = this.alerts.find(a => a.id === id);
    if (!alert) return null;

    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = dto.acknowledgedBy || 'Analyst';
    return alert;
  }

  public resolveAlert(id: string, dto: ResolveAlertDTO): OperationalAlert | null {
    const alert = this.alerts.find(a => a.id === id);
    if (!alert) return null;

    const rule = this.rules.find(r => r.id === alert.ruleId);
    const cooldownMins = rule?.cooldownMinutes || 15;

    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = dto.resolvedBy || 'Analyst';
    alert.resolutionNotes = dto.resolutionNotes;
    alert.rootCause = dto.rootCause || 'OTHER';
    alert.cooldownUntil = new Date(Date.now() + cooldownMins * 60000).toISOString();

    return alert;
  }

  public dismissAlert(id: string, reason?: string): OperationalAlert | null {
    const alert = this.alerts.find(a => a.id === id);
    if (!alert) return null;

    alert.status = 'DISMISSED';
    alert.resolvedAt = new Date().toISOString();
    alert.resolutionNotes = `Dismissed: ${reason || 'False alarm / transient spike'}`;
    return alert;
  }

  // =========================================================================
  // 3. KPI & SUMMARY AGGREGATOR
  // =========================================================================

  public getSummaryKPI(): AlertSummaryKPI {
    const activeAlerts = this.alerts.filter(a => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED');
    const criticalCount = activeAlerts.filter(a => a.severity === 'CRITICAL').length;
    const highCount = activeAlerts.filter(a => a.severity === 'HIGH').length;
    const mediumCount = activeAlerts.filter(a => a.severity === 'MEDIUM').length;
    const acknowledgedCount = this.alerts.filter(a => a.status === 'ACKNOWLEDGED').length;

    // Calculate MTTA (Mean Time to Acknowledge) in minutes
    const acked = this.alerts.filter(a => a.acknowledgedAt && a.triggeredAt);
    let totalAckMinutes = 0;
    for (const a of acked) {
      const t1 = new Date(a.triggeredAt).getTime();
      const t2 = new Date(a.acknowledgedAt!).getTime();
      totalAckMinutes += Math.max(0, (t2 - t1) / 60000);
    }
    const mtta = acked.length > 0 ? Math.round((totalAckMinutes / acked.length) * 10) / 10 : 8.4;

    // Calculate MTTR (Mean Time to Resolve) in minutes
    const resolved = this.alerts.filter(a => a.resolvedAt && a.triggeredAt);
    let totalResolveMinutes = 0;
    for (const a of resolved) {
      const t1 = new Date(a.triggeredAt).getTime();
      const t2 = new Date(a.resolvedAt!).getTime();
      totalResolveMinutes += Math.max(0, (t2 - t1) / 60000);
    }
    const mttr = resolved.length > 0 ? Math.round((totalResolveMinutes / resolved.length) * 10) / 10 : 24.2;

    const oneDayAgo = Date.now() - 24 * 3600000;
    const resolvedTodayCount = this.alerts.filter(
      a => a.status === 'RESOLVED' && a.resolvedAt && new Date(a.resolvedAt).getTime() >= oneDayAgo
    ).length;

    // Group active by category
    const catMap: Record<string, { count: number; severity: AlertSeverity }> = {};
    for (const a of activeAlerts) {
      if (!catMap[a.category]) {
        catMap[a.category] = { count: 0, severity: a.severity };
      }
      catMap[a.category].count++;
    }

    const categoryBreakdown = Object.entries(catMap).map(([category, val]) => ({
      category: category as any,
      count: val.count,
      severity: val.severity
    }));

    return {
      totalActive: activeAlerts.length,
      criticalCount,
      highCount,
      mediumCount,
      acknowledgedCount,
      resolvedTodayCount,
      meanTimeToAcknowledgeMinutes: mtta,
      meanTimeToResolveMinutes: mttr,
      categoryBreakdown
    };
  }

  // =========================================================================
  // 4. CONFIGURABLE RULES & THRESHOLDS
  // =========================================================================

  public getRules(): AlertRuleConfig[] {
    return this.rules;
  }

  public updateRule(id: string, updates: Partial<AlertRuleConfig>): AlertRuleConfig | null {
    const rule = this.rules.find(r => r.id === id);
    if (!rule) return null;

    if (updates.thresholdValue !== undefined) rule.thresholdValue = Number(updates.thresholdValue);
    if (updates.severity !== undefined) rule.severity = updates.severity;
    if (updates.cooldownMinutes !== undefined) rule.cooldownMinutes = Number(updates.cooldownMinutes);
    if (updates.enabled !== undefined) rule.enabled = Boolean(updates.enabled);

    return rule;
  }

  // =========================================================================
  // 5. DRILL SIMULATOR & TEST INJECTION
  // =========================================================================

  public simulateAlert(dto: SimulateAlertDTO): OperationalAlert {
    const severity: AlertSeverity = dto.severity || 'HIGH';
    const zone = dto.zone || 'Uptown - Zone C';
    const restName = dto.restaurantName || 'Taco Fiesta';
    const affected = dto.affectedCount || 7;

    let title = `Simulated Alert: ${dto.category}`;
    let desc = `Manual operational drill alert for category ${dto.category}`;
    let unit = '%';
    let currentVal = dto.currentValue || 32.5;
    let thresholdVal = dto.thresholdValue || 20.0;

    switch (dto.category) {
      case 'ZONE_BREACH_SURGE':
        title = `${severity === 'CRITICAL' ? 'Critical' : 'High'} Breach Surge: ${zone} (${currentVal}%)`;
        desc = `${zone} SLA breach rate surged to ${currentVal}%, violating the ${thresholdVal}% threshold.`;
        unit = '%';
        break;
      case 'RESTAURANT_PREP_DELAY':
        title = `Kitchen Prep Bottleneck: ${restName} (${currentVal} min)`;
        desc = `${restName} average prep duration reached ${currentVal} min.`;
        unit = 'min';
        break;
      case 'HIGH_RISK_SURGE':
        title = `High-Risk Delivery Volume Surge in ${zone} (${currentVal} orders)`;
        desc = `${currentVal} concurrent deliveries flagged with elevated SLA breach probability.`;
        unit = 'orders';
        break;
      case 'FLEET_SHORTAGE':
        title = `Courier Supply Deficit: ${zone}`;
        desc = `Active order volume outpaces available couriers by ${currentVal}x.`;
        unit = 'ratio';
        break;
      case 'WEATHER_HAZARD':
        title = `Severe Weather Hazard: ${zone}`;
        desc = `Adverse rainstorm transit degradation detected in ${zone}.`;
        unit = 'drag factor';
        break;
    }

    const alert: OperationalAlert = {
      id: `ALT-${++this.alertIdCounter}`,
      ruleId: `RULE_${dto.category}`,
      category: dto.category,
      title,
      description: desc,
      severity,
      status: 'ACTIVE',
      zone,
      restaurantName: restName,
      metrics: {
        currentValue: currentVal,
        thresholdValue: thresholdVal,
        unit,
        comparison: '>',
        deltaPercentage: Math.round(((currentVal - thresholdVal) / thresholdVal) * 100)
      },
      affectedCount: affected,
      recommendedActions: [
        `Operational drill: Follow standard incident playbook for ${dto.category}`,
        `Verify mitigation response workflow in live dispatch panel`
      ],
      triggeredAt: new Date().toISOString()
    };

    this.alerts.unshift(alert);
    return alert;
  }
}

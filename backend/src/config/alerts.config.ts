import { AlertRuleConfig } from '../types/alert.types.js';

export const DEFAULT_ALERT_RULES: AlertRuleConfig[] = [
  {
    id: 'RULE_ZONE_BREACH',
    name: 'Zone Breach Rate Surge',
    category: 'ZONE_BREACH_SURGE',
    description: 'Triggers when a delivery zone exceeds the operational SLA breach rate threshold.',
    severity: 'HIGH',
    thresholdValue: 20.0,
    unit: '%',
    comparison: '>',
    cooldownMinutes: 15,
    enabled: true,
    recommendedActionTemplate: 'Activate zone surge pricing & redirect available nearby riders to {zone}.'
  },
  {
    id: 'RULE_RESTAURANT_PREP',
    name: 'Severe Restaurant Kitchen Prep Delay',
    category: 'RESTAURANT_PREP_DELAY',
    description: 'Triggers when merchant kitchen preparation exceeds normal prep time tolerance.',
    severity: 'HIGH',
    thresholdValue: 18.0,
    unit: 'min',
    comparison: '>',
    cooldownMinutes: 15,
    enabled: true,
    recommendedActionTemplate: 'Throttle incoming order intake on merchant POS & dispatch kitchen expedite notice to {restaurant}.'
  },
  {
    id: 'RULE_HIGH_RISK_SURGE',
    name: 'High-Risk Delivery Volume Surge',
    category: 'HIGH_RISK_SURGE',
    description: 'Triggers when the count of concurrent critical/high-risk deliveries in a zone surges.',
    severity: 'CRITICAL',
    thresholdValue: 4,
    unit: 'orders',
    comparison: '>=',
    cooldownMinutes: 10,
    enabled: true,
    recommendedActionTemplate: 'Trigger automated reassignment to motorized couriers & send proactive ETA delay updates.'
  },
  {
    id: 'RULE_FLEET_SHORTAGE',
    name: 'Zone Courier Supply Deficit',
    category: 'FLEET_SHORTAGE',
    description: 'Triggers when active unassigned order volume outpaces available couriers in a zone.',
    severity: 'MEDIUM',
    thresholdValue: 1.5,
    unit: 'orders/courier',
    comparison: '>=',
    cooldownMinutes: 20,
    enabled: true,
    recommendedActionTemplate: 'Dispatch dynamic per-drop incentive bonus to attract couriers to {zone}.'
  },
  {
    id: 'RULE_WEATHER_HAZARD',
    name: 'Weather & Traffic Transit Hazard',
    category: 'WEATHER_HAZARD',
    description: 'Triggers when severe weather or extreme gridlock degrades average courier transit velocity.',
    severity: 'MEDIUM',
    thresholdValue: 1.5,
    unit: 'drag factor',
    comparison: '>=',
    cooldownMinutes: 30,
    enabled: true,
    recommendedActionTemplate: 'Extend promised delivery SLA windows by +10 minutes system-wide.'
  }
];

import {
  NLPIntent,
  NLPEntities,
  AnalyticalQueryPlan
} from '../types/nlp.types.js';

export class NLPParserService {
  private zoneAliases: Record<string, string> = {
    'north zone': 'Uptown - Zone C',
    'north': 'Uptown - Zone C',
    'uptown': 'Uptown - Zone C',
    'zone c': 'Uptown - Zone C',
    'c': 'Uptown - Zone C',
    'downtown': 'Downtown - Zone A',
    'zone a': 'Downtown - Zone A',
    'a': 'Downtown - Zone A',
    'midtown': 'Midtown - Zone B',
    'zone b': 'Midtown - Zone B',
    'b': 'Midtown - Zone B',
    'suburb': 'Suburb - Zone D',
    'south': 'Suburb - Zone D',
    'zone d': 'Suburb - Zone D',
    'd': 'Suburb - Zone D',
    'east': 'East - Zone E',
    'zone e': 'East - Zone E',
    'e': 'East - Zone E',
    'west': 'West - Zone F',
    'zone f': 'West - Zone F',
    'f': 'West - Zone F'
  };

  private restaurantAliases: Record<string, string> = {
    'taco fiesta': 'Taco Fiesta',
    'taco': 'Taco Fiesta',
    'pizza palace': 'Pizza Palace',
    'pizza': 'Pizza Palace',
    'burger kingdom': 'Burger Kingdom',
    'burger': 'Burger Kingdom',
    'sushi express': 'Sushi Express',
    'sushi': 'Sushi Express',
    'pasta house': 'Pasta House',
    'pasta': 'Pasta House',
    'indian spice': 'Indian Spice',
    'indian': 'Indian Spice',
    'thai delight': 'Thai Delight',
    'thai': 'Thai Delight',
    'mexican grill': 'Mexican Grill'
  };

  private riderAliases: Record<string, string> = {
    'rahul': 'Rahul Kumar',
    'rahul kumar': 'Rahul Kumar',
    'amit': 'Amit Singh',
    'amit singh': 'Amit Singh',
    'priya': 'Priya Sharma',
    'priya sharma': 'Priya Sharma',
    'vikram': 'Vikram Patel',
    'vikram patel': 'Vikram Patel',
    'sneha': 'Sneha Reddy',
    'sneha reddy': 'Sneha Reddy'
  };

  /**
   * Main parsing method: Converts raw natural language prompt into semantic entities and query plan
   */
  public parsePrompt(prompt: string): AnalyticalQueryPlan {
    const text = prompt.toLowerCase().trim();
    const entities = this.extractEntities(text);
    const intent = this.classifyIntent(text, entities);

    return this.buildQueryPlan(intent, entities, prompt);
  }

  // =========================================================================
  // 1. ENTITY & SLOT EXTRACTION
  // =========================================================================

  private extractEntities(text: string): NLPEntities {
    const entities: NLPEntities = {
      limit: 5,
      sortDirection: 'DESC'
    };

    // 1. Extract Zone
    for (const [alias, normalized] of Object.entries(this.zoneAliases)) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(text)) {
        entities.zone = alias;
        entities.normalizedZone = normalized;
        break;
      }
    }

    // 2. Extract Restaurant
    for (const [alias, normalized] of Object.entries(this.restaurantAliases)) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(text)) {
        entities.restaurant = alias;
        entities.normalizedRestaurant = normalized;
        break;
      }
    }

    // 3. Extract Rider
    for (const [alias, normalized] of Object.entries(this.riderAliases)) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(text)) {
        entities.rider = alias;
        entities.normalizedRider = normalized;
        break;
      }
    }

    // 4. Extract Vehicle Type
    if (/\b(motorcycle|motorbike|2-wheeler)\b/i.test(text)) {
      entities.vehicleType = 'MOTORCYCLE';
    } else if (/\bscooter\b/i.test(text)) {
      entities.vehicleType = 'SCOOTER';
    } else if (/\b(bicycle|cycle)\b/i.test(text)) {
      entities.vehicleType = 'BICYCLE';
    } else if (/\bcar\b/i.test(text)) {
      entities.vehicleType = 'CAR';
    } else if (/\bbike\b/i.test(text)) {
      entities.vehicleType = 'BIKE';
    }

    // 5. Extract Meal Window & Hours
    if (/\b(dinner|dinner-time|evening|supper)\b/i.test(text)) {
      entities.mealWindow = 'DINNER';
      entities.hourRange = { start: 19, end: 22 };
    } else if (/\b(lunch|lunch-time|afternoon|noon)\b/i.test(text)) {
      entities.mealWindow = 'LUNCH';
      entities.hourRange = { start: 12, end: 14 };
    } else if (/\b(peak|peak hours|rush hour)\b/i.test(text)) {
      entities.mealWindow = 'ALL';
      entities.hourRange = { start: 12, end: 22 };
    }

    // 6. Extract Target Metric
    if (/\b(breach|breaches|sla violation|sla violations|late|delayed)\b/i.test(text)) {
      entities.targetMetric = 'SLA_BREACHES';
      entities.aggregation = 'COUNT';
    } else if (/\b(breach rate|violation rate|on-time rate|sla rate)\b/i.test(text)) {
      entities.targetMetric = 'BREACH_RATE';
      entities.aggregation = 'RATE';
    } else if (/\b(prep|kitchen|preparation|prep delay|prep time)\b/i.test(text)) {
      entities.targetMetric = 'PREP_DELAY';
      entities.aggregation = 'AVG';
    } else if (/\b(assignment|dispatch|assign lag|unassigned)\b/i.test(text)) {
      entities.targetMetric = 'ASSIGNMENT_DELAY';
      entities.aggregation = 'AVG';
    } else if (/\b(refund|refunds|refund amount|money back)\b/i.test(text)) {
      entities.targetMetric = 'REFUND_AMOUNT';
      entities.aggregation = 'SUM';
    } else if (/\b(complaint|complaints|feedback)\b/i.test(text)) {
      entities.targetMetric = 'COMPLAINTS';
      entities.aggregation = 'COUNT';
    } else if (/\b(speed|transit time|delivery time|duration)\b/i.test(text)) {
      entities.targetMetric = 'AVG_DELIVERY_TIME';
      entities.aggregation = 'AVG';
    } else {
      entities.targetMetric = 'SLA_BREACHES';
      entities.aggregation = 'COUNT';
    }

    // 7. Extract Numeric Limit (e.g., "top 3", "top 10", "worst 5")
    const limitMatch = text.match(/\b(top|worst|first|limit)\s+(\d+)\b/i);
    if (limitMatch && limitMatch[2]) {
      entities.limit = parseInt(limitMatch[2], 10);
    }

    // 8. Extract Grouping
    if (/\b(restaurant|restaurants|merchant|merchants|kitchen|kitchens)\b/i.test(text)) {
      entities.groupBy = 'restaurant';
    } else if (/\b(zone|zones|neighborhood|areas)\b/i.test(text)) {
      entities.groupBy = 'zone';
    } else if (/\b(rider|riders|courier|couriers|driver|drivers)\b/i.test(text)) {
      entities.groupBy = 'rider';
    } else if (/\b(hour|hourly|time of day)\b/i.test(text)) {
      entities.groupBy = 'hour';
    } else if (/\b(vehicle|vehicles)\b/i.test(text)) {
      entities.groupBy = 'vehicle';
    }

    // 9. Sort Direction
    if (/\b(lowest|least|fastest|best|top rating)\b/i.test(text)) {
      entities.sortDirection = 'ASC';
    } else {
      entities.sortDirection = 'DESC';
    }

    return entities;
  }

  // =========================================================================
  // 2. INTENT CLASSIFICATION
  // =========================================================================

  private classifyIntent(text: string, entities: NLPEntities): NLPIntent {
    if (/\b(help|what can you do|examples|capabilities|commands)\b/i.test(text)) {
      return 'GENERAL_HELP';
    }
    if (/\b(why|why did|reason|root cause|explain why|diagnose)\b/i.test(text)) {
      return 'ROOT_CAUSE_DIAGNOSIS';
    }
    if (/\b(compare|versus|vs|difference between)\b/i.test(text)) {
      return 'COMPARISON_QUERY';
    }
    if (/\b(alert|alerts|alarm|alarms|incident|incidents|firing|critical right now)\b/i.test(text)) {
      return 'ANOMALY_LOOKUP';
    }
    if (/\b(trend|hourly|over time|timeline|history|pattern)\b/i.test(text)) {
      return 'TIME_SERIES_TREND';
    }
    if (
      /\b(which|most|top|worst|highest|lowest|rank|ranking|leading)\b/i.test(text) ||
      entities.groupBy !== undefined
    ) {
      return 'RANKING_QUERY';
    }
    if (/\b(list|show deliveries|show orders|filter)\b/i.test(text)) {
      return 'FILTERED_BREAKDOWN';
    }

    return 'METRIC_AGGREGATION';
  }

  // =========================================================================
  // 3. ANALYTICAL QUERY PLAN GENERATOR
  // =========================================================================

  private buildQueryPlan(intent: NLPIntent, entities: NLPEntities, _originalQuery: string): AnalyticalQueryPlan {
    const filters: Record<string, any> = {};
    const whereClauses: string[] = ['1=1'];

    if (entities.normalizedZone) {
      filters.customerZone = entities.normalizedZone;
      whereClauses.push(`d.customer_zone = '${entities.normalizedZone}'`);
    }

    if (entities.normalizedRestaurant) {
      filters.restaurantName = entities.normalizedRestaurant;
      whereClauses.push(`r.name = '${entities.normalizedRestaurant}'`);
    }

    if (entities.normalizedRider) {
      filters.riderName = entities.normalizedRider;
      whereClauses.push(`rd.name = '${entities.normalizedRider}'`);
    }

    if (entities.vehicleType) {
      filters.vehicleType = entities.vehicleType;
      whereClauses.push(`rd.vehicle_type = '${entities.vehicleType}'`);
    }

    if (entities.hourRange) {
      filters.hourRange = entities.hourRange;
      whereClauses.push(`EXTRACT(HOUR FROM d.assigned_at) BETWEEN ${entities.hourRange.start} AND ${entities.hourRange.end}`);
    }

    if (entities.targetMetric === 'SLA_BREACHES') {
      whereClauses.push(`d.sla_breached = TRUE`);
    }

    const groupByFields: string[] = [];
    let selectClause = '';
    let orderByClause = '';

    if (entities.groupBy === 'restaurant' || (!entities.groupBy && intent === 'RANKING_QUERY')) {
      groupByFields.push('r.name', 'd.customer_zone');
      selectClause = `r.name AS restaurant_name, d.customer_zone, COUNT(*) AS breach_count, ROUND(AVG(EXTRACT(EPOCH FROM (d.actual_delivery_time - d.assigned_at))/60)::numeric, 1) AS avg_duration_mins, ROUND(AVG(r.average_prep_time)::numeric, 1) AS avg_prep_mins`;
      orderByClause = `breach_count ${entities.sortDirection || 'DESC'}`;
    } else if (entities.groupBy === 'zone' || intent === 'COMPARISON_QUERY') {
      groupByFields.push('d.customer_zone');
      selectClause = `d.customer_zone, COUNT(*) AS total_orders, COUNT(CASE WHEN d.sla_breached THEN 1 END) AS breach_count, ROUND((COUNT(CASE WHEN d.sla_breached THEN 1 END)::numeric / COUNT(*) * 100), 1) AS breach_rate_pct`;
      orderByClause = `breach_count ${entities.sortDirection || 'DESC'}`;
    } else if (entities.groupBy === 'rider') {
      groupByFields.push('rd.name', 'rd.vehicle_type');
      selectClause = `rd.name AS rider_name, rd.vehicle_type, COUNT(*) AS total_deliveries, COUNT(CASE WHEN d.sla_breached THEN 1 END) AS breaches, ROUND(AVG(rd.rating)::numeric, 2) AS rating`;
      orderByClause = `total_deliveries ${entities.sortDirection || 'DESC'}`;
    } else if (entities.groupBy === 'hour' || intent === 'TIME_SERIES_TREND') {
      groupByFields.push('EXTRACT(HOUR FROM d.assigned_at)');
      selectClause = `EXTRACT(HOUR FROM d.assigned_at) AS order_hour, COUNT(*) AS volume, COUNT(CASE WHEN d.sla_breached THEN 1 END) AS breach_count`;
      orderByClause = `order_hour ASC`;
    } else {
      selectClause = `COUNT(*) AS total_records, COUNT(CASE WHEN d.sla_breached THEN 1 END) AS breach_count, ROUND(AVG(EXTRACT(EPOCH FROM (d.actual_delivery_time - d.assigned_at))/60)::numeric, 1) AS avg_duration_mins`;
      orderByClause = `total_records DESC`;
    }

    const generatedSQL = `
SELECT 
  ${selectClause}
FROM deliveries d
LEFT JOIN restaurants r ON d.restaurant_id = r.id
LEFT JOIN riders rd ON d.rider_id = rd.id
WHERE ${whereClauses.join(' AND ')}
${groupByFields.length > 0 ? `GROUP BY ${groupByFields.join(', ')}` : ''}
${orderByClause ? `ORDER BY ${orderByClause}` : ''}
LIMIT ${entities.limit || 5};
    `.trim();

    let explanation = `Aggregating ${entities.targetMetric || 'SLA breaches'}`;
    if (entities.normalizedZone) explanation += ` in ${entities.normalizedZone}`;
    if (entities.mealWindow) explanation += ` during ${entities.mealWindow} peak window (${entities.hourRange?.start}:00-${entities.hourRange?.end}:00)`;
    if (entities.groupBy) explanation += ` grouped by ${entities.groupBy}`;

    return {
      intent,
      entities,
      filters,
      groupBy: groupByFields,
      aggregations: [
        { field: 'sla_breached', op: 'COUNT', alias: 'breach_count' },
        { field: 'actual_delivery_time', op: 'AVG', alias: 'avg_duration' }
      ],
      orderBy: { field: 'breach_count', direction: entities.sortDirection || 'DESC' },
      limit: entities.limit || 5,
      generatedSQL,
      explanation
    };
  }
}

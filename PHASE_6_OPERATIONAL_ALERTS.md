# Phase 6: Operational Alerts System

## 📋 Overview

The **Phase 6 Operational Alerts System** provides real-time anomaly detection, threshold monitoring, and incident triage for the PeakPulse Delivery Intelligence Platform. It continuously evaluates live telemetry from delivery zones, merchant kitchens, and courier fleets against configurable operational thresholds, spawning proactive alerts with prescriptive mitigation playbooks before customer SLAs are compromised.

---

## ⚡ Operational Trigger Rules

The system implements 5 core anomaly detection rules:

| Rule ID | Anomaly Category | Default Threshold | Escalation / Severity | Trigger Logic |
| :--- | :--- | :--- | :--- | :--- |
| `RULE_ZONE_BREACH` | **Zone Breach Surge** | $> 20.0\%$ | `CRITICAL` if $> 30.0\%$ | Triggered when a delivery zone's breach rate exceeds the threshold. |
| `RULE_RESTAURANT_PREP` | **Restaurant Prep Delay** | $> 18.0\text{ min}$ | `HIGH` | Triggered when merchant kitchen preparation time exceeds standard tolerance. |
| `RULE_HIGH_RISK_SURGE` | **High-Risk Delivery Surge** | $\ge 4\text{ orders}$ | `CRITICAL` | Triggered when multiple active orders in a zone enter the ML Critical risk tier ($P(\text{Breach}) > 75\%$). |
| `RULE_FLEET_SHORTAGE` | **Courier Supply Deficit** | $\ge 1.5\text{ orders/rider}$ | `MEDIUM` | Triggered when unassigned order volume outpaces available couriers in a zone. |
| `RULE_WEATHER_HAZARD` | **Weather & Traffic Hazard** | $\ge 1.5\text{ drag factor}$ | `MEDIUM` | Triggered when adverse weather (rain/storm) degrades courier transit velocity. |

---

## 🔄 Alert Lifecycle State Machine

```
   ┌────────────────────────────────────────────────────────┐
   │                   Rule Evaluation Engine               │
   └───────────────────────────┬────────────────────────────┘
                               │ Metric Violates Threshold
                               ▼
                    ┌─────────────────────┐
                    │       ACTIVE        │ ◄─── (Fires audio/visual alarms)
                    └──────────┬──────────┘
                               │ Analyst Clicks "Acknowledge"
                               ▼
                    ┌─────────────────────┐
                    │    ACKNOWLEDGED     │ ◄─── (Records Analyst ID & Timestamp)
                    └──────────┬──────────┘
                               │ Analyst Resolves with RCA Notes
                               ▼
                    ┌─────────────────────┐
                    │      RESOLVED       │ ◄─── (Enters 15-min Anti-Flapping Cooldown)
                    └─────────────────────┘
```

### Anti-Flapping & Deduplication Cooldown
To prevent alert fatigue and notification storms, the engine enforces a configurable **15-minute cooldown window**. If an incident is resolved, new alerts for the same rule and zone are suppressed until the cooldown window elapses or metrics deteriorate further.

---

## 🔌 API Reference (`/api/alerts/*`)

All alert endpoints are protected via JWT Authentication (`Authorization: Bearer <TOKEN>`).

### 1. List Alerts
- **`GET /api/alerts`**
- **Query Params**: `status`, `severity`, `category`, `zone`, `page`, `limit`
- **Response**: Array of `OperationalAlert` objects with pagination metadata.

### 2. Active Alerts Banner Feed
- **`GET /api/alerts/active`**
- **Response**: Returns currently active (`ACTIVE` and `ACKNOWLEDGED`) alerts.

### 3. Summary & KPI Metrics
- **`GET /api/alerts/summary`**
- **Response**:
```json
{
  "success": true,
  "data": {
    "totalActive": 3,
    "criticalCount": 2,
    "highCount": 1,
    "mediumCount": 0,
    "acknowledgedCount": 1,
    "resolvedTodayCount": 4,
    "meanTimeToAcknowledgeMinutes": 8.4,
    "meanTimeToResolveMinutes": 24.2,
    "categoryBreakdown": [
      { "category": "ZONE_BREACH_SURGE", "count": 1, "severity": "CRITICAL" },
      { "category": "RESTAURANT_PREP_DELAY", "count": 1, "severity": "HIGH" },
      { "category": "HIGH_RISK_SURGE", "count": 1, "severity": "CRITICAL" }
    ]
  }
}
```

### 4. Lifecycle Actions
- **`PATCH /api/alerts/:id/acknowledge`**:
  ```json
  { "acknowledgedBy": "Jordan Kim (Ops Lead)" }
  ```
- **`PATCH /api/alerts/:id/resolve`**:
  ```json
  {
    "resolvedBy": "Jordan Kim (Ops Lead)",
    "resolutionNotes": "Dispatched 4 motorcycle riders to Zone C to alleviate backlog.",
    "rootCause": "COURIER_SHORTAGE"
  }
  ```
- **`PATCH /api/alerts/:id/dismiss`**:
  ```json
  { "reason": "False positive / temporary spike" }
  ```

### 5. Rule Configuration
- **`GET /api/alerts/rules`**: Returns list of rules with current thresholds.
- **`PUT /api/alerts/rules/:id`**: Update threshold value, cooldown, or enabled flag.

### 6. On-Demand Evaluation & Drill Simulation
- **`POST /api/alerts/evaluate`**: Triggers immediate sweep across all live operational data.
- **`POST /api/alerts/simulate`**: Injects test alert for team operational drills.

---

## 🖥️ Frontend Command Center (`🚨 Alerts`)

The `🚨 Alerts` module provides 4 specialized tabs:

1. **🚨 Live Alert Feed & Triage**:
   - Flashing critical alarm header for active P1 emergencies.
   - Status filters (`Active`, `Acknowledged`, `Resolved`, `All`).
   - Category filtering & instant text search.
   - 1-Click **"Acknowledge"** and **"Resolve with RCA"** modal dialog.
2. **⚙️ Threshold & Rule Manager**:
   - Sliders for Zone Breach %, Prep Delay min, High-Risk Surge count, and Cooldown window.
   - Enable / Disable toggles per rule.
3. **📜 Incident RCA & Audit History**:
   - Chronological audit log of resolved incidents with root cause analysis.
4. **⚡ Incident Drill Simulator**:
   - 1-Click test drills to verify operational playbooks and alert dispatching.

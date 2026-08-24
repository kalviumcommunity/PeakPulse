# Phase 7: NLP & Conversational Analytics Engine

## 📋 Overview

The **Phase 7 NLP & Conversational Analytics Engine** introduces a natural language interface for operations managers and dispatch analysts. Users can query the PeakPulse delivery intelligence system in free-form natural language (e.g., *"Which restaurants had the most dinner-time SLA breaches in North Zone?"*). The system parses semantic entities, resolves temporal and meal windows, formulates an analytical query plan with transparent SQL, executes aggregations against the analytics layer, and generates conversational executive summaries with interactive in-chat visual charts.

---

## 🧠 Semantic Parsing & Slot Extraction

The NLP engine implements a multi-stage parser:

```
                  ┌────────────────────────────────────────────────┐
                  │       Natural Language Question Input          │
                  │ ("Which restaurants had the most dinner-time   │
                  │      SLA breaches in North Zone?")             │
                  └───────────────────────┬────────────────────────┘
                                          │
                                          ▼
                  ┌────────────────────────────────────────────────┐
                  │          Semantic Entity & Slot Parser         │
                  │  • Zone: "North Zone" ➔ 'Uptown - Zone C'      │
                  │  • Meal Window: "dinner-time" ➔ 19:00 - 22:00  │
                  │  • Target Metric: "SLA breaches" (COUNT)       │
                  │  • Group By: 'restaurant'                      │
                  │  • Intent: 'RANKING_QUERY'                     │
                  └───────────────────────┬────────────────────────┘
                                          │
                                          ▼
                  ┌────────────────────────────────────────────────┐
                  │          Analytical Query Planner & SQL        │
                  │  SELECT r.name, COUNT(*) AS breach_count ...   │
                  │  WHERE d.customer_zone = 'Uptown - Zone C'     │
                  │    AND EXTRACT(HOUR FROM d.assigned_at)        │
                  │        BETWEEN 19 AND 22                       │
                  │    AND d.sla_breached = TRUE                   │
                  │  GROUP BY r.name ORDER BY breach_count DESC;   │
                  └───────────────────────┬────────────────────────┘
                                          │
                                          ▼
                  ┌────────────────────────────────────────────────┐
                  │           Analytics Layer Execution            │
                  │  (Executes aggregations & calculates metrics)  │
                  └───────────────────────┬────────────────────────┘
                                          │
                                          ▼
                  ┌────────────────────────────────────────────────┐
                  │     Multi-Modal Conversational Synthesizer     │
                  │  1. Executive Summary Markdown Answer          │
                  │  2. Interactive In-Chat Visual Chart           │
                  │  3. Formatted Operational Ranking Table        │
                  │  4. Actionable Prescriptive Mitigations        │
                  │  5. Transparent SQL Accordion                  │
                  │  6. Smart Follow-Up Drill-Down Chips           │
                  └────────────────────────────────────────────────┘
```

### Supported Intent Classes
1. `RANKING_QUERY`: "Which restaurants had the most...", "Top 5 fastest riders in Zone A"
2. `COMPARISON_QUERY`: "Compare breach rates across all zones", "Lunch vs Dinner SLA"
3. `ROOT_CAUSE_DIAGNOSIS`: "Why did Zone C have so many breaches?", "Explain primary breach drivers"
4. `TIME_SERIES_TREND`: "Hourly breach pattern over the last week"
5. `ANOMALY_LOOKUP`: "Are there any active critical operational alerts right now?"
6. `METRIC_AGGREGATION`: "What was our average kitchen delay during lunch peak?"

---

## 🔌 API Reference (`/api/nlp/*`)

All NLP endpoints are protected via JWT Authentication (`Authorization: Bearer <TOKEN>`).

### 1. Execute Conversational Analytics Query
- **`POST /api/nlp/query`**
- **Request Body**:
  ```json
  {
    "query": "Which restaurants had the most dinner-time SLA breaches in North Zone?"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "query": "Which restaurants had the most dinner-time SLA breaches in North Zone?",
      "intent": "RANKING_QUERY",
      "answer": "In **Uptown - Zone C (North Zone)** during the dinner peak window (19:00 - 22:00), **Taco Fiesta** recorded the highest number of SLA breaches with **14 breached deliveries** (41.2% breach rate), followed by **Indian Spice** with **9 breaches** (29.0% breach rate)...",
      "queryPlan": {
        "intent": "RANKING_QUERY",
        "entities": {
          "normalizedZone": "Uptown - Zone C",
          "mealWindow": "DINNER",
          "hourRange": { "start": 19, "end": 22 },
          "groupBy": "restaurant",
          "limit": 5
        },
        "generatedSQL": "SELECT r.name, COUNT(*) AS breach_count ... WHERE d.customer_zone = 'Uptown - Zone C' ... GROUP BY r.name ORDER BY breach_count DESC LIMIT 5;"
      },
      "chartType": "bar",
      "chartTitle": "Dinner Peak SLA Breaches by Restaurant in Uptown (Zone C)",
      "chartData": [
        { "label": "Taco Fiesta", "value": 14, "secondaryValue": 22.5, "unit": "breaches", "color": "#EF4444" },
        { "label": "Indian Spice", "value": 9, "secondaryValue": 19.4, "unit": "breaches", "color": "#F5A623" },
        { "label": "Pasta House", "value": 5, "secondaryValue": 16.8, "unit": "breaches", "color": "#EAB308" }
      ],
      "keyTakeaways": [
        "🚨 Taco Fiesta is the primary bottleneck with average prep latency of 22.5 min.",
        "🔥 Dinner rush volume generated an average courier wait time of 8.4 min.",
        "⚡ Switching to motorized riders projected to recover 38% of late deliveries."
      ],
      "suggestedFollowUps": [
        "Why is Taco Fiesta kitchen prep delayed during dinner?",
        "What are active operational alerts for Zone C?",
        "Compare Zone C breach rate vs Downtown Zone A",
        "Show top 5 fastest riders in North Zone"
      ],
      "confidenceScore": 0.96,
      "executionTimeMs": 24
    }
  }
  ```

### 2. Starter Prompt Suggestions Library
- **`GET /api/nlp/suggestions`**
- Returns categorized questions for operations managers (SLA Breaches, Kitchen Latency, Fleet Performance, RCA).

### 3. Data Schema & Metric Catalog
- **`GET /api/nlp/schema`**
- Returns entities, dimensions, and supported metrics.

---

## 🖥️ Frontend Conversational UI (`💬 Ask Pulse (NLP)`)

- **Chat Feed**: Dark glassmorphic ChatGPT-style message stream.
- **In-Chat Visual Charts**: Dynamic CSS bar charts, KPI cards, and donut factor decompositions.
- **SQL & Plan Inspector Accordion**: Allows operations managers to verify exact parsed slots and query transparency.
- **Voice / Speech-to-Text Input**: Clickable microphone button using Web Speech API.
- **Smart Follow-Up Chips**: Instant 1-click exploration chips to drill deeper into root causes.

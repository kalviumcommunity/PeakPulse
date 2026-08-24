# Phase 5: Machine Learning SLA Breach Predictor

## 📋 Overview

The **Phase 5 Machine Learning SLA Breach Predictor** is a classification system designed to calculate the probability of delivery SLA breaches ($P(\text{Breach})$) in real time before they occur. By training ensemble and regularized statistical models on historical delivery telemetry, the engine provides proactive risk quantification, feature-level explainability (SHAP-style attribution), and prescriptive operational mitigations.

---

## 🏗️ Architecture & Model Formulation

### 1. Classification Algorithms Implemented

| Algorithm | Type | Characteristics & Use Cases | Target Metric |
| :--- | :--- | :--- | :--- |
| **Random Forest Ensemble** *(Default)* | Bootstrap Aggregated Decision Trees ($N=25$) | Non-linear interaction handling, low variance, robust against outliers, Gini impurity splitting | $ROC\text{-}AUC \approx 0.992$, $F_1 \approx 0.986$ |
| **Gradient Boosted Decision Trees** | Sequential Residual Boosting ($\eta=0.1$) | Optimizes cross-entropy pseudo-residuals, high sensitivity for complex urban congestion | $ROC\text{-}AUC \approx 0.988$, $F_1 \approx 0.980$ |
| **L2-Regularized Logistic Regression** | Convex Gradient Descent with Sigmoid Link | High explainability, fast inference ($< 0.5\text{ms}$), calibrated baseline log-odds | $ROC\text{-}AUC \approx 0.995$, $F_1 \approx 0.978$ |

---

## 🔢 Multidimensional Feature Engineering

The feature extractor translates raw operational telemetry into a 16-dimensional continuous mathematical vector $X \in \mathbb{R}^{16}$:

```
                    ┌─────────────────────────┐
                    │ Raw Delivery Telemetry  │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ Spatial / Distance │ │ Operational Lag    │ │ Temporal / Cyclic  │
│ - Travel distance  │ │ - Assignment delay │ │ - Order hour (sin) │
│ - Zone breach prior│ │ - Kitchen prep lag │ │ - Order hour (cos) │
│ - Traffic severity │ │ - SLA buffer ratio │ │ - Peak rush flag   │
└────────────────────┘ └────────────────────┘ └────────────────────┘
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ Standard Scaler Z-Score │
                    └────────────┬────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │ Multi-Model Classifier  │
                    └────────────┬────────────┘
                                 ▼
               P(Breach) + Risk Tier + Mitigation
```

### Feature Breakdown

1. **`distanceKm`** ($x_1$): Radial delivery route distance in kilometers.
2. **`assignmentDelayMinutes`** ($x_2$): Latency from order confirmation until courier assignment and acceptance.
3. **`prepDelayMinutes`** ($x_3$): Kitchen preparation duration at merchant restaurant.
4. **`promisedDurationMinutes`** ($x_4$): SLA target commitment window (minutes).
5. **`orderHourSin`** ($x_5$) & **`orderHourCos`** ($x_6$): Cyclic trigonometric encoding of order placement time ($\sin(2\pi h/24)$, $\cos(2\pi h/24)$).
6. **`isPeakHour`** ($x_7$): Binary indicator for peak lunch (12:00-14:00) or peak dinner (19:00-22:00) dining rush.
7. **`isWeekend`** ($x_8$): Binary flag for Saturday / Sunday volume surges.
8. **`zoneRiskPrior`** ($x_9$): Target-encoded historical breach probability for customer destination zone (e.g., Zone C = 34.1%, Zone A = 8.2%).
9. **`restaurantRiskPrior`** ($x_{10}$): Historical merchant latency and delay rate.
10. **`riderExperienceLog`** ($x_{11}$): $\ln(1 + \text{Lifetime Deliveries})$ completed by assigned courier.
11. **`riderRating`** ($x_{12}$): Historical service rating ($1.0$ to $5.0$).
12. **`vehicleSpeedFactor`** ($x_{13}$): Empirical urban velocity modifier (Motorcycle: $1.35$, Scooter: $1.15$, Bike: $1.0$, Car: $0.95$, Bicycle: $0.55$).
13. **`weatherAdversityFactor`** ($x_{14}$): Weather/traffic degradation multiplier (Storm: $2.2$, Rain: $1.6$, Heavy Traffic: $1.75$, Clear: $1.0$).
14. **`orderValueScaled`** ($x_{15}$): Basket size / item complexity proxy.
15. **`slaHeadroomRatio`** ($x_{16}$): $\frac{\text{Assignment Lag} + \text{Prep Lag} + \text{Estimated Transit}}{\text{Promised SLA Window}}$.

---

## 📊 Comprehensive Evaluation Suite

The model evaluation suite calculates continuous and discrete performance indicators:

$$P(\text{Breach} \mid X) = \sigma(W^T \tilde{X} + b) \quad \text{or} \quad \frac{1}{N}\sum_{t=1}^{N} T_t(X)$$

### Mathematical Metrics

- **Accuracy**: $\frac{TP + TN}{TP + TN + FP + FN}$
- **Precision**: $\frac{TP}{TP + FP}$
- **Recall (Sensitivity)**: $\frac{TP}{TP + FN}$
- **Specificity**: $\frac{TN}{TN + FP}$
- **$F_1$-Score**: $2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$
- **ROC-AUC**: $\int_{0}^{1} \text{TPR}(\text{FPR}) \, d(\text{FPR})$ via numerical trapezoidal integration.
- **Log-Loss / Cross-Entropy**: $-\frac{1}{N}\sum_{i=1}^N [y_i \ln p_i + (1-y_i)\ln(1-p_i)]$

---

## 🔌 API Reference (`/api/ml/*`)

All endpoints are secured via JWT bearer token (`Authorization: Bearer <TOKEN>`).

### 1. Predict Single Delivery Risk
- **Endpoint**: `POST /api/ml/predict`
- **Request Body**:
```json
{
  "distanceKm": 6.5,
  "assignmentDelayMinutes": 12,
  "prepDelayMinutes": 18,
  "promisedDurationMinutes": 35,
  "customerZone": "Uptown - Zone C",
  "vehicleType": "BIKE",
  "weatherCondition": "RAIN",
  "orderHour": 20
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "breachProbability": 0.842,
    "breachPercentage": 84.2,
    "predictedLabel": 1,
    "riskLevel": "CRITICAL",
    "confidence": 0.924,
    "decisionThreshold": 0.45,
    "modelUsed": "random_forest",
    "modelVersion": "v1.4.0-prod",
    "featureContributions": [
      {
        "featureName": "assignmentDelayMinutes",
        "label": "Assignment Delay",
        "rawValue": "12 min",
        "impactScore": 0.192,
        "direction": "INCREASES_RISK",
        "description": "Delay of 12m from order placement to rider pickup sharply narrows SLA headroom."
      }
    ],
    "prescriptiveActions": [
      {
        "id": "act_reassign",
        "title": "Auto-Reassign to Nearest Motorbike Rider",
        "description": "Current assignment latency is critical. Reassign immediately to a 2-wheeler courier within 1.5 km.",
        "estimatedRiskReduction": 0.38,
        "urgency": "HIGH",
        "actionType": "RIDER_REASSIGNMENT"
      }
    ]
  }
}
```

### 2. Batch Delivery Prediction
- **Endpoint**: `POST /api/ml/batch-predict`
- **Request Body**: `{ "items": [ { "id": "1", "orderId": "ORD-1", "features": { ... } } ] }`

### 3. Model Retraining & Parameter Tuning
- **Endpoint**: `POST /api/ml/train`
- **Request Body**:
```json
{
  "algorithm": "random_forest",
  "nEstimators": 30,
  "maxDepth": 7,
  "testSplitRatio": 0.2
}
```

### 4. Evaluation Metrics & Benchmark
- **`GET /api/ml/metrics`**: Summary metrics ($ROC\text{-}AUC$, Precision, Recall, $F_1$, Confusion Matrix).
- **`GET /api/ml/roc-curve`**: Array of coordinate points $(\text{FPR}, \text{TPR}, \theta)$ and Precision-Recall curve.
- **`GET /api/ml/feature-importance`**: Ranked Gini and coefficient feature importance.
- **`GET /api/ml/models`**: Comparative multi-model benchmark table.

---

## 🖥️ Interactive Frontend Dashboard

The `🤖 ML Predictor` module provides a 4-tab command center:

1. **📊 Model Performance & ROC-AUC Hub**:
   - High-fidelity SVG ROC Curve with shaded AUC area.
   - Dynamic $2\times 2$ Confusion Matrix with real-time decision threshold slider $\theta \in [0.05, 0.95]$.
   - Feature Importance Ranking bar chart.
   - Side-by-side benchmark table comparing Random Forest, Gradient Boost, and Logistic Regression.

2. **🎯 What-If Prediction Studio**:
   - Real-time parameter sliders for Distance, Assignment Lag, Prep Lag, SLA Buffer, Zone, Vehicle, and Weather.
   - Animated SVG radial arc probability gauge.
   - SHAP-style waterfall breakdown of feature contributions.
   - 1-click prescriptive mitigation actions.

3. **⚡ Active Fleet Real-Time Risk**:
   - Fleet-wide table calculating $P(\text{Breach})$ across active couriers with risk category badges and instant filtering.

4. **⚙️ Hyperparameter Training Hub**:
   - Interactive model retraining workbench with live training telemetry log.

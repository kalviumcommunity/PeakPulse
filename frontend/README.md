# PeakPulse
# 🚚 Delivery Intelligence Platform

An analytics platform that helps food delivery companies identify the root causes of **SLA (Service Level Agreement) violations** by integrating delivery logs, rider assignments, customer complaints, and refund records into a unified analytics dashboard.

## 📌 Problem Statement

A fast-growing food delivery company stores delivery logs, rider assignment history, customer complaints, and refund records across disconnected systems. Due to fragmented data, operations teams cannot determine which delivery patterns consistently lead to SLA violations during peak hours.

This project consolidates these data sources into a single platform, enabling data-driven operational decisions and improved customer experience.

---

## 🎯 Objectives

- Integrate data from multiple operational sources.
- Detect delivery patterns leading to SLA violations.
- Analyse rider, restaurant, and delivery performance.
- Identify complaint and refund trends.
- Provide actionable insights through interactive dashboards.
- Predict high-risk deliveries (future enhancement).

---

## ✨ Features

- 📦 Unified delivery analytics
- 🚴 Rider performance tracking
- 🍽️ Restaurant performance analysis
- ⏱️ SLA violation monitoring
- 📈 Peak hour trend analysis
- 💬 Customer complaint insights
- 💸 Refund analysis
- 📊 Interactive dashboard with filters
- 📍 Zone-wise delivery analytics
- 📅 Date range filtering
- 📉 KPI cards and visual reports

---

## 📊 Key Metrics

- Total Orders
- On-Time Deliveries
- SLA Violation Rate
- Average Delivery Time
- Average Rider Assignment Time
- Complaint Rate
- Refund Rate
- Peak Hour Performance
- Top Delayed Restaurants
- Top Delayed Riders

---

## 🏗️ System Architecture

```
Delivery Logs
        │
Rider Assignments
        │
Customer Complaints
        │
Refund Records
        │
        ▼
 ETL / Data Processing
        │
        ▼
 PostgreSQL Database
        │
        ▼
 FastAPI Backend
        │
        ▼
 React Dashboard
        │
        ▼
 Business Insights
```

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Recharts / Chart.js

### Backend
- FastAPI
- Python

### Database
- PostgreSQL

### Data Processing
- Pandas
- NumPy

### Tools
- Git
- GitHub
- Figma
- Postman

---

## 📂 Project Structure

```
delivery-intelligence-platform/
│
├── frontend/
├── backend/
├── database/
├── datasets/
├── analytics/
├── docs/
└── README.md
```

---

## 📈 Dashboard Includes

- Executive Overview
- SLA Analytics
- Rider Performance
- Restaurant Performance
- Complaint Dashboard
- Refund Dashboard
- Peak Hour Analysis
- Zone-wise Analysis

---

## 🚀 Future Enhancements

- Machine Learning-based SLA prediction
- Real-time analytics
- Live rider tracking
- Automated alert system
- Recommendation engine for rider allocation
- Weather and traffic integration

---

## 👥 Team

**Squad:** 84  
**Team:** 03  
**Campus:** Chitkara University

---

## 📄 License

This project is developed for **Semester 5 - Sprint 1** as part of the Chitkara University curriculum.
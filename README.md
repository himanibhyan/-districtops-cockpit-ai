# DistrictOps Cockpit AI
**District Intelligence & Operations Platform**

> *"From Scattered Data to Decisive Action."*  
> **Theme:** Better Communities, Better Governance

DistrictOps Cockpit AI is an AI-assisted district governance operations platform that consolidates departmental information across water supply, sanitation, healthcare, public grievances, and infrastructure. It identifies emerging patterns, computes transparent risk scores, explains potential disruptions with verifiable evidence, and enables district administrators to authorize and track interventions.

---

## 🏛️ Operational Workflow

The application implements the complete governance decision lifecycle:

$$\text{DATA} \longrightarrow \text{DETECTION} \longrightarrow \text{EXPLANATION} \longrightarrow \text{ACTION} \longrightarrow \text{TRACKING}$$

1. **DATA:** Ingests citizen grievances, clinic notices, and field incident telemetry across 12 municipal wards.
2. **DETECTION:** Automated Early Warning Engine calculates risk scores ($0 - 100$) by cross-referencing complaint surges against historical baselines and resolution turnaround times.
3. **EXPLANATION:** AI Decision Assistant explains root causes and cross-sector hazards with exact citations of telemetry IDs and data limitations.
4. **ACTION:** Administrators authorize trackable interventions directly from risk alerts, assigning squadrons with mandated operational directives.
5. **TRACKING:** Full status lifecycle (`ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `RESOLVED`), progress notes, and persistent audit history.

---

## 🚀 Key Features

### 1. District Command Center (Overview)
- **Real-Time KPIs:** Active Incidents, Early Warning Alerts, Unresolved Backlog, Avg Resolution Turnaround, and Active Interventions.
- **Geospatial Ward Map:** Interactive polygonal cartogram of 12 district wards with risk hotspots and incident pin locators.
- **Incident Triage Feed:** Live feed with search, severity filters, and deep-dive incident investigations.
- **Department Performance Bar:** Cross-department SLA adherence and unresolved ticket counts.
- **Daily Situation Briefing:** Executive summary highlighting code-calculated patterns and actionable priorities.

### 2. Early Warning Engine (Risk Scoring 0–100)
- Transparent, explainable anomaly detection formula:
  $$\text{Risk Score} = \min\Big(100, \text{Round}\big(W_{\text{surge}} \cdot 0.35 + W_{\text{delay}} \cdot 0.25 + W_{\text{backlog}} \cdot 0.25 + W_{\text{nexus}} \cdot 0.15\big)\Big)$$
- Severity Thresholds:
  - **CRITICAL:** $80 - 100$
  - **HIGH:** $60 - 79$
  - **MEDIUM:** $35 - 59$
  - **LOW:** $< 35$
- Tested on acute real-world scenarios:
  - **Ward 4 (Shastri Nagar):** $+367\%$ water contamination surge + pediatric gastro clinic cluster + $20.5\text{h}$ SLA deterioration (Risk Score: **92/100**).
  - **Ward 7 (Kalyanpur Mandi):** $96\text{h}$ transit compactor breakdown + $42\text{ tonnes}$ refuse accumulation (Risk Score: **74/100**).

### 3. Grounded AI Decision Assistant
- Answers high-priority queries with zero hallucinations:
  - *Which issues require attention first?*
  - *Why are water-supply complaints increasing?*
  - *Which department has the largest unresolved backlog?*
  - *Which wards have the most concerning service trends?*
  - *What changed compared with the previous reporting period?*
  - *What should the administration investigate first?*
  - *What corrective action could address this problem?*
- Fully deterministic fallback that operates offline without third-party API dependencies.

### 4. Administrative Intervention Tracker
- Convert any risk alert or incident into an official intervention.
- Assign lead department squadrons, target completion dates, and operational actions.
- Post field progress notes and inspect audit logs.
- Immediate local persistence (`localStorage`) surviving browser refreshes.

### 5. Workload & Resource Capacity Simulator
- Interactive comparison between Status Quo (Scenario A) and Surge Re-allocation (Scenario B).
- Calculates workload hours, daily processing capacity, and resolution days.

---

## 💻 Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Build System:** Vite 5
- **Persistence:** LocalStorage Engine with immediate state synchronization
- **Design System:** Dark navy header (`#0b1329`), charcoal sidebar (`#070b14`), clean slate neutral workspace, restrained amber/red alerts

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/himanibhyan/-districtops-cockpit-ai.git
cd -districtops-cockpit-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 📋 Hackathon Demonstration Walkthrough

1. **Open Command Center:** View high-level KPIs, 12-ward geospatial cartogram, and the Executive Situation Briefing.
2. **Review Risk Alert:** Navigate to **Early Warning Engine** and inspect **ALERT-W04-WATER-SURGE** (Risk Score 92/100).
3. **Inspect Evidence:** Click *Inspect Evidence* to review the $+367\%$ surge and associated citizen affidavits.
4. **Consult AI Assistant:** Open **Decision Assistant** and ask *"Why are water-supply complaints increasing?"* to review the verified excavation rupture findings.
5. **Create Intervention:** Click *Create Trackable Intervention*, assign to *DJB Rapid Emergency Repair Squad*, and authorize.
6. **Track & Persist:** Transition status to `IN_PROGRESS`, add a progress note (*"Feeder valve isolated. 8 tankers dispatched."*), and refresh the page to verify persistent audit records.

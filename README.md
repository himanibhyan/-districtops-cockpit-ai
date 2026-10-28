# DistrictOps Cockpit AI

> *“From fragmented data to decisive governance.”*

**DistrictOps Cockpit AI** is an AI-assisted district administration command center designed for district collectors, municipal commissioners, and operational commanders. It helps administrators monitor public services, detect concerning trends early, inspect empirical telemetric evidence behind alerts, run AI-assisted decision triage, and assign and track field interventions in real time.

---

## 🏛️ Design & Philosophy

- **Serious Operational Software**: Dark charcoal/navy sidebar (`#0b1120`), light neutral workspace (`#f8fafc`), restrained status indicators, and crisp typography with monospace data callouts.
- **Root-Cause Decision Support with Humility**: The built-in AI Decision Assistant highlights metric deltas and recommends standard operating procedures while explicitly disclosing uncertainties and mandatory field ground-truth verification rules.
- **Fail-Safe Operation**: Built-in fallback to high-fidelity synthetic demo data ensures the cockpit operates smoothly even when disconnected from municipal API gateways.

---

## ⚡ Tech Stack

- **React 18** with **TypeScript**
- **Vite** for sub-second hot reload and production builds
- **Tailwind CSS** with a custom operational command palette
- **Recharts** for trend velocity and department SLA compliance analytics
- **Lucide React** for consistent administrative iconography

---

## 🚀 Key Modules

### 1. District Overview (`/`)
- **4 Real-Time KPI Cards**:
  - Open Public Grievances (1,428 tickets, -4.8% vs last week)
  - High-Priority Alerts (6 anomalies, 2 Critical)
  - Average Resolution Time (2.8 days vs statutory 2.0-day SLA)
  - Active Interventions (9 active mandates, 28 resolved this month)
- **High-Risk Anomaly Callouts**: Instant overview of active critical incidents.
- **Operational Charts**:
  - Grievance Intake vs Resolution Velocity (14-day area trend)
  - Department SLA Compliance vs Target Benchmark (bar comparison)
- **Core Department Summary Cards**: Health score index and capacity metrics for **Water Supply**, **Sanitation**, **Healthcare**, and **Public Grievances**.
- **Prominent Synthetic Demo Notice**: Clearly informs users of simulated data streams.

### 2. Early Warnings Radar (`/alerts`)
- Prioritized alert queue ranked by **Risk Score (0–100)**.
- Filtering by **Department**, **Severity (Critical, High, Medium, Low)**, and **Operational Status**.
- Full-text search across titles, affected wards, and evidence summaries.
- **Empirical Baseline Delta Metric View** (e.g. Ward 7 Drinking Water Alert):
  - *Previous complaints*: **100** ➔ *Current complaints*: **138** (`+38%`)
  - *Previous resolution time*: **2.0 days** ➔ *Current resolution time*: **3.2 days** (`+60% delay`)
  - *Available maintenance teams*: **8** ➔ **5 field squads** (`-37.5% capacity`)
  - *Pressure sensor (PS-07)*: **2.4 bar** ➔ **0.9 bar**

### 3. AI Decision Assistant (`POST /api/alerts/{id}/explain`)
Inside every alert detail panel:
- **What Changed**: Step-by-step anomaly and grievance acceleration timeline.
- **Supporting Telemetric Evidence**: Sensor data and complaint clustering with confidence ratings.
- **Considered Corrective Interventions**: Actionable options with expected operational impact and tradeoffs.
- **Operational Boundaries & Uncertainties**: Explicit disclosures ensuring no fabricated ground-truth claims (e.g. requiring microbial laboratory assays before declaring potable safety).
- **Direct Directive Dispatch**: Click any recommended action to immediately pre-fill a formal intervention.

### 4. Intervention Center (`/interventions`)
- **Full Operational Directive Lifecycle**:
  - Create new field interventions (Title, Description, Department, Priority, Target Ward, Lead Officer, Field Squad).
  - Dynamically transition statuses between **Assigned**, **In Progress**, and **Completed**.
  - Track real-time completion progress meters.
  - Linked alert references for end-to-end auditability.
  - Quick filtering by status tabs and priority levels.

### 5. Department Performance Deep Dive (`/departments`)
- Dedicated dossiers for **Water Supply**, **Sanitation**, **Healthcare**, and **Public Grievances**.
- Ward-wise grievance load vs deployed field squads.
- Direct links to department-specific alerts and active directives.

---

## 🔌 API Architecture (`src/services/api.ts`)

The centralized API client automatically uses `VITE_API_BASE_URL` when provided, or seamlessly falls back to synthetic mock telemetry:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | District summary, KPIs, and trend series |
| `GET` | `/api/alerts` | Prioritized alerts with query, dept, and severity filters |
| `GET` | `/api/alerts/{id}` | Single alert detail with metric baselines |
| `POST` | `/api/alerts/{id}/explain` | AI Decision Assistant reasoning and tradeoffs |
| `GET` | `/api/interventions` | All active and resolved directives |
| `POST` | `/api/interventions` | Create and dispatch new field directive |
| `PATCH` | `/api/interventions/{id}` | Update status (`Assigned` / `In Progress` / `Completed`) |

---

## 🛠️ Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

Open `http://localhost:3000` in your browser.

# ⚡ ENEROPT AI — Intelligent Industrial Energy Management System

[![Industry 4.0](https://img.shields.io/badge/Industry-4.0%20Smart%20Manufacturing-blue.svg)](#)
[![ISO 50001](https://img.shields.io/badge/Standard-ISO%2050001%20Energy-green.svg)](#)
[![Design](https://img.shields.io/badge/Theme-Enterprise%20Light%20Dashboard-0284c7.svg)](#)
[![Protocols](https://img.shields.io/badge/Protocols-OPC--UA%20%7C%20MQTT%20%7C%20Modbus-amber.svg)](#)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20External%20Libraries-success.svg)](#)

> **ENEROPT AI** is an enterprise-grade Industrial Energy Management & Optimization Platform designed for manufacturing facilities. It monitors live machine telemetry, predicts demand peaks to eliminate utility penalties, detects multivariate mechanical anomalies, simulates What-If production scenarios, and dispatches automated schedule work orders to shopfloor SCADA/MES systems.

---

## 🎯 1. Problem Statement Alignment

Industrial manufacturing accounts for over **30% of global electricity consumption**. In actual plant operations, energy management faces four critical challenges:

| # | Real-World Factory Problem | How ENEROPT AI Solves It | Impact / ROI |
|---|---|---|---|
| **1** | **Peak Demand Penalties (Two-Part Tariff)**<br>Exceeding the contracted maximum demand (e.g. 1,350 kW) for even 15 minutes triggers massive 150%–200% utility penalty surcharges. | **LSTM Neural Demand Forecasting & Shift Rescheduling**<br>Forecasts load 2 hours ahead and staggers heavy machine operations (e.g. shifting CNC-02 by 15 mins) to shave peak spikes. | **Eliminates demand penalties**, saving ₹80,000–₹1,50,000/month. |
| **2** | **Silent Energy Waste & Idle Draw**<br>Heavy stamping presses, pumps, and motors remain energized during low-throughput windows, consuming 15%–25% standby power. | **Telemetry Baseline Monitoring & Automated Standby Sleep**<br>Detects equipment drawing active power without workpiece feed and recommends auto-sleep triggers. | **Cuts standby waste by 22 kW** on idle presses. |
| **3** | **Uncorrelated Energy Spikes & Machine Wear**<br>Electrical spikes are rarely analyzed with mechanical health; teams only react when spindles seize or parts fail quality checks. | **Multivariate Sensor Diagnostics (Power + Vibration + PF)**<br>Correlates electrical draw (181 kW) with physical vibration (3.8 mm/s) and degraded Power Factor (0.78) to identify bearing wear early. | **Prevents unplanned downtime** through condition-based maintenance (ISO 10816). |
| **4** | **ESG & Scope 2 Compliance Gap**<br>Mandatory reporting (SEBI BRSR / GHG Protocol) requires verified Scope 2 emissions and clean energy accounting. | **Real-Time Decarbonization & Rooftop Solar PV Mix**<br>Tracks on-site solar offset ($360\text{ kW}$) vs grid ($0.71\text{ kg } CO_2\text{e/kWh}$) and logs carbon avoided in real time. | **Ensures ISO 50001 audit readiness**; avoided 667.4 kg $CO_2\text{e}$ today. |

---

## 🛠️ 2. Platform Architecture

```
[ CNCs / Stamping Presses / HVAC / Compressors ]
                       │
       (Non-Invasive CT Clamps & Accelerometers)
                       ▼
       [ Digital Sub-Meters (Modbus RTU / RS-485) ]
                       │
       [ Industrial Edge Gateway (Siemens / Advantech) ]
                       │  MQTT Telemetry (12ms packets)
                       ▼
       [ ENEROPT AI Processing & Optimization Engine ]
           ├── Actual vs Predicted Load Analytics (LSTM v3)
           ├── Multivariate Edge Diagnostics (PF, Vibration, Temp)
           ├── Scope 2 ESG Decarbonization & Solar PV Mix
           └── Production Simulation & What-If Solver
                       │
                       ▼  OPC-UA / IEC 62541
       [ SCADA / MES Automated Work Order Dispatch ]
         (Siemens SIMATIC S7-1500 / Rockwell ControlLogix)
```

---

## 📅 3. Development History & Evolutionary Journey

The project evolved through 4 iterative engineering phases to progress from a concept dashboard to a production-grade industrial platform:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     PHASE 1     │     │     PHASE 2     │     │     PHASE 3     │     │     PHASE 4     │
│ Core Dashboard  │ ──► │  High-Fidelity  │ ──► │  What-If Engine │ ──► │   Industrial    │
│  & Clean Theme  │     │ Mathematical    │     │  & AI Copilot   │     │  Deep Upgrades  │
│   Foundation    │     │     Curves      │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 🔹 Phase 1: Core Dashboard & Clean Light Theme Foundation
- Engineered a crisp **Light Theme** interface (clean whites `#ffffff`, soft slates `#f8fafc`, dark navy `#0f172a`, and industrial status accents: Blue/Green/Amber/Red).
- Built the 4 core views: **Energy Overview**, **Machine Energy Monitor**, **AI Optimization**, and **Production Simulation**.
- Configured a zero-dependency local Node.js static server (`server.js`).

### 🔹 Phase 2: High-Fidelity Mathematical Curves & Canvas Optimization
- Upgraded the power analytics chart using **Monotone Cubic Splines (Hermite / Bezier interpolation)** for mathematically accurate load modeling.
- Resolved canvas cumulative transformation zoom bugs using precise DPR identity matrix resetting (`ctx.setTransform(1, 0, 0, 1, 0, 0)`).
- Added an interactive vertical crosshair, hover halo pulse, and floating glassmorphic tooltip with threshold boundary indicators.

### 🔹 Phase 3: What-If Simulation Engine & State-Aware AI Copilot
- Created an interactive **Production Simulation Solver** allowing users to drag a **1,000 to 10,000 unit slider** to solve expected energy, cost, duration, and machine allocations in under 500ms.
- Deployed a persistent floating **"💬 Ask Me"** AI Copilot across all 4 views with dynamic natural language reasoning, suggestion chips, and deep-link navigation shortcuts.
- Added a 6-step guided presentation tour (`🎯 Guided Demo Flow`) for executive and hackathon evaluations.

### 🔹 Phase 4: Industrial Upgrades (Edge Telemetry, ESG & SCADA Dispatch)
- **Live Factory Telemetry Streaming**: Added a header toggle and sidebar MQTT terminal ticker streaming 12ms edge packets with realistic industrial jitter.
- **Multivariate Sensor Diagnostics**: Expanded CNC-02 inspection to track **Power Factor (0.78)**, **Spindle Vibration (3.8 mm/s)**, and **Bearing Health (64%)**.
- **ESG & Scope 2 Decarbonization**: Implemented on-site solar tracking (28% Solar / 72% Grid) and calculated avoided $CO_2\text{e}$ ($0.71\text{ kg/kWh}$ grid emission baseline).
- **SCADA / MES Work Order Dispatch**: Added direct OPC-UA JSON dispatch generation and one-click JSON/CSV work order exports with a permanent audit trail.

---

## 🖥️ 4. Key Dashboard Features

### 1. 📊 Energy Overview
- **4 Key KPIs**: Current Load (`1,284 kW`), Predicted Surge (`1,420 kW`), Daily Energy (`18,640 kWh`), Cost (`₹1,46,820`).
- **Interactive Spline Chart**: Actual load vs. LSTM forecast with a dashed **1,350 kW Contract Safe Limit** threshold and vertical forecast boundary.
- **Clean Energy Mix Card**: Real-time ratio of on-site rooftop solar ($360\text{ kW}$) vs. grid ($924\text{ kW}$) with **667.4 kg $CO_2\text{e}$ Avoided** badge.

### 2. 🔍 Machine Energy Monitor
- **Fleet Table**: 8 machines (CNCs, stamping presses, HVAC, compressors) with real-time status badges, load bars, and temperature readings.
- **Inspection Drawer**: Deep dive into **CNC-02** exhibiting $+20.6\%$ power surge ($181\text{ kW}$ vs $150\text{ kW}$ norm).
- **Multivariate Edge Sensors**: Displays Power Factor, Vibration velocity, and Bearing Health index with diagnostic status pills.

### 3. ⚡ Smart AI Optimization
- **Before vs. After Comparison**: Saves $940\text{ kWh } (-7.0\%)$ energy, $-₹7,400$ cost, and cuts $31\text{ kW}$ peak demand.
- **6-Step Process Flow**: Visual diagram showing how the AI engine optimizes schedules.
- **Actionable Work Orders**: Review and accept 15-minute stagger shifts, idle press auto-sleep, and HVAC pre-cooling.

### 4. 🎛️ Production Simulation
- **Dynamic What-If Slider**: Slide between 1,000 and 10,000 units across different products to compute energy budgets in real time.
- **Production Timeline**: Step-by-step Gantt sequence from 08:00 to 16:35 showing peak avoidance.
- **SCADA Dispatch Modal**: One-click dispatch transmitting setpoints to Siemens/Rockwell PLCs with instant JSON/CSV downloads.

### 5. 🤖 Ask Me AI Copilot
- Always-accessible floating assistant that understands factory telemetry, abnormal equipment alerts, simulation numbers, and carbon accounting.

---

## ⚡ 5. Practical Applicability & Industrial Standards

| Standard / Protocol | Purpose | How It's Applied |
|---|---|---|
| **ISO 50001** | Energy Management Systems | Energy baseline establishment, continuous monitoring, and target reduction. |
| **ISO 10816** | Mechanical Vibration Standards | Evaluates spindle vibration (mm/s RMS) to identify bearing degradation. |
| **OPC-UA (IEC 62541)** | Industrial Interoperability | Standard protocol for dispatching schedule setpoints to plant PLCs/SCADA. |
| **MQTT** | Lightweight Edge Telemetry | Publishes 12ms sub-meter packet feeds from edge gateways to the cloud. |
| **GHG Protocol / SEBI BRSR** | Scope 2 Carbon Accounting | Calculates indirect emissions using national grid emission factors ($0.71\text{ kg } CO_2\text{e/kWh}$). |

---

## 🚀 6. Quick Start & Running Locally

No bundlers, no build step, and no heavy dependencies required.

### Option 1: Run with Local Node.js Server (Recommended)
```bash
# 1. Clone the repository
git clone https://github.com/zen5070/Intelligent-industrial-energy-management-system.git
cd Intelligent-industrial-energy-management-system

# 2. Launch local server
node server.js
```
Open **`http://localhost:3000/`** in your browser.

### Option 2: Run with Python Engine & CLI
```bash
# 1. Run live telemetry simulation & terminal dashboard
py eneropt_engine.py

# 2. Run What-If production simulation for 8,000 units
py eneropt_engine.py --simulate 8000

# 3. Export OPC-UA JSON work order for shopfloor SCADA
py eneropt_engine.py --export-order

# 4. Launch local Python web server on port 8000
py eneropt_engine.py --serve
```

### Option 3: Direct Browser Launch
Open **`index.html`** directly in any modern browser (Chrome, Edge, Firefox).

---

## 📁 7. Repository Structure

```
├── index.html              # Main application shell with all 4 views & modals
├── eneropt_engine.py       # Python telemetry simulation, forecast & optimization engine
├── server.js               # Zero-dependency Node.js HTTP server
├── package.json            # Project metadata and start scripts
├── .gitignore              # Git ignore rules
├── README.md               # Complete platform documentation
├── scada_work_order.json   # Sample generated OPC-UA work order export
├── css/
│   ├── design-system.css   # Color tokens, typography, shadows, base resets
│   ├── layout.css          # Responsive sidebar, header, navigation, content grid
│   ├── components.css      # KPI cards, charts, tables, drawer, modals, badges
│   └── chat-assistant.css  # Floating Ask Me AI chatbot styles
└── js/
    ├── state.js            # Central reactive store & telemetry simulation engine
    ├── charts.js           # Monotone cubic spline canvas charts with crosshair
    ├── pages/
    │   ├── overview.js         # Page 1: Energy Overview controller
    │   ├── machine-monitor.js  # Page 2: Machine Energy Monitor & drawer
    │   ├── ai-optimization.js  # Page 3: Smart AI Optimization controller
    │   └── simulation.js       # Page 4: Production Simulation controller
    ├── chatbot.js          # Global floating AI assistant copilot
    ├── demo-tour.js        # 6-step guided presentation tour
    └── app.js              # Application router, clock sync, and toasts
```

---

## 📄 License

MIT License © 2026. Designed for smart manufacturing and industrial energy optimization.

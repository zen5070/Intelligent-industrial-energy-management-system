# ENEROPT AI — Intelligent Industrial Energy Management & Optimization

[![Industry 4.0](https://img.shields.io/badge/Industry-4.0%20%2F%20Smart%20Manufacturing-blue.svg)](#)
[![ISO Standard](https://img.shields.io/badge/ISO-50001%20Energy%20Management-green.svg)](#)
[![Theme](https://img.shields.io/badge/Design-Enterprise%20Light%20Theme-0284c7.svg)](#)
[![Protocol](https://img.shields.io/badge/Protocols-OPC--UA%20%7C%20MQTT%20%7C%20Modbus-amber.svg)](#)

> **ENEROPT AI** is an enterprise-grade, AI-powered industrial energy management platform designed for discrete and continuous manufacturing facilities. It tracks real-time sub-meter telemetry, forecasts demand surges to prevent tariff penalties, detects multivariate machine abnormalities, models production what-if scenarios, and dispatches optimized schedules to shopfloor SCADA/MES controllers.

---

## 🌟 Key Highlights

- **Strict Clean Light Theme**: Designed specifically for enterprise presentation, control rooms, and hackathons (clean whites, subtle borders, slate accents; zero dark-clutter backgrounds).
- **Monotone Cubic Spline Analytics**: Interactive canvas-based power demand curves with crosshairs, floating tooltips, and forecast boundary splits.
- **Physics & Tariff Modeling**: Grounded in industrial two-part tariffs (Maximum Demand Charges in kVA/kW, ToD time-of-day rates).
- **Embedded Copilot**: Persistent **Ask Me AI** assistant with plant state-awareness across all views.
- **6-Step Jury Presentation Flow**: Built-in guided tour demonstrating the complete value journey from detection to SCADA dispatch.

---

## 🏛️ System Architecture

```
[ CNC / Stamping Presses / HVAC / Compressors ]
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
           ├── Multivariate Sensor Diagnostics (PF, Vib, Temp)
           ├── Scope 2 ESG Decarbonization & Solar PV Mix
           └── Production Simulation & What-If Solver
                       │
                       ▼  OPC-UA / IEC 62541
       [ SCADA / MES Automated Work Order Dispatch ]
         (Siemens SIMATIC S7-1500 / Rockwell ControlLogix)
```

---

## 🚀 Core Features

### 1. 📊 Energy Overview & Neural Forecasting
- **Live Factory KPIs**: Real-time power load (`1,284 kW`), predicted 2-hour peak demand (`1,420 kW`), cumulative daily consumption (`18,640 kWh`), and estimated energy cost (`₹1,46,820`).
- **Interactive Load Spline**: Monotone cubic Hermite curves mapping actual 15-minute telemetry against neural LSTM predictions, with a prominent **1,350 kW Contract Safe Limit** threshold.
- **ESG & Solar PV Mix**: Real-time breakdown of on-site rooftop solar generation ($360\text{ kW / }28\%$) vs. grid intake ($924\text{ kW / }72\%$) and tracking of avoided greenhouse gas emissions (**`667.4 kg CO₂e avoided`**).

### 2. 🔍 Machine Energy Monitor & Multivariate Diagnostics
- **8-Machine Fleet Dashboard**: Real-time monitoring across 5-axis CNCs, stamping presses, climate HVAC, and rotary screw compressors.
- **Slide-Out Inspection Drawer**: Deep dive into **CNC-02** exhibiting $+20.6\%$ power surge ($181\text{ kW}$ vs $150\text{ kW}$ norm) and thermal stress ($71^\circ\text{C}$).
- **Multivariate Edge Telemetry**: Correlates electrical consumption with physical machine wear:
  - **Power Factor**: `0.78` (degraded capacitor bank alert).
  - **Vibration**: `3.8 mm/s` (harmonic mechanical spindle stress per ISO 10816).
  - **Bearing Health Index**: `64%` (predictive maintenance advisory).

### 3. ⚡ Smart AI Optimization & Schedule Rescheduling
- **Before vs After Impact**:
  - **Energy Reduction**: $-940\text{ kWh } (-7.0\%)$
  - **Cost Savings**: $-₹7,400\text{/shift}$
  - **Peak Demand Reduction**: $-7\%$ ($31\text{ kW}$ shaved from peak window)
  - **Cycle Time**: 35 minutes faster with 1 standby machine freed.
- **6-Step Visual Process Flow**: Energy Forecast → Production Target → Machine Status → AI Engine → Optimized Schedule → Reduction.
- **Actionable Work Orders**: One-click schedule shift reviews for CNC-02, automated sleep for Press-02 idle standby, and HVAC thermal pre-cooling.

### 4. 🎛️ Production Simulation (What-If Solver)
- **Dynamic Interactive Slider**: Simulate production outputs from **1,000 to 10,000 units** across product types (Precision Gearboxes, Hydraulic Valves, EV Drive Casings).
- **Instant Recalculations**: Solves required machine capacity, energy budgets, total completion deadlines, and cost impact in under 500ms.
- **SCADA / MES Work Order Generator**: Transmits automated dispatch setpoints to factory PLCs. Exports production work orders as **OPC-UA JSON** and **CSV**.

### 5. 🤖 Ask Me AI Copilot
- Persistent floating copilot available across all pages.
- Deterministic, state-aware answers for plant energy, abnormal equipment, tariff avoidance, production feasibility, and carbon accounting.
- Quick suggestion chips with interactive deep-linking shortcuts.

---

## 🛠️ Tech Stack & Standards

- **Frontend**: Semantic HTML5, Modular Vanilla CSS Design System (Custom Tokens, CSS Grid/Flexbox), Native ES6 JavaScript.
- **Data Visualization**: Zero-dependency HTML5 Canvas rendering engine with high-DPI scaling and monotone cubic interpolation.
- **Server**: Lightweight Node.js static HTTP daemon (`server.js`).
- **Industrial Standards Supported**:
  - **ISO 50001**: Energy Management Systems
  - **ISO 10816**: Mechanical Vibration Evaluation
  - **IEC 62541**: OPC Unified Architecture (OPC-UA)
  - **SEBI BRSR / GHG Protocol**: Scope 2 Emission Reporting ($0.71\text{ kg } CO_2\text{e/kWh}$)

---

## 🏃 Local Setup & Running

No external build tools, bundlers, or heavy npm dependencies are required.

### Option 1: Using the Node.js Server (Recommended)
```bash
# Clone repository
git clone https://github.com/<your-username>/eneropt-ai.git
cd eneropt-ai

# Start local server
npm start
# or: node server.js
```
Open **`http://localhost:3000/`** in any modern web browser.

### Option 2: Direct Browser Launch
Simply double-click **`index.html`** or open it directly in Chrome, Edge, or Firefox.

---

## 📂 Repository Structure

```
eneropt-ai/
├── index.html              # Main application shell with all 4 views & modals
├── server.js               # Zero-dependency Node.js HTTP server
├── package.json            # Project manifest
├── .gitignore              # Git ignore configuration
├── css/
│   ├── design-system.css   # Tokens, colors, typography, elevations, resets
│   ├── layout.css          # Responsive sidebar, header, breadcrumbs, content layout
│   ├── components.css      # KPI cards, charts, tables, drawer, modals, badges
│   └── chat-assistant.css  # Floating Ask Me AI chatbot widget
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

MIT License. Designed and engineered for industrial energy optimization and smart manufacturing demonstrations.

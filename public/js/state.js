/**
 * ENEROPT AI — Central Reactive State Store
 * Manages plant telemetry, machine monitoring, AI forecast data,
 * ESG carbon accounting, multivariate diagnostics, and SCADA/MES dispatch.
 */

class AppState {
  constructor() {
    this.listeners = [];

    // Current Active View: 'overview', 'machines', 'optimization', 'simulation'
    this.currentView = 'overview';

    // Live Streaming Engine Toggle
    this.isLiveStreaming = true;
    this.streamIntervalId = null;
    this.lastMqttPacket = {
      topic: 'factory/plant04/telemetry/aggregate',
      timestamp: new Date().toLocaleTimeString(),
      payload: '{"power_kw": 1284.2, "pf": 0.96, "freq_hz": 50.02}'
    };

    // Plant Metadata
    this.plantInfo = {
      id: 'PLANT-04',
      name: 'Plant #4 — Precision Machining Hub',
      location: 'Chennai, Industrial Corridor',
      status: 'Operational',
      tariffPerKwh: 7.87,
      activeShift: 'Shift A (06:00 - 14:30)',
      connectedMachines: 8,
      totalMachines: 8,
      gridCarbonFactor: 0.71 // kg CO2e / kWh (CEA India grid baseline)
    };

    // ESG & Carbon Accounting
    this.esg = {
      carbonFactor: 0.71,
      gridEmissionFactor: 0.71,
      todayEmissionsKg: Math.round(18640 * 0.71), // ~13,234 kg CO2e
      todayEmissionsTons: +((18640 * 0.71) / 1000).toFixed(2), // 13.23 tCO2e
      todayScope2Tons: +((18640 * 0.71) / 1000).toFixed(2),
      carbonSavedKg: Math.round(940 * 0.71), // 667.4 kg CO2e avoided
      carbonSavedTodayKg: Math.round(940 * 0.71),
      energyMix: {
        gridPercent: 72,
        solarPercent: 28,
        gridKw: 924,
        solarKw: 360,
        solarGenerationTodayKwh: 5220,
        avoidedTariffSolar: 41080 // ₹ saved from on-site rooftop generation
      }
    };

    // Overview KPIs
    this.kpis = {
      currentPower: 1284,       // kW
      currentPowerStatus: 'Normal',
      predictedDemand: 1420,    // kW
      predictedDemandStatus: 'Next 2 hours',
      predictedDemandChange: '+10.6%',
      todayConsumption: 18640,  // kWh
      todayComparison: '+3.8% vs yesterday',
      yesterdayConsumption: 17950,
      todayCost: 146820,        // ₹
      costComparison: '₹7.87/kWh avg tariff',
      forecastAccuracy: 94.2,
      powerFactor: 0.96,
      gridFrequency: 50.02      // Hz
    };

    // Energy History
    this.history = {
      today: { kwh: 18640, change: '+3.8%', trend: 'up', cost: 146820 },
      yesterday: { kwh: 17950, change: '-1.2%', trend: 'down', cost: 141200 },
      thisWeek: { kwh: 112400, change: '+2.1%', trend: 'up', cost: 884500 },
      lastWeek: { kwh: 110100, change: '0.0%', trend: 'stable', cost: 866000 }
    };

    // Machine Fleet Telemetry (with Multivariate Industrial Diagnostics)
    this.machines = [
      {
        id: 'CNC-01',
        name: '5-Axis Machining Center 01',
        currentPower: 148,
        normalPower: 150,
        diff: -1.3,
        temperature: 58,
        normalTemp: 60,
        load: 82,
        status: 'Normal',
        alert: 'Optimal baseline',
        pf: 0.97,
        vibration: 1.2, // mm/s (ISO 10816 safe < 2.8)
        kvar: 29,
        bearingHealth: 98,
        feedRate: 100
      },
      {
        id: 'CNC-02',
        name: '5-Axis Heavy Milling 02',
        currentPower: 181,
        normalPower: 150,
        diff: 20.6,
        temperature: 71,
        normalTemp: 60,
        load: 92,
        status: 'Abnormal',
        alert: 'Power surge +20.6% above baseline',
        abnormalReason: 'CNC-02 is consuming significantly more energy than its normal operating range while production output remains nearly unchanged.',
        recommendation: 'Spindle bearing thermal check required. Shift operation outside 14:00 peak.',
        pf: 0.91, // Degraded power factor
        vibration: 3.8, // mm/s (Elevated vibration harmonics!)
        kvar: 62,
        bearingHealth: 64, // Predictive maintenance alert!
        feedRate: 92
      },
      {
        id: 'CNC-03',
        name: 'High Precision Lathe 03',
        currentPower: 152,
        normalPower: 150,
        diff: 1.3,
        temperature: 61,
        normalTemp: 60,
        load: 84,
        status: 'Normal',
        alert: 'Operating within tolerance',
        pf: 0.96,
        vibration: 1.4,
        kvar: 31,
        bearingHealth: 94,
        feedRate: 98
      },
      {
        id: 'Press-01',
        name: 'Hydraulic Stamping Press 01',
        currentPower: 210,
        normalPower: 215,
        diff: -2.3,
        temperature: 64,
        normalTemp: 65,
        load: 78,
        status: 'Normal',
        alert: 'Hydraulic cycle nominal',
        pf: 0.95,
        vibration: 1.6,
        kvar: 48,
        bearingHealth: 96,
        feedRate: 85
      },
      {
        id: 'Press-02',
        name: 'Hydraulic Stamping Press 02',
        currentPower: 242,
        normalPower: 215,
        diff: 12.5,
        temperature: 68,
        normalTemp: 65,
        load: 88,
        status: 'Warning',
        alert: 'High idle power draw during pause intervals',
        pf: 0.92,
        vibration: 2.3,
        kvar: 58,
        bearingHealth: 88,
        feedRate: 90
      },
      {
        id: 'Motor-04',
        name: 'High-Torque Induction Motor 04',
        currentPower: 88,
        normalPower: 90,
        diff: -2.2,
        temperature: 52,
        normalTemp: 55,
        load: 75,
        status: 'Normal',
        alert: 'Inverter drive stable',
        pf: 0.98,
        vibration: 0.9,
        kvar: 16,
        bearingHealth: 99,
        feedRate: 100
      },
      {
        id: 'HVAC-01',
        name: 'Shopfloor Climate Unit 01',
        currentPower: 165,
        normalPower: 140,
        diff: 17.8,
        temperature: 48,
        normalTemp: 45,
        load: 90,
        status: 'Warning',
        alert: 'Pre-cooling recommended prior to 14:00 peak',
        pf: 0.94,
        vibration: 1.1,
        kvar: 38,
        bearingHealth: 92,
        feedRate: 95
      },
      {
        id: 'Compressor-02',
        name: 'Rotary Screw Air Compressor 02',
        currentPower: 98,
        normalPower: 100,
        diff: -2.0,
        temperature: 55,
        normalTemp: 58,
        load: 70,
        status: 'Normal',
        alert: 'Pressure regulated at 7.2 bar',
        pf: 0.96,
        vibration: 1.3,
        kvar: 22,
        bearingHealth: 95,
        feedRate: 80
      }
    ];

    // Selected Machine for Detail Drawer (defaults to CNC-02)
    this.selectedMachine = this.machines[1];

    // AI Optimization State
    this.optimizationState = {
      engineStatus: 'Optimization plan ready',
      lastRunTime: '16:25 Today',
      plans: {
        current: {
          energy: 13420,
          cost: 106000,
          productionTime: '9h 10m',
          machines: 8,
          carbonKg: Math.round(13420 * 0.71)
        },
        optimized: {
          energy: 12480,
          cost: 98600,
          productionTime: '8h 35m',
          machines: 7,
          carbonKg: Math.round(12480 * 0.71)
        }
      },
      actions: [
        {
          id: 'act-1',
          machine: 'CNC-02',
          actionTitle: 'Shift operation by 15 minutes',
          reason: 'Predicted demand peak detected between 14:00 and 15:00.',
          expectedResult: 'Reduced peak energy demand by 31 kW. Saves ₹2,800 & 227 kg CO2e.',
          applied: false,
          currentSchedule: 'Continuous 09:00 - 15:30',
          recommendedSchedule: '09:00 - 13:45, Staggered Pause 15m, 14:00 - 15:15',
          energyReduction: '320 kWh',
          costReduction: '₹2,800',
          carbonReduction: '227 kg CO2e',
          productionImpact: 'Zero impact — buffer stock maintains line pace',
          confidence: '96.4%'
        },
        {
          id: 'act-2',
          machine: 'Press-02',
          actionTitle: 'Reduce idle operating time',
          reason: 'Machine remains powered during low-production intervals.',
          expectedResult: 'Lower unnecessary consumption. Standby loss cut by 22 kW.',
          applied: false,
          currentSchedule: 'Continuous Standby when idle',
          recommendedSchedule: 'Auto-sleep standby after 3 min inactivity',
          energyReduction: '180 kWh',
          costReduction: '₹1,420',
          carbonReduction: '128 kg CO2e',
          productionImpact: 'Zero impact — 10 sec wake-up time',
          confidence: '98.1%'
        },
        {
          id: 'act-3',
          machine: 'HVAC-01',
          actionTitle: 'Adjust operating schedule',
          reason: 'Non-critical load can be shifted outside peak demand.',
          expectedResult: 'Reduced peak demand by 45 kW via thermal pre-cooling.',
          applied: false,
          currentSchedule: 'Run standard cooling 13:00 - 17:00',
          recommendedSchedule: 'Pre-cool 12:00 - 13:30, eco-float 13:30 - 15:30',
          energyReduction: '440 kWh',
          costReduction: '₹3,180',
          carbonReduction: '312 kg CO2e',
          productionImpact: 'Zero impact — ambient temp remains ±1°C',
          confidence: '94.8%'
        }
      ]
    };

    // Selected Action for Detail Modal
    this.selectedAction = this.optimizationState.actions[0];

    // Production Simulation State
    this.simulation = {
      targetUnits: 5000,
      productType: 'Product A',
      deadline: 'Today — 6:00 PM',
      isCalculating: false,
      results: {
        target: 5000,
        estimatedTime: '8h 35m',
        timeMinutes: 515,
        expectedEnergy: 12480,
        estimatedCost: 98600,
        machinesRequired: 7,
        efficiency: 94,
        normalEnergy: 13420,
        normalCost: 106000,
        normalTime: '9h 10m',
        normalMachines: 8,
        energySaved: 940,
        costSaved: 7400,
        carbonSavedKg: 667.4,
        peakReduction: '7%'
      }
    };

    // Audit Trail & SCADA / MES Dispatch Records
    this.auditTrail = [
      {
        id: 'DISP-1041',
        type: 'MES Dispatch',
        timestamp: '14:30 Today',
        user: 'Rajesh Sharma',
        action: 'Shift A Staggered Schedule deployed to Siemens SCADA PLC',
        status: 'CONFIRMED'
      },
      {
        id: 'AUDIT-892',
        type: 'AI Schedule Shift',
        timestamp: '13:45 Today',
        user: 'EnerOpt Optimizer v4.1',
        action: 'CNC-02 Spindle thermal avoidance shift accepted',
        status: 'VERIFIED'
      }
    ];

    // Notification Feed
    this.notifications = [
      { id: 1, type: 'critical', title: 'CNC-02 Power Surge', desc: '+20.6% excess power (181 kW vs 150 kW norm, Vibration 3.8 mm/s)', time: '12m ago', read: false },
      { id: 2, type: 'warning', title: 'Peak Demand Ahead', desc: 'Demand forecast to hit 1,420 kW at 14:00', time: '28m ago', read: false },
      { id: 3, type: 'info', title: 'Optimization Plan Ready', desc: 'AI generated 3 shift actions saving ₹7,400 & 667 kg CO2e', time: '1h ago', read: true }
    ];

    // Recalculate simulation values dynamically on init
    this.calculateSimulation(5000, 'Product A');

    // Start Live Telemetry Streaming Loop
    this.startLiveStreaming();
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event, payload) {
    this.listeners.forEach(cb => cb(event, payload, this));
  }

  setView(viewName) {
    this.currentView = viewName;
    this.notify('VIEW_CHANGED', viewName);
  }

  selectMachine(machineId) {
    const found = this.machines.find(m => m.id === machineId);
    if (found) {
      this.selectedMachine = found;
      this.notify('MACHINE_SELECTED', found);
    }
  }

  selectAction(actionId) {
    const found = this.optimizationState.actions.find(a => a.id === actionId);
    if (found) {
      this.selectedAction = found;
      this.notify('ACTION_SELECTED', found);
    }
  }

  acceptAction(actionId) {
    const action = this.optimizationState.actions.find(a => a.id === actionId);
    if (action) {
      action.applied = true;

      // Add to Audit Trail
      this.auditTrail.unshift({
        id: `ACT-${Date.now().toString().slice(-4)}`,
        type: 'Optimization Applied',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: 'Rajesh Sharma',
        action: `${action.machine}: ${action.actionTitle}`,
        status: 'ACTIVE'
      });

      this.notify('ACTION_ACCEPTED', action);
    }
  }

  /**
   * Generates a realistic SCADA / MES Dispatch Work Order
   */
  dispatchToMes() {
    const sim = this.simulation.results;
    const orderId = `WO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const timestamp = new Date().toISOString();

    const dispatchOrder = {
      workOrderId: orderId,
      plantId: this.plantInfo.id,
      plantName: this.plantInfo.name,
      shift: this.plantInfo.activeShift,
      timestamp: timestamp,
      dispatchedBy: 'Rajesh Sharma (Plant Energy Director)',
      targetUnits: sim.target,
      productType: this.simulation.productType,
      targetCompletionTime: sim.estimatedTime,
      totalEnergyBudgetKwh: sim.expectedEnergy,
      estimatedCostInr: sim.estimatedCost,
      carbonAvoidedKg: sim.carbonSavedKg,
      assignedMachines: this.machines.slice(0, sim.machinesRequired).map(m => ({
        machineId: m.id,
        name: m.name,
        allocatedKw: m.currentPower,
        status: 'COMMAND_DISPATCHED'
      }))
    };

    // Add entry to audit log
    this.auditTrail.unshift({
      id: orderId,
      type: 'MES Schedule Dispatch',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user: 'Rajesh Sharma',
      action: `Dispatched ${sim.target.toLocaleString()} units schedule to Siemens SCADA`,
      status: 'CONFIRMED'
    });

    this.notify('MES_DISPATCHED', dispatchOrder);
    return dispatchOrder;
  }

  /**
   * Live Telemetry Streaming Loop:
   * Simulates real-time industrial MQTT micro-fluctuations (power, PF, vibration).
   */
  startLiveStreaming() {
    if (this.streamIntervalId) clearInterval(this.streamIntervalId);

    this.streamIntervalId = setInterval(() => {
      if (!this.isLiveStreaming) return;

      // Small realistic industrial noise: ±0.4% to ±0.8%
      const jitter = (Math.random() - 0.49) * 4;
      this.kpis.currentPower = Math.round(1284 + jitter);

      // Micro-fluctuate solar generation & grid ratio
      const solarJitter = (Math.random() - 0.5) * 6;
      this.esg.energyMix.solarKw = Math.round(360 + solarJitter);
      this.esg.energyMix.gridKw = this.kpis.currentPower - this.esg.energyMix.solarKw;
      this.esg.energyMix.solarPercent = Math.round((this.esg.energyMix.solarKw / this.kpis.currentPower) * 100);
      this.esg.energyMix.gridPercent = 100 - this.esg.energyMix.solarPercent;

      // Micro-fluctuate CNC-02 telemetry
      const cnc02 = this.machines.find(m => m.id === 'CNC-02');
      if (cnc02) {
        cnc02.currentPower = Math.round(181 + (Math.random() - 0.5) * 3);
        cnc02.vibration = +(3.8 + (Math.random() - 0.5) * 0.15).toFixed(2);
      }

      // Latest simulated MQTT packet
      const targetMachine = this.machines[Math.floor(Math.random() * this.machines.length)];
      this.lastMqttPacket = {
        topic: `factory/plant04/${targetMachine.id.toLowerCase()}/telemetry`,
        timestamp: new Date().toLocaleTimeString(),
        payload: `{"id":"${targetMachine.id}","kw":${targetMachine.currentPower},"pf":${targetMachine.pf},"vib_mms":${targetMachine.vibration},"temp_c":${targetMachine.temperature}}`
      };

      this.notify('TELEMETRY_TICK', {
        currentPower: this.kpis.currentPower,
        energyMix: this.esg.energyMix,
        lastPacket: this.lastMqttPacket
      });
    }, 2500);
  }

  toggleLiveStreaming() {
    this.isLiveStreaming = !this.isLiveStreaming;
    this.notify('STREAM_TOGGLED', this.isLiveStreaming);
    return this.isLiveStreaming;
  }

  /**
   * Deterministic simulation model with ESG Carbon calculations
   */
  calculateSimulation(units, productType = this.simulation.productType) {
    units = Math.max(1000, Math.min(10000, Number(units) || 5000));
    this.simulation.targetUnits = units;
    this.simulation.productType = productType;

    const ratio = units / 5000;

    let productFactor = 1.0;
    if (productType === 'Product B') productFactor = 0.88;
    if (productType === 'Product C') productFactor = 1.12;

    // Normal plan formulas
    const normalEnergy = Math.round(13420 * ratio * productFactor);
    const normalCost = Math.round(106000 * ratio * productFactor);
    const normalMinutes = Math.round(550 * Math.pow(ratio, 0.82) * productFactor);
    const normalHours = Math.floor(normalMinutes / 60);
    const normalRemMin = normalMinutes % 60;
    const normalTimeStr = `${normalHours}h ${normalRemMin.toString().padStart(2, '0')}m`;
    const normalMachines = Math.min(8, Math.max(4, Math.round(8 * Math.pow(ratio, 0.35))));

    // AI Optimized formulas
    const optEnergy = Math.round(12480 * ratio * productFactor);
    const optCost = Math.round(98600 * ratio * productFactor);
    const optMinutes = Math.round(515 * Math.pow(ratio, 0.82) * productFactor);
    const optHours = Math.floor(optMinutes / 60);
    const optRemMin = optMinutes % 60;
    const optTimeStr = `${optHours}h ${optRemMin.toString().padStart(2, '0')}m`;
    const optMachines = Math.max(3, normalMachines - 1);
    const efficiency = Math.min(96, Math.max(90, Math.round(94 + (5000 - units) * 0.0005)));

    const energySaved = normalEnergy - optEnergy;
    const costSaved = normalCost - optCost;
    const carbonSavedKg = +(energySaved * this.esg.carbonFactor).toFixed(1); // 940 * 0.71 = 667.4 kg CO2e
    const peakReduction = `${Math.round(7 * productFactor)}%`;

    this.simulation.results = {
      target: units,
      estimatedTime: optTimeStr,
      timeMinutes: optMinutes,
      expectedEnergy: optEnergy,
      estimatedCost: optCost,
      machinesRequired: optMachines,
      efficiency: efficiency,
      normalEnergy: normalEnergy,
      normalCost: normalCost,
      normalTime: normalTimeStr,
      normalMachines: normalMachines,
      energySaved: energySaved,
      costSaved: costSaved,
      carbonSavedKg: carbonSavedKg,
      peakReduction: peakReduction
    };

    this.notify('SIMULATION_UPDATED', this.simulation.results);
    return this.simulation.results;
  }
}

// Global singleton instances
window.enerOptState = window.energyWiseState = new AppState();

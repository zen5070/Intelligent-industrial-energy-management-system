/**
 * ENEROPT AI — Page 4: Production Simulation Controller
 * One of the most important features of the application.
 * Dynamic What-If calculations for energy, time, cost, and machine requirements.
 */

class SimulationPage {
  constructor() {
    this.state = window.enerOptState;
  }

  init() {
    this.bindInputs();
    this.setupMesDispatchModal();
    this.renderResults();
  }

  setupMesDispatchModal() {
    const backdrop = document.getElementById('mesDispatchModalBackdrop');
    const panel = document.getElementById('mesDispatchModalPanel');
    const closeBtn = document.getElementById('closeMesDispatchModalBtn');
    const openBtn = document.getElementById('openMesDispatchModalBtn');
    const auditBtn = document.getElementById('viewAuditLogBtn');
    const downloadJsonBtn = document.getElementById('downloadMesJsonBtn');
    const downloadCsvBtn = document.getElementById('downloadMesCsvBtn');
    const confirmBtn = document.getElementById('confirmMesDispatchBtn');

    const close = () => {
      if (backdrop) backdrop.classList.remove('open');
      if (panel) panel.classList.remove('open');
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        this.openMesModal();
      });
    }

    if (auditBtn) {
      auditBtn.addEventListener('click', () => {
        this.openMesModal();
      });
    }

    if (downloadJsonBtn) {
      downloadJsonBtn.addEventListener('click', () => {
        this.downloadWorkOrder('json');
      });
    }

    if (downloadCsvBtn) {
      downloadCsvBtn.addEventListener('click', () => {
        this.downloadWorkOrder('csv');
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `⚡ Transmitting to SCADA Gateway...`;

        setTimeout(() => {
          const order = this.state.dispatchToMes();
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = `✓ Dispatched & Acknowledged`;
          window.showToast(`Work Order ${order.workOrderId} deployed to Siemens SCADA PLC!`, 'success');
          this.renderAuditTrail();

          setTimeout(() => {
            close();
            confirmBtn.innerHTML = `⚡ Transmit to SCADA Gateway`;
          }, 1200);
        }, 600);
      });
    }
  }

  openMesModal() {
    const backdrop = document.getElementById('mesDispatchModalBackdrop');
    const panel = document.getElementById('mesDispatchModalPanel');
    const res = this.state.simulation.results;

    // Update KPIs in modal
    const unitsEl = document.getElementById('mesDispatchTargetUnits');
    if (unitsEl) unitsEl.textContent = `${res.target.toLocaleString()}`;

    const savingsEl = document.getElementById('mesDispatchSavings');
    if (savingsEl) savingsEl.textContent = `₹${res.costSaved.toLocaleString()}`;

    // Format JSON preview
    const payloadEl = document.getElementById('mesDispatchPayloadView');
    if (payloadEl) {
      const sampleOrder = {
        protocol: "OPC-UA / IEC 62541",
        workOrderId: `WO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
        targetUnits: res.target,
        productType: this.state.simulation.productType,
        staggerOffsetMinutes: 15,
        targetDuration: res.estimatedTime,
        peakCapKw: 1320,
        energyBudgetKwh: res.expectedEnergy,
        carbonAvoidedKg: res.carbonSavedKg || Math.round(res.energySaved * 0.71),
        activeMachines: this.state.machines.slice(0, res.machinesRequired).map(m => m.id)
      };
      payloadEl.innerHTML = `<pre style="margin:0;font-family:inherit;">${JSON.stringify(sampleOrder, null, 2)}</pre>`;
    }

    this.renderAuditTrail();

    if (backdrop) backdrop.classList.add('open');
    if (panel) panel.classList.add('open');
  }

  renderAuditTrail() {
    const listEl = document.getElementById('mesAuditTrailList');
    const countEl = document.getElementById('mesAuditTrailCount');
    if (!listEl) return;

    if (countEl) countEl.textContent = `${this.state.auditTrail.length} Dispatches Logged`;

    listEl.innerHTML = this.state.auditTrail.map(item => `
      <div style="background:#ffffff;border:1px solid var(--border-default);border-radius:var(--radius-sm);padding:0.5rem 0.65rem;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;">
        <div>
          <div style="font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:0.4rem;">
            <span style="font-family:var(--font-mono);color:var(--blue-primary);">${item.id}</span>
            <span>•</span>
            <span>${item.action}</span>
          </div>
          <div style="color:var(--text-muted);font-size:0.7rem;margin-top:2px;">
            ${item.timestamp} • By ${item.user}
          </div>
        </div>
        <span class="badge ${item.status === 'CONFIRMED' ? 'badge-normal' : (item.status === 'ACTIVE' ? 'badge-sparkle' : 'badge-neutral')}" style="font-size:0.65rem;">
          ${item.status}
        </span>
      </div>
    `).join('');
  }

  downloadWorkOrder(format) {
    const res = this.state.simulation.results;
    const workOrderId = `WO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    
    if (format === 'json') {
      const data = {
        workOrderId,
        plant: this.state.plantInfo.name,
        targetUnits: res.target,
        product: this.state.simulation.productType,
        completionTime: res.estimatedTime,
        energyBudgetKwh: res.expectedEnergy,
        costSavingsInr: res.costSaved,
        carbonAvoidedKg: res.carbonSavedKg || Math.round(res.energySaved * 0.71),
        allocatedMachines: this.state.machines.slice(0, res.machinesRequired).map(m => ({
          id: m.id,
          name: m.name,
          kw: m.currentPower
        })),
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      this.triggerFileDownload(blob, `${workOrderId}.json`);
      window.showToast(`Downloaded Work Order ${workOrderId}.json`, 'info');
    } else {
      const csvRows = [
        ['Field', 'Value'],
        ['Work Order ID', workOrderId],
        ['Plant', this.state.plantInfo.name],
        ['Target Units', res.target],
        ['Product Type', this.state.simulation.productType],
        ['Production Time', res.estimatedTime],
        ['Energy Budget (kWh)', res.expectedEnergy],
        ['Normal Energy (kWh)', res.normalEnergy],
        ['Energy Saved (kWh)', res.energySaved],
        ['Cost Saved (INR)', res.costSaved],
        ['Carbon Avoided (kg CO2e)', res.carbonSavedKg || Math.round(res.energySaved * 0.71)],
        ['Machines Allocated', res.machinesRequired],
        ['Export Timestamp', new Date().toISOString()]
      ];
      const csvContent = csvRows.map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      this.triggerFileDownload(blob, `${workOrderId}.csv`);
      window.showToast(`Downloaded Work Order ${workOrderId}.csv`, 'info');
    }
  }

  triggerFileDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  bindInputs() {
    const numberInput = document.getElementById('simTargetInput');
    const sliderInput = document.getElementById('simTargetSlider');
    const sliderDisplay = document.getElementById('sliderDisplayVal');
    const productSelect = document.getElementById('simProductSelect');
    const runBtn = document.getElementById('runSimulationBtn');

    // Sync numeric input and slider
    const updateTarget = (val) => {
      val = Math.max(1000, Math.min(10000, Number(val) || 5000));
      if (numberInput) numberInput.value = val;
      if (sliderInput) sliderInput.value = val;
      if (sliderDisplay) sliderDisplay.textContent = `${val.toLocaleString()} units`;

      const prod = productSelect ? productSelect.value : 'Product A';
      this.state.calculateSimulation(val, prod);
      this.renderResults();
    };

    if (numberInput) {
      numberInput.addEventListener('input', (e) => updateTarget(e.target.value));
    }

    if (sliderInput) {
      sliderInput.addEventListener('input', (e) => updateTarget(e.target.value));
    }

    if (productSelect) {
      productSelect.addEventListener('change', (e) => {
        const val = numberInput ? Number(numberInput.value) : 5000;
        updateTarget(val);
      });
    }

    // Run AI Simulation button with brief solving spinner animation
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        const val = numberInput ? Number(numberInput.value) : 5000;
        const prod = productSelect ? productSelect.value : 'Product A';
        
        runBtn.innerHTML = `
          <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
          </svg>
          Solving Schedule...
        `;
        runBtn.disabled = true;

        setTimeout(() => {
          this.state.calculateSimulation(val, prod);
          this.renderResults();
          runBtn.innerHTML = `⚡ Run AI Simulation`;
          runBtn.disabled = false;
          window.showToast(`AI Simulation optimized for ${val.toLocaleString()} units of ${prod}!`, 'success');
        }, 500);
      });
    }

    // Preset chips (e.g. 2,500, 5,000, 7,500, 10,000)
    document.querySelectorAll('.preset-target-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetVal = Number(btn.getAttribute('data-val'));
        updateTarget(targetVal);
      });
    });
  }

  renderResults() {
    const res = this.state.simulation.results;
    if (!res) return;

    // Simulation Result Cards
    const resTargetEl = document.getElementById('resTargetUnits');
    if (resTargetEl) resTargetEl.textContent = `${res.target.toLocaleString()} units`;

    const resTimeEl = document.getElementById('resProductionTime');
    if (resTimeEl) resTimeEl.textContent = res.estimatedTime;

    const resEnergyEl = document.getElementById('resExpectedEnergy');
    if (resEnergyEl) resEnergyEl.textContent = `${res.expectedEnergy.toLocaleString()} kWh`;

    const resCostEl = document.getElementById('resEstimatedCost');
    if (resCostEl) resCostEl.textContent = `₹${res.estimatedCost.toLocaleString()}`;

    const resMachEl = document.getElementById('resMachinesRequired');
    if (resMachEl) resMachEl.textContent = `${res.machinesRequired}`;

    const resEffEl = document.getElementById('resExpectedEfficiency');
    if (resEffEl) resEffEl.textContent = `${res.efficiency}%`;

    // Normal Plan vs AI Optimized Plan Comparison Table
    const tableBody = document.getElementById('simComparisonTableBody');
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td><strong>Energy Consumption</strong></td>
          <td class="tabular-nums">${res.normalEnergy.toLocaleString()} kWh</td>
          <td class="tabular-nums font-bold" style="color:var(--green-primary)">${res.expectedEnergy.toLocaleString()} kWh</td>
          <td><span class="diff-pill diff-negative-good">-${res.energySaved.toLocaleString()} kWh (-${Math.round((res.energySaved / res.normalEnergy) * 100)}%)</span></td>
        </tr>
        <tr>
          <td><strong>Production Time</strong></td>
          <td class="tabular-nums">${res.normalTime}</td>
          <td class="tabular-nums font-bold" style="color:var(--blue-primary)">${res.estimatedTime}</td>
          <td><span class="diff-pill diff-negative-good">35m faster</span></td>
        </tr>
        <tr>
          <td><strong>Energy Cost</strong></td>
          <td class="tabular-nums">₹${res.normalCost.toLocaleString()}</td>
          <td class="tabular-nums font-bold" style="color:var(--green-primary)">₹${res.estimatedCost.toLocaleString()}</td>
          <td><span class="diff-pill diff-negative-good">-₹${res.costSaved.toLocaleString()} saved</span></td>
        </tr>
        <tr>
          <td><strong>Machines Required</strong></td>
          <td class="tabular-nums">${res.normalMachines}</td>
          <td class="tabular-nums font-bold" style="color:var(--blue-primary)">${res.machinesRequired}</td>
          <td><span class="diff-pill diff-negative-good">1 machine idle/saved</span></td>
        </tr>
      `;
    }

    // AI Recommendation text
    const recTextEl = document.getElementById('simRecommendationText');
    if (recTextEl) {
      recTextEl.textContent = `To complete ${res.target.toLocaleString()} units efficiently, AI recommends staggered machine operation and shifting non-critical operations away from the predicted peak-demand period.`;
    }

    // Dynamic Timeline completion time update
    const finalTimelineTime = document.getElementById('timelineFinalTime');
    if (finalTimelineTime) {
      const baseMin = 8 * 60; // 08:00
      const compMin = baseMin + res.timeMinutes;
      const compH = Math.floor(compMin / 60);
      const compM = compMin % 60;
      finalTimelineTime.textContent = `${compH.toString().padStart(2, '0')}:${compM.toString().padStart(2, '0')}`;
    }

    // Savings Summary
    const saveEnergyEl = document.getElementById('sumEnergySaved');
    if (saveEnergyEl) saveEnergyEl.textContent = `${res.energySaved.toLocaleString()} kWh`;

    const saveCostEl = document.getElementById('sumCostSaved');
    if (saveCostEl) saveCostEl.textContent = `₹${res.costSaved.toLocaleString()}`;

    const saveCarbonEl = document.getElementById('sumCarbonSaved');
    if (saveCarbonEl) saveCarbonEl.textContent = `${(res.carbonSavedKg || Math.round(res.energySaved * 0.71 * 10) / 10).toFixed(1)} kg`;

    const savePeakEl = document.getElementById('sumPeakReduction');
    if (savePeakEl) savePeakEl.textContent = res.peakReduction;
  }
}

window.simulationPage = new SimulationPage();

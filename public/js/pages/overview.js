/**
 * ENEROPT AI — Page 1: Energy Overview Controller
 */

class OverviewPage {
  constructor() {
    this.state = window.enerOptState;
  }

  init() {
    this.renderKPIs();
    this.renderHistory();
    this.renderESG();
    this.bindEvents();
    this.setupLiveSubscription();
  }

  renderKPIs() {
    const kpis = this.state.kpis;

    // Current Power: 1,284 kW
    const currentPowerEl = document.getElementById('kpiCurrentPower');
    if (currentPowerEl) currentPowerEl.textContent = kpis.currentPower.toLocaleString();

    // Predicted Demand: 1,420 kW
    const predictedDemandEl = document.getElementById('kpiPredictedDemand');
    if (predictedDemandEl) predictedDemandEl.textContent = kpis.predictedDemand.toLocaleString();

    // Today's Consumption: 18,640 kWh
    const todayConsumptionEl = document.getElementById('kpiTodayConsumption');
    if (todayConsumptionEl) todayConsumptionEl.textContent = kpis.todayConsumption.toLocaleString();

    // Energy Cost: ₹1,46,820
    const todayCostEl = document.getElementById('kpiTodayCost');
    if (todayCostEl) todayCostEl.textContent = `₹${kpis.todayCost.toLocaleString()}`;
  }

  renderESG() {
    const esg = this.state.esg;
    if (!esg) return;

    const solarBar = document.getElementById('esgSolarBar');
    const gridBar = document.getElementById('esgGridBar');
    const solarText = document.getElementById('esgSolarText');
    const gridText = document.getElementById('esgGridText');
    const todayEmissions = document.getElementById('esgTodayEmissions');
    const carbonBadge = document.getElementById('esgCarbonSavedBadge');

    if (solarBar) {
      solarBar.style.width = `${esg.energyMix.solarPercent}%`;
      solarBar.title = `Rooftop Solar PV: ${esg.energyMix.solarPercent}%`;
    }
    if (gridBar) {
      gridBar.style.width = `${esg.energyMix.gridPercent}%`;
      gridBar.title = `Grid Power: ${esg.energyMix.gridPercent}%`;
    }
    if (solarText) {
      solarText.textContent = `Solar PV: ${esg.energyMix.solarPercent}% (${esg.energyMix.solarKw.toLocaleString()} kW)`;
    }
    if (gridText) {
      gridText.textContent = `Grid: ${esg.energyMix.gridPercent}% (${esg.energyMix.gridKw.toLocaleString()} kW)`;
    }
    if (todayEmissions) {
      todayEmissions.textContent = `${esg.todayScope2Tons} tCO₂e (${esg.gridEmissionFactor} kg/kWh)`;
    }
    if (carbonBadge) {
      carbonBadge.textContent = `🌱 ${esg.carbonSavedTodayKg.toLocaleString()} kg CO₂ Avoided`;
    }
  }

  setupLiveSubscription() {
    this.state.subscribe((event, payload) => {
      if (event === 'TELEMETRY_TICK') {
        this.renderKPIs();
        this.renderESG();
      }
    });
  }

  renderHistory() {
    const hist = this.state.history;
    const historyContainer = document.getElementById('energyHistoryGrid');
    if (!historyContainer) return;

    historyContainer.innerHTML = `
      <div class="history-card-item">
        <span class="history-item-label">Today</span>
        <span class="history-item-value tabular-nums">${hist.today.kwh.toLocaleString()} <span style="font-size:0.75rem;font-weight:600;color:var(--text-muted)">kWh</span></span>
        <span class="history-item-delta" style="color:var(--amber-primary)">
          ▲ ${hist.today.change} vs yesterday
        </span>
      </div>

      <div class="history-card-item">
        <span class="history-item-label">Yesterday</span>
        <span class="history-item-value tabular-nums">${hist.yesterday.kwh.toLocaleString()} <span style="font-size:0.75rem;font-weight:600;color:var(--text-muted)">kWh</span></span>
        <span class="history-item-delta" style="color:var(--green-primary)">
          ▼ ${hist.yesterday.change} vs baseline
        </span>
      </div>

      <div class="history-card-item">
        <span class="history-item-label">This Week</span>
        <span class="history-item-value tabular-nums">${hist.thisWeek.kwh.toLocaleString()} <span style="font-size:0.75rem;font-weight:600;color:var(--text-muted)">kWh</span></span>
        <span class="history-item-delta" style="color:var(--amber-primary)">
          ▲ ${hist.thisWeek.change} vs target
        </span>
      </div>

      <div class="history-card-item">
        <span class="history-item-label">Last Week</span>
        <span class="history-item-value tabular-nums">${hist.lastWeek.kwh.toLocaleString()} <span style="font-size:0.75rem;font-weight:600;color:var(--text-muted)">kWh</span></span>
        <span class="history-item-delta" style="color:var(--green-primary)">
          ✓ On track
        </span>
      </div>
    `;
  }

  bindEvents() {
    // Time selector buttons (24 Hours, 7 Days, 30 Days)
    const tabs = document.querySelectorAll('.time-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const range = tab.getAttribute('data-range') || '24h';
        if (window.energyCharts) {
          window.energyCharts.setTimeRange(range);
        }
      });
    });

    // View Optimization button on AI insight card
    const viewOptBtn = document.getElementById('viewOptimizationBtn');
    if (viewOptBtn) {
      viewOptBtn.addEventListener('click', () => {
        window.appRouter.navigateTo('optimization');
      });
    }
  }
}

window.overviewPage = new OverviewPage();

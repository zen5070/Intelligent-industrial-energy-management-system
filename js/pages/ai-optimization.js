/**
 * ENEROPT AI — Page 3: AI Optimization Controller
 */

class AiOptimizationPage {
  constructor() {
    this.state = window.enerOptState;
  }

  init() {
    this.renderBeforeAfter();
    this.renderActionsList();
    this.setupActionModal();
  }

  renderBeforeAfter() {
    const plans = this.state.optimizationState.plans;

    // Current Plan
    const curEnergyEl = document.getElementById('curPlanEnergy');
    if (curEnergyEl) curEnergyEl.textContent = `${plans.current.energy.toLocaleString()} kWh`;

    const curCostEl = document.getElementById('curPlanCost');
    if (curCostEl) curCostEl.textContent = `₹${plans.current.cost.toLocaleString()}`;

    const curTimeEl = document.getElementById('curPlanTime');
    if (curTimeEl) curTimeEl.textContent = plans.current.productionTime;

    const curMachEl = document.getElementById('curPlanMachines');
    if (curMachEl) curMachEl.textContent = `${plans.current.machines} active`;

    // AI Optimized Plan
    const optEnergyEl = document.getElementById('optPlanEnergy');
    if (optEnergyEl) optEnergyEl.textContent = `${plans.optimized.energy.toLocaleString()} kWh`;

    const optCostEl = document.getElementById('optPlanCost');
    if (optCostEl) optCostEl.textContent = `₹${plans.optimized.cost.toLocaleString()}`;

    const optTimeEl = document.getElementById('optPlanTime');
    if (optTimeEl) optTimeEl.textContent = plans.optimized.productionTime;

    const optMachEl = document.getElementById('optPlanMachines');
    if (optMachEl) optMachEl.textContent = `${plans.optimized.machines} active`;
  }

  renderActionsList() {
    const container = document.getElementById('optimizationActionsList');
    if (!container) return;

    const actions = this.state.optimizationState.actions;

    container.innerHTML = actions.map(act => {
      const isApplied = act.applied;
      return `
        <div class="action-card" id="action-card-${act.id}">
          <div class="action-left">
            <span class="action-machine-badge">${act.machine}</span>
            <div class="action-info-block">
              <div class="action-headline">
                <strong>Action:</strong> ${act.actionTitle}
              </div>
              <div class="action-reason">
                <strong>Reason:</strong> ${act.reason}
              </div>
              <div class="action-result">
                <span>✓ Expected result:</span> ${act.expectedResult}
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:0.75rem;">
            <span class="badge ${isApplied ? 'badge-normal' : 'badge-info'}">
              ${isApplied ? '🟢 Applied' : '⚡ AI Recommended'}
            </span>
            <button class="btn btn-secondary btn-sm view-action-btn" data-id="${act.id}">
              Review Schedule →
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind action details click
    container.querySelectorAll('.view-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        this.openActionModal(id);
      });
    });
  }

  setupActionModal() {
    const backdrop = document.getElementById('actionModalBackdrop');
    const modal = document.getElementById('actionModalPanel');
    const closeBtn = document.getElementById('closeActionModalBtn');

    const close = () => {
      if (backdrop) backdrop.classList.remove('open');
      if (modal) modal.classList.remove('open');
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    // Accept Plan Button
    const acceptBtn = document.getElementById('acceptActionPlanBtn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        const act = this.state.selectedAction;
        if (act) {
          this.state.acceptAction(act.id);
          window.showToast(`Optimized schedule accepted for ${act.machine}! Dispatching to MES.`, 'success');
          this.renderActionsList();
          close();
        }
      });
    }

    // Simulate Button
    const simBtn = document.getElementById('simulateActionBtn');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        const act = this.state.selectedAction;
        window.showToast(`Simulation calculated: ${act.energyReduction} saved with 0% throughput impact.`, 'info');
      });
    }
  }

  openActionModal(actionId) {
    this.state.selectAction(actionId);
    const act = this.state.selectedAction;
    if (!act) return;

    // Fill Modal Data
    const titleEl = document.getElementById('modalActionMachineName');
    if (titleEl) titleEl.textContent = `${act.machine} — Optimization Detail`;

    const curSchedEl = document.getElementById('modalCurrentSchedule');
    if (curSchedEl) curSchedEl.textContent = act.currentSchedule;

    const optSchedEl = document.getElementById('modalOptimizedSchedule');
    if (optSchedEl) optSchedEl.textContent = act.recommendedSchedule;

    const reasonEl = document.getElementById('modalActionReason');
    if (reasonEl) reasonEl.textContent = act.reason;

    const energyEl = document.getElementById('modalEnergyReduction');
    if (energyEl) energyEl.textContent = act.energyReduction;

    const costEl = document.getElementById('modalCostReduction');
    if (costEl) costEl.textContent = act.costReduction;

    const impactEl = document.getElementById('modalProductionImpact');
    if (impactEl) impactEl.textContent = act.productionImpact;

    const confEl = document.getElementById('modalConfidence');
    if (confEl) confEl.textContent = act.confidence;

    // Open Modal
    const backdrop = document.getElementById('actionModalBackdrop');
    const modal = document.getElementById('actionModalPanel');
    if (backdrop) backdrop.classList.add('open');
    if (modal) modal.classList.add('open');
  }
}

window.aiOptimizationPage = new AiOptimizationPage();

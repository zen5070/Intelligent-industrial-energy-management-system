/**
 * ENEROPT AI — Page 2: Machine Monitor Controller
 */

class MachineMonitorPage {
  constructor() {
    this.state = window.enerOptState;
    this.activeFilter = 'all';
    this.searchQuery = '';
  }

  init() {
    this.renderTable();
    this.bindEvents();
    this.setupDrawer();
    this.setupLiveSubscription();
  }

  setupLiveSubscription() {
    this.state.subscribe((event, payload) => {
      if (event === 'TELEMETRY_TICK') {
        const cnc = this.state.machines.find(m => m.id === 'CNC-02');
        if (!cnc) return;

        // Update table row if rendered
        const cncRow = document.querySelector('tr[data-id="CNC-02"]');
        if (cncRow) {
          const pwrCell = cncRow.querySelector('td:nth-child(2) strong');
          if (pwrCell) pwrCell.textContent = `${cnc.currentPower} kW`;
        }

        // If drawer is open and viewing CNC-02, update drawer values
        const panel = document.getElementById('machineDrawerPanel');
        if (panel && panel.classList.contains('open') && this.state.selectedMachine?.id === 'CNC-02') {
          const powerEl = document.getElementById('drawerCurrentPower');
          if (powerEl) powerEl.textContent = `${cnc.currentPower} kW`;
          const vibEl = document.getElementById('drawerVibration');
          if (vibEl) vibEl.textContent = `${cnc.vibration} mm/s`;
        }
      }
    });
  }

  renderTable() {
    const tbody = document.getElementById('machineTableBody');
    if (!tbody) return;

    const filtered = this.state.machines.filter(m => {
      // Filter by status pill
      if (this.activeFilter !== 'all' && m.status.toLowerCase() !== this.activeFilter.toLowerCase()) {
        return false;
      }
      // Filter by search query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        return m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.alert.toLowerCase().includes(q);
      }
      return true;
    });

    tbody.innerHTML = filtered.map(m => {
      const isAbnormal = m.status === 'Abnormal';
      const isWarning = m.status === 'Warning';
      const statusBadgeClass = isAbnormal ? 'badge-abnormal' : (isWarning ? 'badge-warning' : 'badge-normal');
      const statusDot = isAbnormal ? '🔴' : (isWarning ? '🟡' : '🟢');
      
      const diffClass = m.diff > 0 
        ? (m.diff > 10 ? 'diff-positive-bad' : 'diff-neutral') 
        : 'diff-negative-good';
      const diffSign = m.diff > 0 ? `+${m.diff}%` : `${m.diff}%`;

      const loadClass = m.load > 85 ? (m.diff > 15 ? 'high' : 'medium') : '';

      return `
        <tr data-id="${m.id}" class="${isAbnormal ? 'highlight-abnormal' : ''}">
          <td>
            <div class="machine-name-cell">
              <span class="machine-code-badge">${m.id}</span>
              <span>${m.name}</span>
            </div>
          </td>
          <td class="tabular-nums font-semibold"><strong>${m.currentPower} kW</strong></td>
          <td class="tabular-nums text-muted">${m.normalPower} kW</td>
          <td>
            <span class="diff-pill ${diffClass}">${diffSign}</span>
          </td>
          <td class="tabular-nums">
            <span style="${m.temperature > 65 ? 'color:var(--red-primary);font-weight:700;' : ''}">${m.temperature}°C</span>
          </td>
          <td>
            <div class="load-bar-wrapper">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill ${loadClass}" style="width: ${m.load}%"></div>
              </div>
              <span class="tabular-nums text-sm font-semibold">${m.load}%</span>
            </div>
          </td>
          <td>
            <span class="badge ${statusBadgeClass}">
              <span>${statusDot}</span> ${m.status}
            </span>
          </td>
          <td>
            <span class="text-sm" style="${isAbnormal ? 'color:var(--red-primary);font-weight:600;' : (isWarning ? 'color:var(--amber-primary);font-weight:600;' : 'color:var(--text-muted);')}">
              ${m.alert}
            </span>
          </td>
          <td style="text-align:right">
            <button class="btn btn-secondary btn-sm inspect-btn" data-id="${m.id}">
              Inspect →
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Re-bind row click listeners
    tbody.querySelectorAll('tr').forEach(row => {
      row.addEventListener('click', (e) => {
        const id = row.getAttribute('data-id');
        this.openDrawer(id);
      });
    });
  }

  bindEvents() {
    // Filter Pills
    const filterBtns = document.querySelectorAll('.filter-pill-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.getAttribute('data-filter') || 'all';
        this.renderTable();
      });
    });

    // Search Input
    const searchInput = document.getElementById('machineSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderTable();
      });
    }
  }

  setupDrawer() {
    const backdrop = document.getElementById('machineDrawerBackdrop');
    const panel = document.getElementById('machineDrawerPanel');
    const closeBtn = document.getElementById('closeMachineDrawerBtn');

    const close = () => {
      backdrop.classList.remove('open');
      panel.classList.remove('open');
    };

    if (closeBtn) closeBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    // Button: Analyze Machine
    const analyzeBtn = document.getElementById('drawerAnalyzeBtn');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => {
        const m = this.state.selectedMachine;
        window.showToast(`AI diagnostic completed for ${m.id}: Spindle thermal stress confirmed.`, 'warning');
      });
    }

    // Button: Optimize Machine
    const optimizeBtn = document.getElementById('drawerOptimizeBtn');
    if (optimizeBtn) {
      optimizeBtn.addEventListener('click', () => {
        close();
        window.appRouter.navigateTo('optimization');
        // highlight CNC-02 action
        setTimeout(() => {
          const cncAction = document.getElementById('action-card-act-1');
          if (cncAction) {
            cncAction.scrollIntoView({ behavior: 'smooth' });
            cncAction.style.borderColor = 'var(--blue-primary)';
            cncAction.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.2)';
            setTimeout(() => {
              cncAction.style.borderColor = '';
              cncAction.style.boxShadow = '';
            }, 2500);
          }
        }, 150);
      });
    }
  }

  openDrawer(machineId) {
    this.state.selectMachine(machineId);
    const m = this.state.selectedMachine;
    if (!m) return;

    // Fill Drawer Content
    const titleEl = document.getElementById('drawerMachineTitle');
    if (titleEl) titleEl.textContent = `${m.id} — ${m.name}`;

    const powerEl = document.getElementById('drawerCurrentPower');
    if (powerEl) powerEl.textContent = `${m.currentPower} kW`;

    const normalPowerEl = document.getElementById('drawerNormalPower');
    if (normalPowerEl) normalPowerEl.textContent = `${m.normalPower} kW`;

    const excessEl = document.getElementById('drawerExcess');
    if (excessEl) {
      const sign = m.diff > 0 ? `+${m.diff}%` : `${m.diff}%`;
      excessEl.textContent = sign;
      excessEl.style.color = m.diff > 10 ? 'var(--red-primary)' : 'var(--green-primary)';
    }

    const tempEl = document.getElementById('drawerTemperature');
    if (tempEl) tempEl.textContent = `${m.temperature}°C`;

    const normalTempEl = document.getElementById('drawerNormalTemp');
    if (normalTempEl) normalTempEl.textContent = `${m.normalTemp}°C`;

    const loadEl = document.getElementById('drawerProductionLoad');
    if (loadEl) loadEl.textContent = `${m.load}%`;

    // AI Detection Box
    const detectionBox = document.getElementById('drawerAiDetection');
    if (detectionBox) {
      if (m.diff > 10) {
        detectionBox.style.display = 'block';
        detectionBox.className = 'ai-detection-box';
        document.getElementById('drawerDetectionTitle').innerHTML = `⚠ Abnormal energy consumption detected`;
        document.getElementById('drawerDetectionDesc').innerHTML = `<strong>${m.id}</strong> is consuming significantly more energy than its normal operating range while production output remains nearly unchanged.`;
      } else {
        detectionBox.style.display = 'block';
        detectionBox.className = 'ai-detection-box';
        detectionBox.style.background = 'var(--green-light)';
        detectionBox.style.borderColor = 'var(--green-border)';
        document.getElementById('drawerDetectionTitle').innerHTML = `🟢 Operating Within Normal Range`;
        document.getElementById('drawerDetectionTitle').style.color = 'var(--green-primary)';
        document.getElementById('drawerDetectionDesc').innerHTML = `${m.id} telemetry matches trained energy baselines with zero anomalous deviations.`;
      }
    }

    // Multivariate Sensor Diagnostics
    const pfEl = document.getElementById('drawerPowerFactor');
    const pfStatusEl = document.getElementById('drawerPowerFactorStatus');
    if (pfEl) pfEl.textContent = m.pf !== undefined ? m.pf : '0.96';
    if (pfStatusEl) {
      if (m.pf < 0.85) {
        pfStatusEl.textContent = 'Degraded (Capacitor)';
        pfStatusEl.style.color = 'var(--amber-primary)';
      } else {
        pfStatusEl.textContent = 'Nominal (> 0.95)';
        pfStatusEl.style.color = 'var(--green-primary)';
      }
    }

    const vibEl = document.getElementById('drawerVibration');
    const vibStatusEl = document.getElementById('drawerVibrationStatus');
    if (vibEl) vibEl.textContent = `${m.vibration !== undefined ? m.vibration : 1.0} mm/s`;
    if (vibStatusEl) {
      if (m.vibration > 3.0) {
        vibStatusEl.textContent = 'Harmonic Stress';
        vibStatusEl.style.color = 'var(--red-primary)';
      } else if (m.vibration > 1.8) {
        vibStatusEl.textContent = 'Elevated Noise';
        vibStatusEl.style.color = 'var(--amber-primary)';
      } else {
        vibStatusEl.textContent = 'Normal (< 1.5)';
        vibStatusEl.style.color = 'var(--green-primary)';
      }
    }

    const bhEl = document.getElementById('drawerBearingHealth');
    const bhStatusEl = document.getElementById('drawerBearingHealthStatus');
    if (bhEl) bhEl.textContent = `${m.bearingHealth !== undefined ? m.bearingHealth : 95}%`;
    if (bhStatusEl) {
      if (m.bearingHealth < 70) {
        bhStatusEl.textContent = 'Fair (Wear Alert)';
        bhStatusEl.style.color = 'var(--amber-primary)';
      } else {
        bhStatusEl.textContent = 'Healthy Condition';
        bhStatusEl.style.color = 'var(--green-primary)';
      }
    }

    // Open drawer
    const backdrop = document.getElementById('machineDrawerBackdrop');
    const panel = document.getElementById('machineDrawerPanel');
    backdrop.classList.add('open');
    panel.classList.add('open');

    // Render trend chart in drawer
    setTimeout(() => {
      if (window.energyCharts) {
        window.energyCharts.renderMachineDetailChart(m);
      }
    }, 50);
  }
}

window.machineMonitorPage = new MachineMonitorPage();

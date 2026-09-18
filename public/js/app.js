/**
 * ENEROPT AI — Core Application Bootstrap & Navigation Router
 */

class AppRouter {
  constructor() {
    this.currentRoute = 'overview';
    this.breadcrumbsMap = {
      overview: { root: 'Factory Overview', current: 'Energy & Demand Performance' },
      machines: { root: 'Telemetry & Assets', current: 'Machine Energy Monitor' },
      optimization: { root: 'Intelligence Engine', current: 'Smart AI Optimization' },
      simulation: { root: 'Planning & What-If', current: 'Production Simulation' }
    };
  }

  init() {
    this.bindNavigation();
    this.bindTopBarWidgets();
    this.startClockSync();

    // Default route
    this.navigateTo('overview');
  }

  bindNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.getAttribute('data-view');
        if (route) {
          this.navigateTo(route);
        }
      });
    });
  }

  navigateTo(route) {
    this.currentRoute = route;

    // Update active nav button
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      if (item.getAttribute('data-view') === route) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Toggle view visibility
    document.querySelectorAll('.page-view').forEach(view => {
      if (view.id === `view-${route}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Update Breadcrumbs
    const bMeta = this.breadcrumbsMap[route] || { root: 'Factory', current: route };
    const bRoot = document.getElementById('breadcrumbRoot');
    const bCurrent = document.getElementById('breadcrumbCurrent');
    if (bRoot) bRoot.textContent = bMeta.root;
    if (bCurrent) bCurrent.textContent = bMeta.current;

    // Update state & notify
    window.enerOptState.setView(route);

    // Trigger chart resize / re-render if navigating to overview
    if (route === 'overview' && window.energyCharts) {
      setTimeout(() => window.energyCharts.renderMainChart(), 50);
    }
  }

  bindTopBarWidgets() {
    // Notification Bell Toggle
    const notifBtn = document.getElementById('notificationBtn');
    const notifDropdown = document.getElementById('notificationDropdown');
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = notifDropdown.style.display === 'block';
        notifDropdown.style.display = isOpen ? 'none' : 'block';
      });

      document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
          notifDropdown.style.display = 'none';
        }
      });
    }

    // Plant Selector Click
    const plantSelector = document.querySelector('.plant-selector-wrapper');
    if (plantSelector) {
      plantSelector.addEventListener('click', () => {
        window.showToast('Connected: Plant #4 — Chennai Precision Machining Hub (8/8 online)', 'info');
      });
    }

    // Settings Link
    const settingsBtn = document.getElementById('sidebarSettingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        window.showToast('EnerOpt Settings: Baseline tariffs, MQTT brokers, and model hyperparameters configured.', 'info');
      });
    }

    // Help Link
    const helpBtn = document.getElementById('sidebarHelpBtn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        window.demoTour.startTour();
      });
    }
  }

  startClockSync() {
    const clockEl = document.getElementById('telemetryLiveClock');
    const updateTime = () => {
      if (!clockEl) return;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      clockEl.textContent = timeStr;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }
}

// Global Toast System
window.showToast = function(message, type = 'info') {
  let container = document.getElementById('appToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'appToastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'warning') icon = '⚠️';
  if (type === 'critical') icon = '🚨';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// Application Bootstrap on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.appRouter = new AppRouter();
  window.appRouter.init();

  // Initialize Page Controllers
  window.overviewPage.init();
  window.machineMonitorPage.init();
  window.aiOptimizationPage.init();
  window.simulationPage.init();
  window.energyCharts.init();
  window.energyAiAssistant.init();
  window.demoTour.init();

  console.log('⚡ ENEROPT AI Platform initialized successfully.');
});

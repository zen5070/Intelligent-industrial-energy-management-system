/**
 * ENEROPT AI — Guided Hackathon Jury Tour
 * Implements the 6-Step Demonstration Narrative:
 * 1. MONITOR -> 2. DETECT -> 3. PREDICT -> 4. SIMULATE -> 5. OPTIMIZE -> 6. EXPLAIN
 */

class DemoTour {
  constructor() {
    this.currentStep = 0;
    this.steps = [
      {
        id: 1,
        title: 'Step 1: MONITOR',
        description: 'Real-time telemetry continuously tracks 1,284 kW factory power, 18,640 kWh daily consumption, and sub-metered equipment across Plant #4.',
        targetView: 'overview',
        action: () => {
          window.appRouter.navigateTo('overview');
          window.showToast('Step 1: Monitoring Plant #4 baseline & telemetry', 'info');
        }
      },
      {
        id: 2,
        title: 'Step 2: DETECT',
        description: 'AI detects abnormal energy behavior on CNC-02 (+20.6% excess draw, 71°C thermal stress) while production output remains unchanged.',
        targetView: 'machines',
        action: () => {
          window.appRouter.navigateTo('machines');
          setTimeout(() => {
            window.machineMonitorPage.openDrawer('CNC-02');
            window.showToast('Step 2: AI detected abnormal consumption on CNC-02', 'warning');
          }, 200);
        }
      },
      {
        id: 3,
        title: 'Step 3: PREDICT',
        description: 'LSTM neural load forecast predicts a 12% peak demand surge to 1,420 kW between 2:00 PM and 4:00 PM.',
        targetView: 'overview',
        action: () => {
          // close drawer if open
          document.getElementById('machineDrawerBackdrop')?.classList.remove('open');
          document.getElementById('machineDrawerPanel')?.classList.remove('open');
          window.appRouter.navigateTo('overview');
          setTimeout(() => {
            const chartCard = document.querySelector('.chart-card');
            if (chartCard) chartCard.scrollIntoView({ behavior: 'smooth' });
            window.showToast('Step 3: AI predicted peak demand surge of 1,420 kW', 'info');
          }, 150);
        }
      },
      {
        id: 4,
        title: 'Step 4: SIMULATE',
        description: 'Production manager enters a target of 5,000 units. The What-If engine dynamically calculates time, energy, cost, and machine requirements.',
        targetView: 'simulation',
        action: () => {
          window.appRouter.navigateTo('simulation');
          setTimeout(() => {
            const inputCard = document.querySelector('.simulation-input-card');
            if (inputCard) inputCard.scrollIntoView({ behavior: 'smooth' });
            window.showToast('Step 4: Production Simulation for 5,000 units calculated', 'info');
          }, 150);
        }
      },
      {
        id: 5,
        title: 'Step 5: OPTIMIZE',
        description: 'AI generates an optimized machine schedule saving 940 kWh and ₹7,400 by shifting CNC-02 and reducing idle time.',
        targetView: 'optimization',
        action: () => {
          window.appRouter.navigateTo('optimization');
          setTimeout(() => {
            window.showToast('Step 5: Optimized schedule ready (saves 940 kWh & ₹7,400)', 'success');
          }, 150);
        }
      },
      {
        id: 6,
        title: 'Step 6: EXPLAIN',
        description: 'Ask Me AI explains the decision: why CNC-02 was shifted, how peak charges are avoided, and confirms the 8h 35m target.',
        targetView: 'simulation',
        action: () => {
          window.energyAiAssistant.toggleChat(true);
          setTimeout(() => {
            window.energyAiAssistant.handleUserQuery('Can I produce 5,000 units today?');
            window.showToast('Step 6: Ask Me AI Copilot explains the optimization!', 'info');
          }, 300);
        }
      }
    ];
  }

  init() {
    this.tourBtn = document.getElementById('hackathonTourBtn');
    this.tourBar = document.getElementById('hackathonTourBar');
    this.stepTitle = document.getElementById('tourStepTitle');
    this.stepDesc = document.getElementById('tourStepDesc');
    this.prevBtn = document.getElementById('tourPrevBtn');
    this.nextBtn = document.getElementById('tourNextBtn');
    this.closeBtn = document.getElementById('tourCloseBtn');

    if (this.tourBtn) {
      this.tourBtn.addEventListener('click', () => this.startTour());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.goToNext());
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.goToPrev());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.endTour());
    }
  }

  startTour() {
    this.currentStep = 0;
    if (this.tourBar) this.tourBar.style.display = 'flex';
    this.renderCurrentStep();
  }

  endTour() {
    if (this.tourBar) this.tourBar.style.display = 'none';
  }

  goToNext() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.renderCurrentStep();
    } else {
      this.endTour();
      window.showToast('🎯 Tour Complete! EnerOpt AI demonstration finished.', 'success');
    }
  }

  goToPrev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderCurrentStep();
    }
  }

  renderCurrentStep() {
    const step = this.steps[this.currentStep];
    if (!step) return;

    if (this.stepTitle) {
      this.stepTitle.innerHTML = `<strong>${step.title}</strong> <span style="font-size:0.75rem;color:var(--text-muted)">(${this.currentStep + 1} of 6)</span>`;
    }

    if (this.stepDesc) {
      this.stepDesc.textContent = step.description;
    }

    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentStep === 0;
      this.prevBtn.style.opacity = this.currentStep === 0 ? '0.4' : '1';
    }

    if (this.nextBtn) {
      this.nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Finish Tour ✓' : 'Next Step →';
    }

    // Execute step action
    step.action();
  }
}

window.demoTour = new DemoTour();

/**
 * ENEROPT AI — Ask Me AI Assistant (Global Floating Copilot)
 * Context-aware industrial energy chatbot with deterministic reasoning,
 * suggestion chips, interactive shortcuts, and typing animations.
 */

class EnergyAiAssistant {
  constructor() {
    this.state = window.enerOptState;
    this.isOpen = false;
    this.isTyping = false;
    this.messages = [];
  }

  init() {
    this.bindDOM();
    this.initWelcomeMessage();
  }

  bindDOM() {
    this.launcherBtn = document.getElementById('floatingAssistantLauncher');
    this.chatWindow = document.getElementById('chatWindow');
    this.closeBtn = document.getElementById('closeChatBtn');
    this.clearBtn = document.getElementById('clearChatBtn');
    this.messagesList = document.getElementById('chatMessagesContainer');
    this.inputForm = document.getElementById('chatInputForm');
    this.textInput = document.getElementById('chatTextInput');
    this.suggestionsBar = document.getElementById('chatSuggestionsBar');

    // Toggle panel
    if (this.launcherBtn) {
      this.launcherBtn.addEventListener('click', () => this.toggleChat());
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.toggleChat(false));
    }

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.messages = [];
        this.messagesList.innerHTML = '';
        this.initWelcomeMessage();
      });
    }

    // Input submission
    if (this.inputForm) {
      this.inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = this.textInput.value.trim();
        if (!text || this.isTyping) return;
        this.handleUserQuery(text);
        this.textInput.value = '';
      });
    }

    // Suggestion chips
    const suggestions = [
      'How much energy are we using?',
      'Which machine is abnormal?',
      'What is our carbon footprint?',
      'Dispatch schedule to MES',
      'What is CNC-02 vibration health?',
      'Can we meet today\'s target?',
      'How can I save energy?',
      'Explain today\'s forecast',
      'What happens if I increase production to 8,000 units?'
    ];

    if (this.suggestionsBar) {
      this.suggestionsBar.innerHTML = suggestions.map(s => `
        <button class="suggestion-chip" data-query="${s}">${s}</button>
      `).join('');

      this.suggestionsBar.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const query = chip.getAttribute('data-query');
          this.handleUserQuery(query);
        });
      });
    }
  }

  toggleChat(forceState) {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    if (this.chatWindow) {
      if (this.isOpen) {
        this.chatWindow.classList.add('open');
        setTimeout(() => this.textInput?.focus(), 150);
      } else {
        this.chatWindow.classList.remove('open');
      }
    }
  }

  initWelcomeMessage() {
    this.addBotMessage(
      `Hello Rajesh! I am your **EnerOpt AI Copilot**. I am continuously monitoring Plant #4 telemetry, machine power baselines, and predictive demand forecasts.\n\nAsk me anything about current energy use, CNC-02 abnormalities, production targets, or optimized machine schedules.`,
      [
        { label: 'View Abnormal Machine', action: () => window.appRouter.navigateTo('machines') },
        { label: 'Run Production Simulation', action: () => window.appRouter.navigateTo('simulation') }
      ]
    );
  }

  addUserMessage(text) {
    const msgObj = { sender: 'user', text, time: new Date() };
    this.messages.push(msgObj);

    const msgHtml = `
      <div class="message-row user-msg">
        <div class="user-avatar-tiny">RS</div>
        <div class="message-bubble">${this.escapeHTML(text)}</div>
      </div>
    `;
    this.messagesList.insertAdjacentHTML('beforeend', msgHtml);
    this.scrollToBottom();
  }

  addBotMessage(markdownText, actionButtons = []) {
    const msgObj = { sender: 'bot', text: markdownText, actionButtons, time: new Date() };
    this.messages.push(msgObj);

    const formattedBody = this.formatMarkdown(markdownText);
    const actionsId = `chat-actions-${Date.now()}`;

    let actionsHtml = '';
    if (actionButtons && actionButtons.length > 0) {
      actionsHtml = `
        <div class="chat-action-pills" id="${actionsId}">
          ${actionButtons.map((btn, idx) => `
            <button class="chat-action-pill" data-idx="${idx}">${btn.label}</button>
          `).join('')}
        </div>
      `;
    }

    const msgHtml = `
      <div class="message-row bot-msg">
        <div class="bot-avatar-tiny">🤖</div>
        <div class="message-bubble">
          <div>${formattedBody}</div>
          ${actionsHtml}
        </div>
      </div>
    `;

    this.messagesList.insertAdjacentHTML('beforeend', msgHtml);

    // Bind action buttons
    if (actionButtons && actionButtons.length > 0) {
      const pillWrap = document.getElementById(actionsId);
      if (pillWrap) {
        pillWrap.querySelectorAll('.chat-action-pill').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = Number(btn.getAttribute('data-idx'));
            if (actionButtons[idx]?.action) {
              actionButtons[idx].action();
            }
          });
        });
      }
    }

    this.scrollToBottom();
  }

  showTyping() {
    this.isTyping = true;
    const typingHtml = `
      <div class="message-row bot-msg" id="chatTypingIndicator">
        <div class="bot-avatar-tiny">🤖</div>
        <div class="typing-indicator-row">
          <span>AI analyzing plant telemetry</span>
          <div class="typing-dots">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      </div>
    `;
    this.messagesList.insertAdjacentHTML('beforeend', typingHtml);
    this.scrollToBottom();
  }

  hideTyping() {
    this.isTyping = false;
    const typingEl = document.getElementById('chatTypingIndicator');
    if (typingEl) typingEl.remove();
  }

  scrollToBottom() {
    if (this.messagesList) {
      this.messagesList.scrollTop = this.messagesList.scrollHeight;
    }
  }

  /**
   * State-aware natural language query processor.
   * Leverages live state values (simulation targets, abnormal machines, forecast peaks).
   */
  handleUserQuery(query) {
    this.addUserMessage(query);
    this.showTyping();

    const q = query.toLowerCase();
    const sim = this.state.simulation.results;
    const kpis = this.state.kpis;
    const machines = this.state.machines;
    const abnormal = machines.find(m => m.id === 'CNC-02');

    // Simulate realistic typing delay of 450ms
    setTimeout(() => {
      this.hideTyping();

      let answer = '';
      let actions = [];

      if (q.includes('how much energy') || q.includes('energy are we using') || q.includes('current power')) {
        answer = `Factory power is currently running at **${kpis.currentPower.toLocaleString()} kW** (Normal status). Today's cumulative energy consumption is **${kpis.todayConsumption.toLocaleString()} kWh**, which is +3.8% compared to yesterday. Estimated cost so far is **₹${kpis.todayCost.toLocaleString()}**.`;
        actions = [
          { label: 'View Power Graph', action: () => window.appRouter.navigateTo('overview') },
          { label: 'Check Forecast', action: () => window.appRouter.navigateTo('overview') }
        ];
      } 
      else if (q.includes('abnormal') || q.includes('wasting') || q.includes('cnc-02') || q.includes('spike')) {
        answer = `**CNC-02** currently shows the largest abnormal deviation from its baseline power profile at **+${abnormal.diff}%** (operating at **${abnormal.currentPower} kW** vs **${abnormal.normalPower} kW** normal) with thermal temperature elevated to **${abnormal.temperature}°C**.\n\nAI diagnostic suggests spindle friction stress during heavy passes. I recommend inspecting CNC-02 or applying the AI schedule shift.`;
        actions = [
          { label: 'Inspect CNC-02', action: () => { window.appRouter.navigateTo('machines'); window.machineMonitorPage.openDrawer('CNC-02'); } },
          { label: 'View Optimization', action: () => window.appRouter.navigateTo('optimization') }
        ];
      }
      else if (q.includes('8,000') || q.includes('8000')) {
        // User asked what happens if they increase to 8,000 units
        const sim8k = this.state.calculateSimulation(8000);
        answer = `For a simulated target of **8,000 units**:\n• **Estimated Time**: ${sim8k.estimatedTime}\n• **Expected Energy**: ${sim8k.expectedEnergy.toLocaleString()} kWh (saves ${sim8k.energySaved.toLocaleString()} kWh vs unoptimized)\n• **Energy Cost**: ₹${sim8k.estimatedCost.toLocaleString()} (saves ₹${sim8k.costSaved.toLocaleString()})\n• **Machines Required**: ${sim8k.machinesRequired} active machines.\n\nWould you like me to set the Production Simulation to 8,000 units?`;
        actions = [
          { label: 'Open 8,000 Unit Simulation', action: () => { window.appRouter.navigateTo('simulation'); window.simulationPage.renderResults(); } }
        ];
      }
      else if (q.includes('target') || q.includes('produce') || q.includes('5,000') || q.includes('5000') || q.includes('can we meet')) {
        answer = `Based on current machine availability and the production schedule, your target of **${sim.target.toLocaleString()} units** can be completed in approximately **${sim.estimatedTime}** with an estimated energy consumption of **${sim.expectedEnergy.toLocaleString()} kWh** (cost: **₹${sim.estimatedCost.toLocaleString()}**).\n\nAI recommends staggered operation and shifting CNC-02 operation away from the predicted 14:00 - 15:00 peak period.`;
        actions = [
          { label: 'Go to Simulation Tab', action: () => window.appRouter.navigateTo('simulation') },
          { label: 'View Recommended Timeline', action: () => window.appRouter.navigateTo('simulation') }
        ];
      }
      else if (q.includes('save') || q.includes('saving') || q.includes('reduce energy')) {
        answer = `Applying the AI Optimization Engine delivers:\n• **${sim.energySaved.toLocaleString()} kWh** direct energy reduction\n• **₹${sim.costSaved.toLocaleString()}** cost savings\n• **${sim.peakReduction}** peak demand reduction\n• **35 minutes** shorter production cycle time.\n\nKey actions: 15-minute staggered start for CNC-02, automated sleep for Press-02 idle standby, and pre-cooling adjustments for HVAC-01.`;
        actions = [
          { label: 'Review Optimization Plan', action: () => window.appRouter.navigateTo('optimization') },
          { label: 'Accept Plan Now', action: () => { window.aiOptimizationPage.openActionModal('act-1'); } }
        ];
      }
      else if (q.includes('forecast') || q.includes('predict') || q.includes('demand peak')) {
        answer = `AI neural forecast predicts factory demand will climb from **1,284 kW** to a peak of **1,420 kW (+10.6%)** between **2:00 PM and 4:00 PM** due to overlapping heating cycles and shift ramp-up.\n\nForecast accuracy is running at **94.2%**. Shifting CNC-02 and HVAC-01 non-critical loads outside this window completely avoids peak demand tariff penalties.`;
        actions = [
          { label: 'Inspect Forecast Chart', action: () => window.appRouter.navigateTo('overview') }
        ];
      }
      else if (q.includes('carbon') || q.includes('footprint') || q.includes('esg') || q.includes('emission') || q.includes('co2')) {
        const esg = this.state.esg;
        answer = `Our current factory Scope 2 emissions are **${esg.todayScope2Tons} tCO₂e** (grid factor 0.71 kg/kWh). On-site rooftop solar PV generates **${esg.energyMix.solarPercent}% (${esg.energyMix.solarKw} kW)** of live energy, which has already avoided **${esg.carbonSavedTodayKg.toLocaleString()} kg CO₂e** today!\n\nImplementing the AI schedule shift adds another **667.4 kg CO₂e** avoided decarbonization.`;
        actions = [
          { label: 'View Clean Energy Mix', action: () => window.appRouter.navigateTo('overview') },
          { label: 'Simulate Carbon Savings', action: () => window.appRouter.navigateTo('simulation') }
        ];
      }
      else if (q.includes('dispatch') || q.includes('mes') || q.includes('scada') || q.includes('work order') || q.includes('plc')) {
        answer = `EnerOpt AI is integrated with Shopfloor SCADA (Siemens SIMATIC S7-1500 / Allen-Bradley) via OPC-UA.\n\nYou can dispatch the active **${sim.target.toLocaleString()} units** staggered schedule with a single click to enforce peak-limiting setpoints and save **₹${sim.costSaved.toLocaleString()}**.`;
        actions = [
          { label: 'Open MES Dispatch Modal', action: () => { window.appRouter.navigateTo('simulation'); window.simulationPage.openMesModal(); } },
          { label: 'View Audit Trail', action: () => { window.appRouter.navigateTo('simulation'); window.simulationPage.openMesModal(); } }
        ];
      }
      else if (q.includes('vibration') || q.includes('bearing') || q.includes('harmonic') || q.includes('power factor') || q.includes('pf')) {
        answer = `Multivariate sensor telemetry for **CNC-02** reveals:\n• **Vibration**: **${abnormal.vibration} mm/s** (Critical harmonic stress > 3.0 mm/s)\n• **Power Factor**: **${abnormal.pf}** (Degraded capacitor bank)\n• **Bearing Health Index**: **${abnormal.bearingHealth}%** (Fair — maintenance alert)\n• **Spindle Temp**: **${abnormal.temperature}°C** (Overheating)\n\nRecommended: Apply 15-minute stagger pause to alleviate mechanical load.`;
        actions = [
          { label: 'Inspect CNC-02 Drawer', action: () => { window.appRouter.navigateTo('machines'); window.machineMonitorPage.openDrawer('CNC-02'); } },
          { label: 'Review Optimization', action: () => window.appRouter.navigateTo('optimization') }
        ];
      }
      else if (q.includes('why did ai optimize') || q.includes('why optimize')) {
        answer = `AI optimizes machine schedules based on three constraints:\n1. **Tariff & Peak Avoidance**: Prevents exceeding contract maximum demand kVA.\n2. **Idle Power Elimination**: Detects machines drawing standby power without workpieces (e.g. Press-02 22kW standby).\n3. **Thermal Preservation**: Relieves stressed spindles (CNC-02 at 71°C) without lowering output.`;
        actions = [
          { label: 'View Process Flow', action: () => window.appRouter.navigateTo('optimization') }
        ];
      }
      else {
        answer = `I analyzed your query against live plant telemetry. Current factory power is **${kpis.currentPower} kW**, CNC-02 has an active **+20.6% excess power alert**, and the production simulation for **${sim.target.toLocaleString()} units** is calculated at **${sim.expectedEnergy.toLocaleString()} kWh**.\n\nWould you like to explore any of these areas?`;
        actions = [
          { label: 'Overview', action: () => window.appRouter.navigateTo('overview') },
          { label: 'Machine Monitor', action: () => window.appRouter.navigateTo('machines') },
          { label: 'AI Optimization', action: () => window.appRouter.navigateTo('optimization') },
          { label: 'Production Simulation', action: () => window.appRouter.navigateTo('simulation') }
        ];
      }

      this.addBotMessage(answer, actions);
    }, 450);
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  formatMarkdown(text) {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n•/g, '<br/>• ')
      .replace(/\n/g, '<br/>');
    return html;
  }
}

window.energyAiAssistant = new EnergyAiAssistant();

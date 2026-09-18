/**
 * ENEROPT AI — Advanced High-DPI Chart Rendering Engine
 * Features:
 * 1. Monotone Cubic Spline (smooth Bezier curves, zero angular jaggedness)
 * 2. Interactive Crosshair Tracking & Glassmorphic Floating Tooltip
 * 3. Contract Threshold Safe Limit (1,350 kW) with alert annotations
 * 4. Dual-region Visual Boundary ("Forecast starts here") with shaded prediction zone
 * 5. High-DPI Retina scaling with subpixel rendering precision
 * 6. Interactive Machine Anomaly Telemetry Curve
 */

class EnergyCharts {
  constructor() {
    this.mainChartCanvas = null;
    this.machineChartCanvas = null;
    this.activeTimeRange = '24h'; // '24h', '7d', '30d'

    // Hover state for main chart
    this.hoverIdx = -1;
    this.mousePos = { x: 0, y: 0 };
    this.isHovering = false;

    // Hover state for machine chart
    this.machineHoverIdx = -1;
    this.machineIsHovering = false;

    // Cache datasets
    this.cachedData = null;
  }

  init() {
    this.mainChartCanvas = document.getElementById('mainEnergyChart');
    this.machineChartCanvas = document.getElementById('machineDetailChart');

    this.bindMainChartEvents();
    this.bindMachineChartEvents();

    // Handle window resize with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.renderMainChart(this.activeTimeRange);
        this.renderMachineDetailChart();
      }, 100);
    });

    // Initial render
    this.renderMainChart('24h');
  }

  setTimeRange(range) {
    this.activeTimeRange = range;
    this.hoverIdx = -1;
    this.hideTooltip();
    this.renderMainChart(range);
  }

  /* --------------------------------------------------------------------------
     MAIN CHART DATASETS
     -------------------------------------------------------------------------- */
  getDataset(range) {
    if (range === '24h') {
      return {
        labels: [
          '00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00',
          '13:00', '14:00', '15:00', '16:00', '16:30', '17:00', '18:00',
          '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
        ],
        actual: [
          820, 810, 840, 1050, 1220, 1260, 1280,
          1310, 1284, 1340, 1310, 1290, 1284, 1290,
          null, null, null, null, null, null
        ],
        predicted: [
          null, null, null, null, null, null, null,
          null, null, null, null, null, 1284, 1320,
          1420, 1450, 1380, 1250, 1080, 950
        ],
        splitIndex: 13, // 18:00 is transition point
        contractThreshold: 1350,
        unit: 'kW'
      };
    } else if (range === '7d') {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri (Today)', 'Sat (Forecast)', 'Sun (Forecast)'],
        actual: [17200, 17800, 18100, 17950, 18640, null, null],
        predicted: [null, null, null, null, 18640, 16800, 14200],
        splitIndex: 4,
        contractThreshold: 19000,
        unit: 'kWh'
      };
    } else {
      // 30 Days
      return {
        labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4 (Current)', 'Wk 5 (Forecast)'],
        actual: [112000, 114500, 110100, 112400, null],
        predicted: [null, null, null, 112400, 108500],
        splitIndex: 3,
        contractThreshold: 120000,
        unit: 'kWh'
      };
    }
  }

  /* --------------------------------------------------------------------------
     INTERACTIVE EVENT LISTENERS & TOOLTIP BINDINGS
     -------------------------------------------------------------------------- */
  bindMainChartEvents() {
    const canvas = document.getElementById('mainEnergyChart');
    if (!canvas) return;

    const onMove = (clientX, clientY) => {
      const wrapper = canvas.parentElement;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        if (this.isHovering) {
          this.isHovering = false;
          this.hoverIdx = -1;
          this.hideTooltip();
          this.renderMainChart(this.activeTimeRange);
        }
        return;
      }

      this.isHovering = true;
      this.mousePos = { x, y };

      const dataset = this.getDataset(this.activeTimeRange);
      const padding = { top: 45, right: 35, bottom: 45, left: 65 };
      const chartW = rect.width - padding.left - padding.right;

      // Find closest X index
      const relX = Math.max(0, Math.min(chartW, x - padding.left));
      const idx = Math.round((relX / chartW) * (dataset.labels.length - 1));

      if (idx !== this.hoverIdx) {
        this.hoverIdx = idx;
        this.renderMainChart(this.activeTimeRange);
        this.updateTooltip(idx, dataset, rect);
      }
    };

    canvas.style.touchAction = 'none';
    canvas.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    canvas.addEventListener('mouseleave', () => {
      if (this.isHovering) {
        this.isHovering = false;
        this.hoverIdx = -1;
        this.hideTooltip();
        this.renderMainChart(this.activeTimeRange);
      }
    });

    // Touch support for mobile / tablets
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
    canvas.addEventListener('touchend', () => {
      this.isHovering = false;
      this.hoverIdx = -1;
      this.hideTooltip();
      this.renderMainChart(this.activeTimeRange);
    });
  }

  updateTooltip(idx, dataset, rect) {
    const tooltip = document.getElementById('chartTooltip');
    const timeEl = document.getElementById('tooltipTime');
    const typeEl = document.getElementById('tooltipType');
    const valEl = document.getElementById('tooltipVal');
    const extraRow = document.getElementById('tooltipExtraRow');
    const extraText = document.getElementById('tooltipExtraText');

    if (!tooltip) return;

    const label = dataset.labels[idx];
    const isForecast = idx >= dataset.splitIndex && dataset.predicted[idx] !== null && idx !== dataset.splitIndex;
    const isTransition = idx === dataset.splitIndex;

    const actVal = dataset.actual[idx];
    const predVal = dataset.predicted[idx];
    const val = isForecast ? predVal : (actVal !== null ? actVal : predVal);

    if (val === null || val === undefined) {
      this.hideTooltip();
      return;
    }

    const padding = { top: 45, right: 35, bottom: 45, left: 65 };
    const chartW = rect.width - padding.left - padding.right;
    const ptX = padding.left + (idx / (dataset.labels.length - 1)) * chartW;

    // Calculate Y for tooltip positioning
    const allVals = [...dataset.actual, ...dataset.predicted].filter(v => v !== null);
    const minVal = Math.floor(Math.min(...allVals) * 0.88 / 100) * 100;
    const maxVal = Math.ceil(Math.max(...allVals, dataset.contractThreshold) * 1.08 / 100) * 100;
    const chartH = rect.height - padding.top - padding.bottom;
    const ptY = padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

    // Update Content
    timeEl.textContent = `${label} • Plant #4 Telemetry`;
    if (isForecast) {
      typeEl.innerHTML = `<span style="color:#38bdf8;font-weight:700;">⚡ AI Predicted Forecast</span>`;
      valEl.style.color = '#38bdf8';
    } else if (isTransition) {
      typeEl.innerHTML = `<span style="color:#f59e0b;font-weight:700;">⚡ Current Shift / Forecast Horizon</span>`;
      valEl.style.color = '#60a5fa';
    } else {
      typeEl.innerHTML = `<span style="color:#4ade80;font-weight:700;">🟢 Actual Factory Telemetry</span>`;
      valEl.style.color = '#ffffff';
    }

    valEl.textContent = `${val.toLocaleString()} ${dataset.unit}`;

    // Comparison against Contract Threshold
    const diff = val - dataset.contractThreshold;
    if (diff > 0) {
      extraRow.style.display = 'flex';
      extraText.style.color = '#f87171';
      extraText.textContent = `⚠ +${diff.toLocaleString()} ${dataset.unit} over contract limit (${dataset.contractThreshold.toLocaleString()})`;
    } else {
      extraRow.style.display = 'flex';
      extraText.style.color = '#34d399';
      extraText.textContent = `✓ Within safe threshold (${Math.abs(diff).toLocaleString()} ${dataset.unit} margin)`;
    }

    // Position tooltip smoothly
    tooltip.style.left = `${ptX}px`;
    tooltip.style.top = `${Math.max(50, ptY - 12)}px`;
    tooltip.classList.add('visible');
  }

  hideTooltip() {
    const tooltip = document.getElementById('chartTooltip');
    if (tooltip) tooltip.classList.remove('visible');
  }

  /* --------------------------------------------------------------------------
     MONOTONE CUBIC SPLINE ALGORITHM (Hermite curve for smooth natural lines)
     -------------------------------------------------------------------------- */
  calculateSplineControlPoints(points, tension = 0.32) {
    if (points.length < 2) return [];

    const controlPoints = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;

      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      controlPoints.push({ cp1x, cp1y, cp2x, cp2y });
    }
    return controlPoints;
  }

  drawSplinePath(ctx, points, controlPoints) {
    if (points.length === 0) return;
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const p2 = points[i + 1];
      const cp = controlPoints[i];
      ctx.bezierCurveTo(cp.cp1x, cp.cp1y, cp.cp2x, cp.cp2y, p2.x, p2.y);
    }
  }

  renderMainChart(range = '24h') {
    const canvas = document.getElementById('mainEnergyChart');
    if (!canvas) return;

    const wrapper = canvas.parentElement;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    const targetWidth = Math.round(width * dpr);
    const targetHeight = Math.round(height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    // Explicitly reset the transform matrix to identity to prevent cumulative scale on mousemove
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Smoothing quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const dataset = this.getDataset(range);
    const { labels, actual, predicted, splitIndex, contractThreshold } = dataset;

    // Dimensions & Padding
    const padding = { top: 45, right: 35, bottom: 45, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Calculate Min & Max Range with generous buffer
    const allVals = [...actual, ...predicted].filter(v => v !== null);
    const minVal = Math.floor(Math.min(...allVals) * 0.88 / 100) * 100;
    const maxVal = Math.ceil(Math.max(...allVals, contractThreshold) * 1.08 / 100) * 100;

    const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
    const getX = (idx) => padding.left + (idx / (labels.length - 1)) * chartW;

    const splitX = getX(splitIndex);

    // 1. Draw Forecast Region Background (Subtle Tint with Border)
    ctx.save();
    const forecastGrad = ctx.createLinearGradient(splitX, padding.top, width - padding.right, padding.top);
    forecastGrad.addColorStop(0, 'rgba(239, 246, 255, 0.45)');
    forecastGrad.addColorStop(1, 'rgba(240, 249, 255, 0.75)');
    ctx.fillStyle = forecastGrad;
    ctx.fillRect(splitX, padding.top, width - padding.right - splitX, chartH);

    // Subtle dashed pattern lines in forecast section
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.04)';
    ctx.lineWidth = 1;
    for (let x = splitX + 25; x < width - padding.right; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Draw Horizontal Grid Lines & Y-Axis Labels
    ctx.save();
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const v = minVal + (i / ySteps) * (maxVal - minVal);
      const y = Math.round(getY(v));
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const displayVal = range === '24h' ? `${Math.round(v)} kW` : `${(v / 1000).toFixed(0)}k`;
      ctx.fillText(displayVal, padding.left - 10, y + 4);
    }
    ctx.restore();

    // 3. Draw Contract Demand Limit Line (1,350 kW Safe Threshold)
    const thresholdY = getY(contractThreshold);
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, thresholdY);
    ctx.lineTo(width - padding.right, thresholdY);
    ctx.stroke();

    // Threshold pill label on right edge
    const threshLabel = `Safe Limit: ${contractThreshold.toLocaleString()} ${dataset.unit}`;
    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    const threshW = ctx.measureText(threshLabel).width;
    const pillX = width - padding.right - threshW - 14;
    const pillY = thresholdY - 18;

    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    this.drawRoundedRect(ctx, pillX, pillY, threshW + 12, 18, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.textAlign = 'left';
    ctx.fillText(threshLabel, pillX + 6, pillY + 12);
    ctx.restore();

    // 4. Draw X-Axis Labels
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    labels.forEach((lbl, i) => {
      // In 24h mode, skip alternate labels on small screens for neatness
      if (range === '24h' && width < 750 && i % 2 !== 0 && i !== splitIndex) return;
      const x = getX(i);
      ctx.fillStyle = (i === splitIndex) ? '#2563eb' : (i > splitIndex ? '#0284c7' : '#64748b');
      ctx.fillText(lbl, x, height - padding.bottom + 24);
    });
    ctx.restore();

    // 5. Compute Points for Smooth Spline
    // Actual Points
    const actualPoints = [];
    actual.forEach((val, i) => {
      if (val !== null) {
        actualPoints.push({ x: getX(i), y: getY(val), val, idx: i });
      }
    });

    // Predicted Points
    const predPoints = [];
    predicted.forEach((val, i) => {
      if (val !== null) {
        predPoints.push({ x: getX(i), y: getY(val), val, idx: i });
      }
    });

    // 6. Draw AI Predicted Area & Spline
    if (predPoints.length > 1) {
      const predCP = this.calculateSplineControlPoints(predPoints, 0.32);

      // Gradient Fill for Forecast
      ctx.save();
      const predAreaGrad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      predAreaGrad.addColorStop(0, 'rgba(2, 132, 199, 0.22)');
      predAreaGrad.addColorStop(0.7, 'rgba(2, 132, 199, 0.05)');
      predAreaGrad.addColorStop(1, 'rgba(2, 132, 199, 0.00)');

      ctx.beginPath();
      this.drawSplinePath(ctx, predPoints, predCP);
      ctx.lineTo(predPoints[predPoints.length - 1].x, height - padding.bottom);
      ctx.lineTo(predPoints[0].x, height - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = predAreaGrad;
      ctx.fill();
      ctx.restore();

      // Predicted Stroke (Smooth dashed cyan curve)
      ctx.save();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.8;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      this.drawSplinePath(ctx, predPoints, predCP);
      ctx.stroke();
      ctx.restore();

      // Predicted Data Points
      predPoints.forEach((pt) => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Highlight Peak Point (1,420 kW at index 14)
        if (range === '24h' && pt.val === 1420) {
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
          ctx.fill();

          // Pulsing glow ring around peak
          ctx.strokeStyle = 'rgba(220, 38, 38, 0.35)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
          ctx.stroke();

          // Peak Callout Tag
          const peakTxt = '⚡ Peak 1,420 kW';
          ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
          const pW = ctx.measureText(peakTxt).width;
          const pTagX = pt.x - pW / 2 - 8;
          const pTagY = pt.y - 32;

          ctx.fillStyle = '#fef2f2';
          ctx.strokeStyle = '#fecaca';
          ctx.lineWidth = 1;
          this.drawRoundedRect(ctx, pTagX, pTagY, pW + 16, 22, 5);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#dc2626';
          ctx.textAlign = 'left';
          ctx.fillText(peakTxt, pTagX + 8, pTagY + 15);
        }
        ctx.restore();
      });
    }

    // 7. Draw Actual Consumption Area & Spline
    if (actualPoints.length > 1) {
      const actCP = this.calculateSplineControlPoints(actualPoints, 0.32);

      // Multi-stop Gradient Area for Actuals
      ctx.save();
      const actAreaGrad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      actAreaGrad.addColorStop(0, 'rgba(37, 99, 235, 0.28)');
      actAreaGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.10)');
      actAreaGrad.addColorStop(1, 'rgba(37, 99, 235, 0.00)');

      ctx.beginPath();
      this.drawSplinePath(ctx, actualPoints, actCP);
      ctx.lineTo(actualPoints[actualPoints.length - 1].x, height - padding.bottom);
      ctx.lineTo(actualPoints[0].x, height - padding.bottom);
      ctx.closePath();
      ctx.fillStyle = actAreaGrad;
      ctx.fill();
      ctx.restore();

      // Actual Solid Curve Stroke
      ctx.save();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      this.drawSplinePath(ctx, actualPoints, actCP);
      ctx.stroke();
      ctx.restore();

      // Actual Points
      actualPoints.forEach((pt) => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Highlight Current Live Point (last actual point)
      const lastPt = actualPoints[actualPoints.length - 1];
      if (lastPt) {
        ctx.save();
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(lastPt.x, lastPt.y, 6.5, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing outer halo
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(lastPt.x, lastPt.y, 11, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Current: ${lastPt.val.toLocaleString()} ${dataset.unit}`, lastPt.x - 14, lastPt.y - 6);
        ctx.restore();
      }
    }

    // 8. Draw Vertical Forecast Divider: "Forecast starts here"
    ctx.save();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(splitX, padding.top - 12);
    ctx.lineTo(splitX, height - padding.bottom);
    ctx.stroke();
    ctx.restore();

    // Top Divider Badge with Shadow
    ctx.save();
    const badgeText = '⚡ Forecast starts here';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    const textW = ctx.measureText(badgeText).width;
    const badgeX = Math.min(width - padding.right - textW - 16, splitX - 12);
    const badgeY = padding.top - 32;

    // Drop shadow under badge
    ctx.shadowColor = 'rgba(217, 119, 6, 0.18)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.2;
    this.drawRoundedRect(ctx, badgeX, badgeY, textW + 18, 24, 6);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#92400e';
    ctx.textAlign = 'left';
    ctx.fillText(badgeText, badgeX + 9, badgeY + 16);
    ctx.restore();

    // 9. Draw Interactive Hover Crosshair Beam & Point if Hovering
    if (this.isHovering && this.hoverIdx >= 0 && this.hoverIdx < labels.length) {
      const hX = getX(this.hoverIdx);
      const isPred = this.hoverIdx >= splitIndex && predicted[this.hoverIdx] !== null && this.hoverIdx !== splitIndex;
      const hVal = isPred ? predicted[this.hoverIdx] : (actual[this.hoverIdx] !== null ? actual[this.hoverIdx] : predicted[this.hoverIdx]);

      if (hVal !== null && hVal !== undefined) {
        const hY = getY(hVal);

        // Vertical Guide Beam
        ctx.save();
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(hX, padding.top);
        ctx.lineTo(hX, height - padding.bottom);
        ctx.stroke();

        // Horizontal Guide Beam
        ctx.beginPath();
        ctx.moveTo(padding.left, hY);
        ctx.lineTo(width - padding.right, hY);
        ctx.stroke();

        // Active Focus Circle with Glow
        ctx.setLineDash([]);
        ctx.fillStyle = isPred ? '#0284c7' : '#2563eb';
        ctx.beginPath();
        ctx.arc(hX, hY, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.strokeStyle = isPred ? 'rgba(2, 132, 199, 0.4)' : 'rgba(37, 99, 235, 0.4)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(hX, hY, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  /* --------------------------------------------------------------------------
     MACHINE DETAIL 6-HOUR TELEMETRY CURVE
     -------------------------------------------------------------------------- */
  bindMachineChartEvents() {
    const canvas = document.getElementById('machineDetailChart');
    if (!canvas) return;

    canvas.style.touchAction = 'none';
    canvas.addEventListener('mousemove', (e) => {
      const wrapper = canvas.parentElement;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.machineIsHovering = true;
      const padding = { top: 25, right: 25, bottom: 28, left: 45 };
      const chartW = rect.width - padding.left - padding.right;
      const labels = ['11:00', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '16:00'];
      const relX = Math.max(0, Math.min(chartW, x - padding.left));
      const idx = Math.round((relX / chartW) * (labels.length - 1));
      if (idx !== this.machineHoverIdx) {
        this.machineHoverIdx = idx;
        this.renderMachineDetailChart();
      }
    });

    canvas.addEventListener('mouseleave', () => {
      if (this.machineIsHovering) {
        this.machineIsHovering = false;
        this.machineHoverIdx = -1;
        this.renderMachineDetailChart();
      }
    });
  }

  renderMachineDetailChart(machine = window.enerOptState?.selectedMachine) {
    const canvas = document.getElementById('machineDetailChart');
    if (!canvas) return;

    const wrapper = canvas.parentElement;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    const targetWidth = Math.round(width * dpr);
    const targetHeight = Math.round(height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    // Explicitly reset the transform matrix to identity to prevent cumulative scale on mousemove
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const normal = machine ? machine.normalPower : 150;
    const current = machine ? machine.currentPower : 181;
    const isAbnormal = (machine?.diff || 0) > 10;

    const labels = ['11:00', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '16:00 (Now)'];
    let data = [];
    if (machine?.id === 'CNC-02') {
      data = [149, 151, 150, 162, 178, 184, 180, 181];
    } else {
      data = [normal - 2, normal + 1, normal, normal + 3, normal - 1, normal, normal - 1, current];
    }

    const padding = { top: 25, right: 25, bottom: 28, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const minVal = 130;
    const maxVal = 200;

    const getY = (val) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
    const getX = (i) => padding.left + (i / (labels.length - 1)) * chartW;

    // 1. Draw Grid Lines
    ctx.save();
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';

    [140, 160, 180, 200].forEach(v => {
      const y = Math.round(getY(v));
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(`${v} kW`, padding.left - 6, y + 3);
    });
    ctx.restore();

    // 2. Draw Baseline (Normal Power threshold)
    const normalY = getY(normal);
    ctx.save();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, normalY);
    ctx.lineTo(width - padding.right, normalY);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Normal: ${normal} kW`, width - padding.right, normalY - 4);
    ctx.restore();

    // 3. Compute Smooth Cubic Points
    const points = data.map((val, i) => ({ x: getX(i), y: getY(val), val, idx: i }));
    const cp = this.calculateSplineControlPoints(points, 0.32);

    // 4. Fill Gradient (Red warning gradient if abnormal)
    ctx.save();
    const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    if (isAbnormal) {
      grad.addColorStop(0, 'rgba(220, 38, 38, 0.28)');
      grad.addColorStop(0.6, 'rgba(220, 38, 38, 0.08)');
      grad.addColorStop(1, 'rgba(220, 38, 38, 0.00)');
    } else {
      grad.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
      grad.addColorStop(1, 'rgba(37, 99, 235, 0.00)');
    }

    ctx.beginPath();
    this.drawSplinePath(ctx, points, cp);
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.lineTo(points[0].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // 5. Draw Smooth Stroke
    ctx.save();
    ctx.strokeStyle = isAbnormal ? '#dc2626' : '#2563eb';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    this.drawSplinePath(ctx, points, cp);
    ctx.stroke();
    ctx.restore();

    // 6. Draw Points
    points.forEach((pt) => {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = isAbnormal && pt.val > 160 ? '#dc2626' : '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // 7. X-Axis Labels
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.font = '500 9.5px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((lbl, i) => {
      if (i % 2 === 0 || i === labels.length - 1) {
        ctx.fillText(lbl, getX(i), height - 8);
      }
    });
    ctx.restore();

    // 8. Hover Highlight on Machine Chart
    if (this.machineIsHovering && this.machineHoverIdx >= 0 && this.machineHoverIdx < points.length) {
      const pt = points[this.machineHoverIdx];
      ctx.save();
      ctx.fillStyle = isAbnormal ? '#dc2626' : '#2563eb';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tooltip inside canvas
      const tip = `${labels[this.machineHoverIdx]}: ${pt.val} kW`;
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      const tw = ctx.measureText(tip).width;
      const tx = Math.min(width - padding.right - tw - 10, Math.max(padding.left, pt.x - tw / 2));
      const ty = Math.max(padding.top + 10, pt.y - 12);

      ctx.fillStyle = '#0f172a';
      this.drawRoundedRect(ctx, tx - 5, ty - 12, tw + 10, 18, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(tip, tx, ty);
      ctx.restore();
    }
  }

  /* Utility: Rounded Rectangle */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

window.energyCharts = new EnergyCharts();

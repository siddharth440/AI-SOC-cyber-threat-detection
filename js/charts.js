/* ==========================================
   SentinelX — Pure Canvas & SVG Chart Engine
   ========================================== */

const ChartEngine = {
  /**
   * Render Circular Security Score Gauge
   */
  renderSecurityScore(containerId, score) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let statusText = 'Excellent';
    let color = '#10b981'; // Green
    if (score < 50) {
      statusText = 'Critical';
      color = '#ef4444';
    } else if (score < 70) {
      statusText = 'Warning';
      color = '#f97316';
    } else if (score < 85) {
      statusText = 'Good';
      color = '#eab308';
    }

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    container.innerHTML = `
      <div class="score-gauge-wrapper">
        <svg class="score-gauge-svg" viewBox="0 0 160 160">
          <circle class="score-gauge-bg" cx="80" cy="80" r="${radius}"></circle>
          <circle class="score-gauge-fill" cx="80" cy="80" r="${radius}" 
            style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset}; stroke: ${color};">
          </circle>
        </svg>
        <div class="score-center-text">
          <span class="score-number">${score}</span>
          <span class="score-label" style="color: ${color}">${statusText}</span>
        </div>
      </div>
    `;
  },

  /**
   * Render 24-Hour Threat Activity Area Chart on Canvas
   */
  renderThreatActivityChart(canvasId, dataPoints) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 30;

    ctx.clearRect(0, 0, width, height);

    if (!dataPoints || dataPoints.length === 0) return;

    const maxVal = Math.max(...dataPoints, 10);
    const stepX = (width - padding * 2) / (dataPoints.length - 1);

    // Draw Gridlines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = height - padding - (i / 4) * (height - padding * 2);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Coordinates mapping
    const points = dataPoints.map((val, idx) => ({
      x: padding + idx * stepX,
      y: height - padding - (val / maxVal) * (height - padding * 2)
    }));

    // Area Fill Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line Path
    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Nodes
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0b0f17';
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  },

  /**
   * Render Severity Donut Chart using SVG
   */
  renderSeverityDonut(containerId, distribution) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = (distribution.critical || 0) + (distribution.high || 0) + (distribution.medium || 0) + (distribution.low || 0) || 1;
    const slices = [
      { name: 'Critical', val: distribution.critical || 0, color: '#ef4444' },
      { name: 'High', val: distribution.high || 0, color: '#f97316' },
      { name: 'Medium', val: distribution.medium || 0, color: '#eab308' },
      { name: 'Low', val: distribution.low || 0, color: '#10b981' }
    ];

    let cumulativePercent = 0;

    function getCoordinatesForPercent(percent) {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    }

    const paths = slices.map(slice => {
      const startPercent = cumulativePercent;
      const slicePercent = slice.val / total;
      cumulativePercent += slicePercent;
      const endPercent = cumulativePercent;

      const [startX, startY] = getCoordinatesForPercent(startPercent);
      const [endX, endY] = getCoordinatesForPercent(endPercent);

      const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

      const pathData = [
        `M ${startX * 50 + 60} ${startY * 50 + 60}`,
        `A 50 50 0 ${largeArcFlag} 1 ${endX * 50 + 60} ${endY * 50 + 60}`
      ].join(' ');

      return `
        <path d="${pathData}" fill="none" stroke="${slice.color}" stroke-width="16" 
          title="${slice.name}: ${slice.val}">
        </path>
      `;
    }).join('');

    const legend = slices.map(s => `
      <div style="display:flex; align-items:center; gap:6px; font-size:0.78rem;">
        <span style="width:10px; height:10px; border-radius:50%; background:${s.color};"></span>
        <span style="color:var(--text-muted);">${s.name}:</span>
        <strong style="color:var(--text-main);">${s.val}</strong>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-around; height:100%;">
        <svg viewBox="0 0 120 120" style="width:140px; height:140px; transform:rotate(-90deg);">
          ${paths}
        </svg>
        <div style="display:flex; flex-direction:column; gap:8px;">${legend}</div>
      </div>
    `;
  },

  /**
   * Render Attack Categories Horizontal Bar Chart
   */
  renderAttackCategoriesBar(containerId, categoriesData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const maxVal = Math.max(...categoriesData.map(c => c.count), 1);

    container.innerHTML = categoriesData.map(item => {
      const pct = Math.round((item.count / maxVal) * 100);
      return `
        <div style="margin-bottom: 10px;">
          <div style="display:flex; justify-content:space-between; font-size:0.78rem; margin-bottom:4px;">
            <span style="color:var(--text-main);">${Utils.escapeHTML(item.category)}</span>
            <span style="color:var(--accent-cyan); font-weight:700;">${item.count}</span>
          </div>
          <div style="height:6px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden;">
            <div style="width:${pct}%; height:100%; background:linear-gradient(90deg, var(--accent-cyan), var(--accent-blue)); border-radius:4px;"></div>
          </div>
        </div>
      `;
    }).join('');
  }
};

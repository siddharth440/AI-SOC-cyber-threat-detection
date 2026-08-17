/* ==========================================
   SentinelX — Cyber Attack Map Controller (SVG Vector)
   ========================================== */

const AttackMapController = {
  init() {
    this.renderMap();
    this.renderStats();

    // Hook live events to map animation
    window.onLiveEventGenerated = (newAlert) => {
      this.animateAttackArc(newAlert);
      this.renderStats();
    };
  },

  renderMap() {
    const mapContainer = document.getElementById('map-svg-container');
    if (!mapContainer) return;

    // Vector World Map Outlines (Simplified stylized SVG nodes)
    const nodes = [
      { id: 'US', x: 200, y: 150, name: 'North America' },
      { id: 'EU', x: 450, y: 130, name: 'Europe' },
      { id: 'RU', x: 620, y: 110, name: 'Russia' },
      { id: 'CN', x: 720, y: 180, name: 'China' },
      { id: 'BR', x: 320, y: 320, name: 'South America' },
      { id: 'SOC', x: 480, y: 220, name: 'SentinelX SOC HQ', isTarget: true }
    ];

    mapContainer.innerHTML = `
      <svg class="attack-map-svg" viewBox="0 0 900 450">
        <!-- Gridlines -->
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>

        <!-- Nodes -->
        ${nodes.map(n => `
          <g transform="translate(${n.x}, ${n.y})">
            <circle r="${n.isTarget ? 12 : 6}" fill="${n.isTarget ? 'var(--accent-cyan)' : 'var(--severity-high)'}" 
              opacity="${n.isTarget ? '0.9' : '0.6'}" 
              style="${n.isTarget ? 'filter: drop-shadow(0 0 8px var(--accent-cyan));' : ''}">
            </circle>
            <text x="14" y="4" fill="var(--text-muted)" font-size="10" font-weight="600">${n.name}</text>
          </g>
        `).join('')}

        <!-- Dynamic Attack Arcs Layer -->
        <g id="arcs-layer"></g>
      </svg>
    `;

    // Trigger initial attack arcs
    const alerts = StorageEngine.loadAlerts().slice(0, 5);
    alerts.forEach(a => this.animateAttackArc(a));
  },

  animateAttackArc(alert) {
    const layer = document.getElementById('arcs-layer');
    if (!layer) return;

    // Map source region coordinates
    let startX = 620; let startY = 110; // Default Russia
    if (alert.country === 'China') { startX = 720; startY = 180; }
    else if (alert.country === 'United States') { startX = 200; startY = 150; }
    else if (alert.country === 'Brazil') { startX = 320; startY = 320; }

    const targetX = 480; const targetY = 220; // SOC HQ

    // Control point for quadratic curve
    const controlX = (startX + targetX) / 2;
    const controlY = Math.min(startY, targetY) - 50;

    const pathData = `M ${startX} ${startY} Q ${controlX} ${controlY} ${targetX} ${targetY}`;
    const color = alert.severity === 'CRITICAL' ? 'var(--severity-critical)' : 'var(--accent-cyan)';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('class', 'attack-arc');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', alert.severity === 'CRITICAL' ? '3' : '2');

    layer.appendChild(path);

    // Fade out after 4 seconds
    setTimeout(() => {
      path.style.opacity = '0';
      path.style.transition = 'opacity 1s ease';
      setTimeout(() => path.remove(), 1000);
    }, 4000);
  },

  renderStats() {
    const alerts = StorageEngine.loadAlerts();
    const mapStats = document.getElementById('map-stats-container');
    if (!mapStats) return;

    const totalAttacks = alerts.length;
    const countries = new Set(alerts.map(a => a.country)).size;
    
    mapStats.innerHTML = `
      <div class="glass-panel" style="padding:16px; display:flex; justify-content:space-around;">
        <div>Attacks Monitored: <strong style="color:var(--accent-cyan);">${totalAttacks}</strong></div>
        <div>Source Countries: <strong style="color:var(--text-main);">${countries}</strong></div>
        <div>Top Attack Type: <strong style="color:var(--severity-high);">Brute Force</strong></div>
        <div>Top Target Subnet: <strong style="color:var(--severity-critical);">10.0.1.0/24</strong></div>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('attack-map-marker')) {
    AttackMapController.init();
  }
});

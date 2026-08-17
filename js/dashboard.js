/* ==========================================
   SentinelX — Dashboard View Controller
   ========================================== */

const DashboardController = {
  init() {
    this.refreshDashboard();
    
    // Register live event hook for real-time dashboard updates
    window.onLiveEventGenerated = (newAlert) => {
      this.refreshDashboard();
      this.prependLiveStreamItem(newAlert);
      Notifications.showToast(`New ${newAlert.severity} Alert: ${newAlert.eventType}`, newAlert.severity === 'CRITICAL' ? 'error' : 'warning');
    };
  },

  refreshDashboard() {
    const alerts = StorageEngine.loadAlerts();
    const incidents = StorageEngine.loadIncidents();
    const endpoints = StorageEngine.loadEndpoints();
    const threats = StorageEngine.loadThreats();

    // 1. Dynamic KPI Calculations
    const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'NEW').length;
    const activeIncidents = incidents.filter(inc => inc.status !== 'CLOSED' && inc.status !== 'RESOLVED').length;
    const threatsDetected = threats.filter(t => t.status === 'MALICIOUS').length;
    const endpointsMonitored = endpoints.length;
    const atRiskEndpoints = endpoints.filter(ep => ep.status === 'AT RISK' || ep.status === 'ISOLATED').length;
    const eventsProcessed = 48392 + alerts.length;

    // Update KPI Elements in DOM
    this.updateElementText('kpi-critical-alerts', criticalCount);
    this.updateElementText('kpi-active-incidents', activeIncidents);
    this.updateElementText('kpi-threats-detected', threatsDetected);
    this.updateElementText('kpi-endpoints-monitored', endpointsMonitored.toLocaleString());
    this.updateElementText('kpi-events-processed', eventsProcessed.toLocaleString());

    // 2. Dynamic Security Score Calculation
    // Formula: Base 100 minus weighted risk penalties
    let score = 100 - (criticalCount * 2.5 + activeIncidents * 3 + atRiskEndpoints * 4);
    score = Math.min(Math.max(Math.round(score), 25), 100);

    ChartEngine.renderSecurityScore('security-score-container', score);

    // 3. Render Charts
    this.renderThreatActivityChart(alerts);
    this.renderSeverityDistributionChart(alerts);
    this.renderAttackCategoriesChart(alerts);
    this.renderRecentLiveFeed(alerts);
  },

  updateElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  renderThreatActivityChart(alerts) {
    // Generate 24-hour activity array from alerts timestamps
    const hoursData = new Array(24).fill(0);
    const now = new Date();

    alerts.forEach(a => {
      const diffHours = Math.floor((now - new Date(a.timestamp)) / (1000 * 60 * 60));
      if (diffHours >= 0 && diffHours < 24) {
        hoursData[23 - diffHours]++;
      }
    });

    ChartEngine.renderThreatActivityChart('threat-activity-canvas', hoursData);
  },

  renderSeverityDistributionChart(alerts) {
    const distribution = {
      critical: alerts.filter(a => a.severity === 'CRITICAL').length,
      high: alerts.filter(a => a.severity === 'HIGH').length,
      medium: alerts.filter(a => a.severity === 'MEDIUM').length,
      low: alerts.filter(a => a.severity === 'LOW').length
    };

    ChartEngine.renderSeverityDonut('severity-donut-container', distribution);
  },

  renderAttackCategoriesChart(alerts) {
    const counts = {};
    alerts.forEach(a => {
      const cat = a.category || 'Reconnaissance';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const categoryList = Object.keys(counts).map(cat => ({
      category: cat,
      count: counts[cat]
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    ChartEngine.renderAttackCategoriesBar('attack-categories-container', categoryList);
  },

  renderRecentLiveFeed(alerts) {
    const streamContainer = document.getElementById('live-stream-list');
    if (!streamContainer) return;

    streamContainer.innerHTML = alerts.slice(0, 10).map(a => `
      <div class="stream-item">
        <div class="stream-meta">
          <span class="stream-time">${Utils.formatDate(a.timestamp)}</span>
          <span class="stream-event-name">${Utils.escapeHTML(a.eventType)}</span>
          <span class="stream-details">(${a.sourceIp} → ${a.endpoint})</span>
        </div>
        ${Utils.getSeverityBadge(a.severity)}
      </div>
    `).join('');
  },

  prependLiveStreamItem(alert) {
    const streamContainer = document.getElementById('live-stream-list');
    if (!streamContainer) return;

    const item = document.createElement('div');
    item.className = 'stream-item';
    item.innerHTML = `
      <div class="stream-meta">
        <span class="stream-time">${Utils.formatDate(alert.timestamp)}</span>
        <span class="stream-event-name">${Utils.escapeHTML(alert.eventType)}</span>
        <span class="stream-details">(${alert.sourceIp} → ${alert.endpoint})</span>
      </div>
      ${Utils.getSeverityBadge(alert.severity)}
    `;

    streamContainer.insertBefore(item, streamContainer.firstChild);
    if (streamContainer.children.length > 10) {
      streamContainer.removeChild(streamContainer.lastChild);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboard-view-marker')) {
    DashboardController.init();
  }
});

/* ==========================================
   SentinelX — Core Application Controller & Live Telemetry Engine
   ========================================== */

const App = {
  liveTimer: null,

  init() {
    this.renderSidebar();
    this.renderHeader();
    this.bindEvents();
    this.initGlobalSearch();
    this.startLiveTelemetry();
  },

  /**
   * Render Sidebar Navigation HTML dynamically into container
   */
  renderSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
    const settings = StorageEngine.getSettings();

    const navItems = [
      { page: 'dashboard.html', label: 'Dashboard', icon: '📊' },
      { page: 'alerts.html', label: 'Alerts', icon: '🚨' },
      { page: 'incidents.html', label: 'Incidents', icon: '🔥' },
      { page: 'threats.html', label: 'Threat Intelligence', icon: '⚡' },
      { page: 'endpoints.html', label: 'Endpoints', icon: '💻' },
      { page: 'logs.html', label: 'Log Analyzer', icon: '📋' },
      { page: 'attack-map.html', label: 'Attack Map', icon: '🌐' },
      { page: 'mitre.html', label: 'MITRE ATT&CK', icon: '⚔️' },
      { page: 'reports.html', label: 'Reports', icon: '📈' },
      { page: 'settings.html', label: 'Settings', icon: '⚙️' }
    ];

    const alerts = StorageEngine.loadAlerts();
    const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'NEW').length;

    sidebarContainer.innerHTML = `
      <aside class="sidebar" id="sidebar-nav">
        <div class="sidebar-logo">
          <div class="logo-icon">SX</div>
          <div class="logo-text">Sentinel<span>X</span></div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">Navigation</div>
          ${navItems.map(item => {
            const isActive = currentPath === item.page || (currentPath === '' && item.page === 'dashboard.html');
            return `
              <a href="./${item.page}" class="nav-item ${isActive ? 'active' : ''}">
                <span class="nav-icon">${item.icon}</span>
                <span>${item.label}</span>
                ${item.page === 'alerts.html' && criticalCount > 0 ? `<span class="badge badge-critical">${criticalCount}</span>` : ''}
              </a>
            `;
          }).join('')}
        </nav>

        <div class="sidebar-footer">
          <div class="analyst-profile">
            <div class="avatar">SA</div>
            <div class="analyst-info">
              <span class="analyst-name">${Utils.escapeHTML(settings.analystName)}</span>
              <span class="analyst-role">Tier 3 Analyst</span>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" style="width:100%; justify-content:center;" onclick="AuthEngine.logout()">
            🚪 Logout
          </button>
        </div>
      </aside>
    `;
  },

  /**
   * Render Top Header Component HTML
   */
  renderHeader() {
    const headerContainer = document.getElementById('header-container');
    if (!headerContainer) return;

    const settings = StorageEngine.getSettings();
    const liveActive = settings.liveMonitoring;

    headerContainer.innerHTML = `
      <header class="top-header">
        <div class="header-left">
          <button class="mobile-menu-btn" id="mobile-toggle">☰</button>
          <div class="header-search">
            <span class="search-icon">🔍</span>
            <input type="text" id="global-search-input" placeholder="Search alerts, IPs, endpoints, logs..." autocomplete="off">
            <div class="search-results-modal" id="global-search-results"></div>
          </div>
          <div class="live-indicator ${liveActive ? '' : 'paused'}" id="live-indicator-badge">
            <span class="live-dot"></span>
            <span id="live-indicator-text">${liveActive ? 'LIVE MONITORING' : 'PAUSED'}</span>
          </div>
        </div>

        <div class="header-right">
          <button class="icon-btn" id="notification-bell-btn" title="Notifications">
            🔔
            <span class="notification-count" id="header-notification-count">0</span>
          </button>
        </div>
      </header>
    `;

    Notifications.renderHeaderPopover();
  },

  bindEvents() {
    // Mobile toggle
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'mobile-toggle') {
        const sidebar = document.getElementById('sidebar-nav');
        if (sidebar) sidebar.classList.toggle('mobile-open');
      }
    });
  },

  initGlobalSearch() {
    document.addEventListener('input', (e) => {
      if (e.target && e.target.id === 'global-search-input') {
        const query = e.target.value.trim().toLowerCase();
        const modal = document.getElementById('global-search-results');
        if (!modal) return;

        if (query.length < 2) {
          modal.classList.remove('active');
          return;
        }

        const alerts = StorageEngine.loadAlerts().filter(a => a.id.toLowerCase().includes(query) || a.eventType.toLowerCase().includes(query) || a.sourceIp.includes(query));
        const endpoints = StorageEngine.loadEndpoints().filter(ep => ep.hostname.toLowerCase().includes(query) || ep.ip.includes(query));
        const threats = StorageEngine.loadThreats().filter(t => t.ioc.toLowerCase().includes(query) || t.threatName.toLowerCase().includes(query));

        if (alerts.length === 0 && endpoints.length === 0 && threats.length === 0) {
          modal.innerHTML = '<div style="padding:12px; color:var(--text-muted); font-size:0.85rem;">No matching SOC records found</div>';
        } else {
          modal.innerHTML = `
            ${alerts.length > 0 ? `
              <div class="search-result-group">
                <div class="search-result-group-title">Alerts (${alerts.length})</div>
                ${alerts.slice(0, 3).map(a => `
                  <a href="./alerts.html" class="search-result-item">
                    <span><strong>${a.id}</strong>: ${Utils.escapeHTML(a.eventType)}</span>
                    ${Utils.getSeverityBadge(a.severity)}
                  </a>
                `).join('')}
              </div>
            ` : ''}
            ${endpoints.length > 0 ? `
              <div class="search-result-group">
                <div class="search-result-group-title">Endpoints (${endpoints.length})</div>
                ${endpoints.slice(0, 3).map(ep => `
                  <a href="./endpoints.html" class="search-result-item">
                    <span><strong>${ep.hostname}</strong> (${ep.ip})</span>
                    ${Utils.getStatusBadge(ep.status)}
                  </a>
                `).join('')}
              </div>
            ` : ''}
            ${threats.length > 0 ? `
              <div class="search-result-group">
                <div class="search-result-group-title">Threat Intel (${threats.length})</div>
                ${threats.slice(0, 3).map(t => `
                  <a href="./threats.html" class="search-result-item">
                    <span><strong>${t.ioc}</strong> (${t.threatName})</span>
                  </a>
                `).join('')}
              </div>
            ` : ''}
          `;
        }
        modal.classList.add('active');
      }
    });

    // Close search modal on outside click
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('global-search-results');
      if (modal && !e.target.closest('.header-search')) {
        modal.classList.remove('active');
      }
    });
  },

  /**
   * Start Live Simulated Network Security Telemetry Loop
   */
  startLiveTelemetry() {
    const settings = StorageEngine.getSettings();
    if (!settings.liveMonitoring) return;

    this.liveTimer = setInterval(() => {
      this.generateLiveSecurityEvent();
    }, 4000);
  },

  /**
   * Generates a new real-time security event and updates UI dynamically
   */
  generateLiveSecurityEvent() {
    const eventTypes = DemoDataGenerator.eventTypes;
    const countries = DemoDataGenerator.countries;
    const endpoints = DemoDataGenerator.endpointsList;

    const randomEvt = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const randomEp = endpoints[Math.floor(Math.random() * endpoints.length)];

    const srcIP = randomCountry.isAnomaly 
      ? `198.51.100.${Math.floor(Math.random() * 250)}` 
      : `192.168.1.${Math.floor(Math.random() * 250)}`;

    // Pass through detection engine to get risk score & analysis
    const analysis = DetectionEngine.analyze({
      sourceIP: srcIP,
      destinationIP: randomEp.ip,
      port: randomEvt.port,
      protocol: randomEvt.proto,
      failedLogins: randomEvt.type.includes('Brute') ? 8 : 1,
      requestCount: randomEvt.type.includes('Exfiltration') ? 450 : 20,
      country: randomCountry.name,
      eventType: randomEvt.type,
      endpoint: randomEp.name,
      user: randomEp.user
    });

    const newAlert = {
      id: Utils.generateID('ALT'),
      timestamp: new Date().toISOString(),
      sourceIp: srcIP,
      destinationIp: randomEp.ip,
      country: randomCountry.name,
      countryCode: randomCountry.code,
      eventType: randomEvt.type,
      category: randomEvt.cat,
      severity: analysis.severity,
      riskScore: analysis.riskScore,
      confidence: analysis.confidence,
      status: 'NEW',
      endpoint: randomEp.name,
      user: randomEp.user,
      protocol: randomEvt.proto,
      port: randomEvt.port,
      reasons: analysis.reasons,
      recommendation: analysis.recommendation
    };

    // Save alert to LocalStorage
    const alerts = StorageEngine.loadAlerts();
    alerts.unshift(newAlert);
    if (alerts.length > 200) alerts.pop();
    StorageEngine.saveAlerts(alerts);

    // Evaluate correlation rules
    CorrelationEngine.evaluateCorrelations();

    // Trigger page specific dynamic live updates if handler present
    if (window.onLiveEventGenerated) {
      window.onLiveEventGenerated(newAlert);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
